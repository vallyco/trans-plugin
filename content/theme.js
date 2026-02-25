// 模块说明：主题配置（小圆点颜色）
const tp = window.__tpTranslate || (window.__tpTranslate = {});

const DEFAULT_DOT_COLOR = "#2b2b2b";

// 应用小圆点配色
tp.applyDotTheme = function applyDotTheme(dotColor = DEFAULT_DOT_COLOR) {
  const root = document.documentElement;
  root.style.setProperty("--tp-dot-color", dotColor || DEFAULT_DOT_COLOR);
};

// 从本地存储加载配色
tp.loadDotTheme = async function loadDotTheme() {
  try {
    const { dotColor } = await chrome.storage.local.get(["dotColor"]);
    tp.applyDotTheme(dotColor);
  } catch (_error) {
    tp.applyDotTheme();
  }
};

// 监听配置变化并实时更新
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }
  if (changes.dotColor) {
    tp.applyDotTheme(changes.dotColor?.newValue);
  }
});
