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
  const primaryUrl = "https://fanyi.youdao.com/translate";
  const primaryBody = new URLSearchParams({
    doctype: "json",
    type: "AUTO",
    i: text
  }).toString();
  const fallbackUrl =
    "https://dict.youdao.com/jsonapi" + `?q=${encodeURIComponent(text)}`;

  const errors = [];

  try {
    const primaryData = await requestJson(primaryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: primaryBody
    });
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

  try {
    const segmented = await translateBySegments(text);
    if (segmented) {
      return segmented;
    }
    errors.push("Segment translation returned empty translation");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Segment translation failed");
  }

  throw new Error(errors.join("; "));
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json, text/plain, */*",
      ...(options.headers || {})
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

async function translateBySegments(text) {
  const segments = splitTextForTranslation(text);
  if (segments.length <= 1) {
    return "";
  }

  const translated = [];
  for (const segment of segments) {
    const body = new URLSearchParams({
      doctype: "json",
      type: "AUTO",
      i: segment
    }).toString();
    const data = await requestJson("https://fanyi.youdao.com/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body
    });
    const chunk = extractPrimaryTranslation(data);
    if (!chunk) {
      throw new Error("One segment returned empty translation");
    }
    translated.push(chunk);
  }

  return translated.join("");
}

function splitTextForTranslation(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return [];
  }

  const MAX_LEN = 120;
  if (normalized.length <= MAX_LEN) {
    return [normalized];
  }

  const sentenceParts = normalized
    .split(/(?<=[.!?;:。！？；：])/)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks = [];
  for (const part of sentenceParts.length > 0 ? sentenceParts : [normalized]) {
    if (part.length <= MAX_LEN) {
      chunks.push(part);
      continue;
    }

    for (let i = 0; i < part.length; i += MAX_LEN) {
      chunks.push(part.slice(i, i + MAX_LEN));
    }
  }

  return chunks;
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
