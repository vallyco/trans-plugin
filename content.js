let selectedText = "";
let translateDot = null;
let translatePopup = null;
let selectedRect = null;

const DEFAULT_DOT_COLOR = "#2b2b2b";
const DEFAULT_DOT_RING = "#ffffff";
const DEFAULT_DOT_RING_STRONG = "rgba(255, 255, 255, 0.12)";
const DEFAULT_DOT_RING_PULSE = "rgba(255, 255, 255, 0.14)";

function removeDot() {
  if (translateDot) {
    translateDot.remove();
    translateDot = null;
  }
}

function removePopup() {
  if (translatePopup) {
    translatePopup.remove();
    translatePopup = null;
  }
}

function clearUi() {
  removeDot();
  removePopup();
}

async function loadDotTheme() {
  try {
    const { dotColor, dotRing } = await chrome.storage.local.get([
      "dotColor",
      "dotRing"
    ]);
    applyDotTheme(dotColor, dotRing);
  } catch (_error) {
    applyDotTheme();
  }
}

function applyDotTheme(dotColor = DEFAULT_DOT_COLOR, dotRing = DEFAULT_DOT_RING) {
  const root = document.documentElement;
  const ringRgb = parseHexColor(dotRing) || { r: 255, g: 255, b: 255 };
  root.style.setProperty("--tp-dot-color", dotColor || DEFAULT_DOT_COLOR);
  root.style.setProperty("--tp-dot-ring", rgba(ringRgb, 0.08));
  root.style.setProperty("--tp-dot-ring-strong", rgba(ringRgb, 0.12));
  root.style.setProperty("--tp-dot-ring-pulse", rgba(ringRgb, 0.18));
}

function parseHexColor(value) {
  if (typeof value !== "string") {
    return null;
  }
  const hex = value.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return null;
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return { r, g, b };
}

function rgba(color, alpha) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }
  if (changes.dotColor || changes.dotRing) {
    const dotColor = changes.dotColor?.newValue;
    const dotRing = changes.dotRing?.newValue;
    applyDotTheme(dotColor, dotRing);
  }
});

function getSelectionRect(selection) {
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const fallbackRects = range.getClientRects();
  if (fallbackRects.length > 0) {
    return fallbackRects[fallbackRects.length - 1];
  }

  const rect = range.getBoundingClientRect();
  if (rect.width || rect.height) {
    return rect;
  }

  return null;
}

function createDot(rect) {
  removeDot();

  const dot = document.createElement("button");
  dot.id = "tp-translate-dot";
  dot.type = "button";
  dot.title = "Translate to Chinese";

  const top = window.scrollY + rect.bottom + 8;
  const left = window.scrollX + rect.right - 7;

  dot.style.top = `${top}px`;
  dot.style.left = `${Math.max(window.scrollX + 8, left)}px`;

  dot.addEventListener("mousedown", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  dot.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!selectedText) {
      clearUi();
      return;
    }

    dot.classList.add("tp-loading");

    const popupTop = selectedRect
      ? window.scrollY + selectedRect.bottom + 4
      : window.scrollY + rect.bottom + 4;
    const popupAnchorX = selectedRect
      ? window.scrollX + selectedRect.left + selectedRect.width / 2
      : window.scrollX + rect.left + rect.width / 2;

    removeDot();

    try {
      const response = await chrome.runtime.sendMessage({
        type: "translate",
        text: selectedText
      });

      if (!response?.ok) {
        throw new Error(response?.error || "Translation failed");
      }

      showPopup(response.translatedText, popupTop, popupAnchorX, false);
    } catch (error) {
      showPopup(
        error instanceof Error ? error.message : "Translation failed",
        popupTop,
        popupAnchorX,
        true
      );
    }
  });

  document.body.appendChild(dot);
  translateDot = dot;
}

function showPopup(content, top, anchorX, isError) {
  removePopup();

  const popup = document.createElement("div");
  popup.id = "tp-translate-popup";
  popup.style.top = `${top}px`;
  popup.style.left = `${Math.max(window.scrollX + 8, anchorX - 140)}px`;

  popup.innerHTML = `
    <div class="tp-popup-header">
      <span class="tp-popup-title">翻译结果</span>
    </div>
    <div class="tp-popup-content ${isError ? "tp-popup-error" : ""}"></div>
  `;

  const contentEl = popup.querySelector(".tp-popup-content");
  if (contentEl) {
    contentEl.textContent = content;
  }

  popup.addEventListener("mousedown", (event) => {
    event.stopPropagation();
  });

  document.body.appendChild(popup);
  translatePopup = popup;

  const popupRect = popup.getBoundingClientRect();
  const centeredLeft = anchorX - popupRect.width / 2;
  popup.style.left = `${Math.max(window.scrollX + 8, centeredLeft)}px`;
}

document.addEventListener("mouseup", (event) => {
  const target = event.target;
  if (target instanceof Element) {
    const clickedDot = target.closest("#tp-translate-dot");
    const clickedPopup = target.closest("#tp-translate-popup");
    if (clickedDot || clickedPopup) {
      return;
    }
  }

  const selection = window.getSelection();
  const text = selection ? selection.toString().trim() : "";

  if (!text) {
    selectedText = "";
    removeDot();
    return;
  }

  const rect = getSelectionRect(selection);
  if (!rect) {
    return;
  }

  selectedText = text;
  selectedRect = rect;
  removePopup();
  createDot(rect);
});

document.addEventListener("mousedown", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    clearUi();
    return;
  }

  const clickedDot = target.closest("#tp-translate-dot");
  const clickedPopup = target.closest("#tp-translate-popup");
  if (!clickedDot && !clickedPopup) {
    clearUi();
  }
});

loadDotTheme();
