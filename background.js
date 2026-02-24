chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "translate" || !message.text) {
    return false;
  }

  translateToChinese(message.text)
    .then((translatedText) => {
      sendResponse({ ok: true, translatedText });
    })
    .catch((error) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : "Translation failed"
      });
    });

  return true;
});

async function translateToChinese(text) {
  const primaryUrl =
    "https://fanyi.youdao.com/translate" +
    `?doctype=json&type=AUTO&i=${encodeURIComponent(text)}`;
  const fallbackUrl =
    "https://dict.youdao.com/jsonapi" + `?q=${encodeURIComponent(text)}`;

  const errors = [];

  try {
    const primaryData = await requestJson(primaryUrl);
    const primaryText = extractPrimaryTranslation(primaryData);
    if (primaryText) {
      return primaryText;
    }
    errors.push("Primary endpoint returned empty translation");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Primary endpoint failed");
  }

  try {
    const fallbackData = await requestJson(fallbackUrl);
    const fallbackText = extractFallbackTranslation(fallbackData);
    if (fallbackText) {
      return fallbackText;
    }
    errors.push("Fallback endpoint returned empty translation");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Fallback endpoint failed");
  }

  throw new Error(errors.join("; "));
}

async function requestJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const raw = await response.text();
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith("<")) {
    throw new Error("Endpoint returned non-JSON response");
  }

  try {
    return JSON.parse(trimmed);
  } catch (_error) {
    throw new Error("Endpoint returned invalid JSON");
  }
}

function extractPrimaryTranslation(data) {
  if (!data || !Array.isArray(data.translateResult)) {
    return "";
  }

  return data.translateResult
    .flat()
    .map((part) => (part && typeof part.tgt === "string" ? part.tgt : ""))
    .join("")
    .trim();
}

function extractFallbackTranslation(data) {
  if (data?.fanyi && typeof data.fanyi.tran === "string") {
    return data.fanyi.tran.trim();
  }

  if (Array.isArray(data?.ec?.word)) {
    const trans = data.ec.word
      .flatMap((item) => item?.trs || [])
      .flatMap((item) => item?.tr || [])
      .map((item) => item?.l?.i?.[0])
      .filter((item) => typeof item === "string")
      .join("；")
      .trim();
    if (trans) {
      return trans;
    }
  }

  return "";
}
