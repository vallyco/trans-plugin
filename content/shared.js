// 模块说明：共享状态与全局命名空间
const tp = window.__tpTranslate || (window.__tpTranslate = {});

// 维护当前选中状态与 UI 实例
tp.state = {
  selectedText: "",
  selectedRect: null,
  dotEl: null,
  popupEl: null
};
