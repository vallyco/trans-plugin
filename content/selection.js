// 模块说明：选区解析与位置计算
var tp = window.__tpTranslate || (window.__tpTranslate = {});

// 获取选区的最后一个矩形，用于定位尾部
tp.getSelectionRect = function getSelectionRect(selection) {
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const rects = range.getClientRects();
  if (rects.length > 0) {
    return rects[rects.length - 1];
  }

  const rect = range.getBoundingClientRect();
  return rect.width || rect.height ? rect : null;
};

// 读取当前选中文本与位置
tp.captureSelection = function captureSelection() {
  const selection = window.getSelection();
  const text = selection ? selection.toString().trim() : "";
  if (!text) {
    return { text: "", rect: null };
  }
  const rect = tp.getSelectionRect(selection);
  return { text, rect };
};

// 判断是否点击在插件 UI 内
tp.isInsideUi = function isInsideUi(target) {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(
    target.closest("#tp-translate-dot") || target.closest("#tp-translate-popup")
  );
};
