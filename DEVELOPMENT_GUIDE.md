# 开发规范与经验提炼

本文件整理了本项目的功能实现、关键决策与编码规范，便于后续维护与扩展。

## 功能范围

- 选中文本后在选区末尾显示小圆点
- 点击小圆点后立即弹出“翻译中...”提示
- 返回结果后展示翻译内容
- 单词显示多义项与美式音标
- 句子/多词显示整句翻译
- 弹窗在选区正下方居中，并具备边界自适应

## 主要模块与职责

- `content/shared.js`：共享状态（选中文本/位置、圆点与弹窗实例）
- `content/theme.js`：读取与应用圆点主题色（`chrome.storage.local`）
- `content/selection.js`：选区解析与末尾定位
- `content/ui.js`：UI 创建、交互、位置计算与弹窗展示
- `content/main.js`：事件绑定入口
- `background.js`：翻译服务编排与请求兜底
- `options.html` / `options.js`：配置页（appKey/appSecret/dotColor）

## 翻译链路与兜底策略

1. 单词优先词典：`dict.youdao.com/jsonapi`
2. 有道 OpenAPI：若配置了 `appKey/appSecret`
3. 有道网页接口：`fanyi.youdao.com/translate`
4. 分段翻译兜底：长句按标点和长度拆分
5. 全链路超时：每次请求 6s 超时

## 位置算法规则

- 小圆点：选区末尾下方（`rect.right`）
- 弹窗：选区中心点下方居中
- 视口边界：左右/上下超出时自动夹紧
- 靠右时左对齐：避免超出右侧视口

## UI 交互规范

- 点击圆点立即弹出“翻译中...”
- 请求完成后替换为结果
- 点击空白处关闭弹窗
- 点击圆点/弹窗不触发关闭逻辑

## 配置与存储规范

- 配置保存在 `chrome.storage.local`
- 配置项：
  - `youdaoAppKey`
  - `youdaoAppSecret`
  - `dotColor`
- 配置变更需实时生效（监听 `chrome.storage.onChanged`）

## 代码与提交规范

- 模块拆分：按“状态/主题/选区/UI/入口/后台”拆分
- 方法注释：中文注释，描述方法职责
- 提交信息：使用真实改动描述，避免泛化
- 交付流程：每次变更完成后必须执行 `git add`、`git commit`、`git push`

## 维护建议

- 新增能力先考虑模块归属，再扩展接口
- 网络错误要给出明确提示并保留超时
- 与 UI 相关的改动需检查位置边界与可视性
