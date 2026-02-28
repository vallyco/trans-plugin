// 模块说明：UI 创建与交互（小圆点 / 弹窗）
var tp = window.__tpTranslate || (window.__tpTranslate = {});

// 移除小圆点
tp.removeDot = function removeDot() {
  if (tp.state.dotEl) {
    tp.state.dotEl.remove();
    tp.state.dotEl = null;
  }
};

// 移除弹窗
tp.removePopup = function removePopup() {
  if (tp.state.popupEl) {
    tp.state.popupEl.remove();
    tp.state.popupEl = null;
  }
};

// 清理所有 UI
tp.clearUi = function clearUi() {
  tp.removeDot();
  tp.removePopup();
};

// 显示翻译弹窗
tp.showPopup = function showPopup(content, top, anchorX, anchorTop, isError) {
  tp.removePopup();

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
  tp.state.popupEl = popup;

  const popupRect = popup.getBoundingClientRect();
  const viewportLeft = window.scrollX + 8;
  const viewportRight = window.scrollX + window.innerWidth - 8;
  const viewportTop = window.scrollY + 8;
  const viewportBottom = window.scrollY + window.innerHeight - 8;

  const centeredLeft = anchorX - popupRect.width / 2;
  const clampedLeft = Math.min(
    Math.max(centeredLeft, viewportLeft),
    viewportRight - popupRect.width
  );
  popup.style.left = `${clampedLeft}px`;

  const desiredBottom = top + popupRect.height;
  if (desiredBottom > viewportBottom && anchorTop) {
    const aboveTop = anchorTop - popupRect.height - 6;
    if (aboveTop >= viewportTop) {
      popup.style.top = `${aboveTop}px`;
    } else {
      const clampedTop = Math.min(
        Math.max(top, viewportTop),
        viewportBottom - popupRect.height
      );
      popup.style.top = `${clampedTop}px`;
    }
  }
};

// 创建小圆点并绑定点击逻辑
tp.createDot = function createDot(rect) {
  tp.removeDot();

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

    if (!tp.state.selectedText) {
      tp.clearUi();
      return;
    }

    dot.classList.add("tp-loading");

    const rectForPopup = tp.state.selectedRect || rect;
    const popupTop = window.scrollY + rectForPopup.bottom + 4;
    const popupAnchorX = window.scrollX + rectForPopup.left + rectForPopup.width / 2;
    const popupAnchorTop = window.scrollY + rectForPopup.top;

    tp.removeDot();
    tp.showPopup("翻译中...", popupTop, popupAnchorX, false);

    try {
      const response = await chrome.runtime.sendMessage({
        type: "translate",
        text: tp.state.selectedText
      });

      if (!response?.ok) {
        throw new Error(response?.error || "Translation failed");
      }

      tp.showPopup(response.translatedText, popupTop, popupAnchorX, popupAnchorTop, false);
    } catch (error) {
      tp.showPopup(
        error instanceof Error ? error.message : "Translation failed",
        popupTop,
        popupAnchorX,
        popupAnchorTop,
        true
      );
    }
  });

  document.body.appendChild(dot);
  tp.state.dotEl = dot;
};
