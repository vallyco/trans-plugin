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
  const url =
    "https://fanyi.youdao.com/translate" +
    `?doctype=json&type=AUTO&i=${encodeURIComponent(text)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.translateResult)) {
    throw new Error("Unexpected translation response");
  }

  const translatedText = data.translateResult
    .flat()
    .map((part) => (part && typeof part.tgt === "string" ? part.tgt : ""))
    .join("")
    .trim();

  if (!translatedText) {
    throw new Error("Empty translation result");
  }

  return translatedText;
}
