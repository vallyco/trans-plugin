let selectedText = "";
let translateDot = null;
let translatePopup = null;
let selectedRect = null;

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
  const left = window.scrollX + rect.right + 6;

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
    const popupLeft = selectedRect
      ? window.scrollX + selectedRect.right + 6
      : window.scrollX + rect.right + 6;

    removeDot();

    try {
      const response = await chrome.runtime.sendMessage({
        type: "translate",
        text: selectedText
      });

      if (!response?.ok) {
        throw new Error(response?.error || "Translation failed");
      }

      showPopup(response.translatedText, popupTop, popupLeft, false);
    } catch (error) {
      showPopup(
        error instanceof Error ? error.message : "Translation failed",
        popupTop,
        popupLeft,
        true
      );
    }
  });

  document.body.appendChild(dot);
  translateDot = dot;
}

function showPopup(content, top, left, isError) {
  removePopup();

  const popup = document.createElement("div");
  popup.id = "tp-translate-popup";
  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;

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
