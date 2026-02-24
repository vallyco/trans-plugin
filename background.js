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
    "https://translate.googleapis.com/translate_a/single" +
    `?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error("Unexpected translation response");
  }

  const translatedText = data[0]
    .map((part) => (Array.isArray(part) ? part[0] : ""))
    .join("")
    .trim();

  if (!translatedText) {
    throw new Error("Empty translation result");
  }

  return translatedText;
}
