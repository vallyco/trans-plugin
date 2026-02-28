# 文本选择翻译插件

一个 Chrome 浏览器插件：选中文本后翻译成中文，单词会展示多义项释义。

## 功能

- 选中文本后在末尾出现小圆点
- 点击小圆点进行翻译
- 单词选择展示多义项释义
- 多词/句子展示整句翻译
- 弹窗在选区正下方居中
- 支持所有网页

## 安装

1. 克隆或下载本仓库
2. 打开 Chrome，访问 `chrome://extensions`
3. 打开右上角“开发者模式”
4. 点击“加载已解压的扩展程序”，选择本目录

## 配置（有道 OpenAPI）

国内稳定可用建议配置有道 OpenAPI：

1. 在有道智云创建应用并获取 `appKey` / `appSecret`
2. 打开 `chrome://extensions`，找到该插件，点击“详情”
3. 打开“扩展程序选项”
4. 填写 `App Key` 与 `App Secret`，点击保存

未配置密钥时会回退到网页接口，可能不稳定。

## 使用

1. 在网页上选择单词或句子
2. 点击选区末尾的小圆点
3. 弹窗在选区下方显示结果
4. 点击空白处关闭弹窗

## 工作原理

- 内容脚本监听选区并渲染圆点与弹窗
- 后台服务调用有道 OpenAPI 或回退接口
- 单词显示多义项释义，句子显示翻译结果

## 运行流程

```
用户选择文本
  -> content/main.js 监听 mouseup
  -> content/selection.js 返回最后一个 rect 和文本
  -> content/ui.js 在选区末尾渲染圆点
  -> 用户点击圆点
  -> content/ui.js 发送消息给 background.js
  -> background.js 选择词典/翻译路线
  -> 结果返回 content/ui.js
  -> 弹窗在选区下方显示
```

## 文件结构

- `manifest.json`: 扩展配置与权限
- `content/shared.js`: 共享状态
- `content/theme.js`: 圆点主题配置
- `content/selection.js`: 选区获取与定位
- `content/ui.js`: 圆点与弹窗 UI
- `content/main.js`: 事件绑定入口
- `background.js`: 翻译/词典请求
- `styles.css`: 圆点与弹窗样式
- `options.html`: 配置页 UI
- `options.js`: 配置页逻辑
- `DEVELOPMENT_GUIDE.md`: 开发规范与经验提炼

## 隐私

插件不收集或存储个人数据。配置项保存在本地 `chrome.storage.local`。

## 许可证

MIT
