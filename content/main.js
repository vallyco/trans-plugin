// 模块说明：入口事件绑定
var tp = window.__tpTranslate || (window.__tpTranslate = {});

// 处理选区变化并显示小圆点
document.addEventListener("mouseup", (event) => {
  if (tp.isInsideUi(event.target)) {
    return;
  }

  const { text, rect } = tp.captureSelection();
  if (!text || !rect) {
    tp.state.selectedText = "";
    tp.removeDot();
    return;
  }

  tp.state.selectedText = text;
  tp.state.selectedRect = rect;
  tp.removePopup();
  tp.createDot(rect);
});

// 点击空白处清理 UI
document.addEventListener("mousedown", (event) => {
  if (tp.isInsideUi(event.target)) {
    return;
  }
  tp.clearUi();
});

tp.loadDotTheme();
