(() => {
  const DOT_ID = "tp-translate-dot";
  const POPUP_ID = "tp-translate-popup";
  const STYLE_LOADING = "tp-loading";
  let lastSelectionText = "";

  const getSelectionText = () => {
    const selection = window.getSelection();
    if (!selection) return "";
    return selection.toString().trim();
  };

  const getSelectionRect = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) return null;
    return rect;
  };

  const removeDot = () => {
    const existing = document.getElementById(DOT_ID);
    if (existing) existing.remove();
  };

  const removePopup = () => {
    const existing = document.getElementById(POPUP_ID);
    if (existing) existing.remove();
  };

  const createDot = (rect) => {
    removeDot();
    removePopup();

    const dot = document.createElement("button");
    dot.id = DOT_ID;
    dot.type = "button";
    dot.setAttribute("aria-label", "Translate selection");

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const top = rect.bottom + scrollY + 6;
    const left = rect.left + scrollX;

    dot.style.top = `${top}px`;
    dot.style.left = `${left}px`;

    dot.addEventListener("click", async (event) => {
      event.stopPropagation();
      dot.classList.add(STYLE_LOADING);
      const text = lastSelectionText;
      if (!text) {
        removeDot();
        return;
      }

      try {
        const translated = await translateText(text);
        removeDot();
        showPopup(translated, rect);
      } catch (err) {
        removeDot();
        showPopup("翻译失败，请重试。", rect, true);
      }
    });

    document.body.appendChild(dot);
  };

  const showPopup = (text, rect, isError = false) => {
    removePopup();

    const popup = document.createElement("div");
    popup.id = POPUP_ID;

    const header = document.createElement("div");
    header.className = "tp-popup-header";

    const title = document.createElement("div");
    title.className = "tp-popup-title";
    title.textContent = "翻译结果";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "tp-popup-close";
    closeBtn.textContent = "关闭";
    closeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      removePopup();
    });

    header.appendChild(title);
    header.appendChild(closeBtn);

    const content = document.createElement("div");
    content.className = "tp-popup-content";
    content.textContent = text;
    if (isError) content.classList.add("tp-popup-error");

    popup.appendChild(header);
    popup.appendChild(content);

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const top = rect.bottom + scrollY + 10;
    const left = rect.left + scrollX;

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;

    document.body.appendChild(popup);
  };

  const translateText = async (text) => {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", "auto");
    url.searchParams.set("tl", "zh-CN");
    url.searchParams.set("dt", "t");
    url.searchParams.set("q", text);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("translation_failed");
    }

    const data = await response.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      throw new Error("invalid_response");
    }

    return data[0].map((item) => item[0]).join("");
  };

  const handleSelection = () => {
    const text = getSelectionText();
    if (!text) {
      lastSelectionText = "";
      removeDot();
      return;
    }

    const rect = getSelectionRect();
    if (!rect) return;

    lastSelectionText = text;
    createDot(rect);
  };

  document.addEventListener("mouseup", () => {
    setTimeout(handleSelection, 0);
  });

  document.addEventListener("keyup", (event) => {
    if (event.key === "Shift" || event.key === "ArrowLeft" || event.key === "ArrowRight") {
      setTimeout(handleSelection, 0);
    }
  });

  document.addEventListener("scroll", () => {
    removeDot();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!target) return;
    if (target.id === DOT_ID || target.id === POPUP_ID) return;
    const popup = document.getElementById(POPUP_ID);
    if (popup && popup.contains(target)) return;
    removePopup();
  });
})();
