// 模块说明：设置页逻辑（配置读写）
// 读取表单控件
const form = document.getElementById("settings-form");
const appKeyInput = document.getElementById("app-key");
const appSecretInput = document.getElementById("app-secret");
const dotColorInput = document.getElementById("dot-color");
const statusEl = document.getElementById("status");

const DEFAULT_DOT_COLOR = "#2b2b2b";

// 更新保存状态提示
function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.classList.toggle("error", isError);
}

// 从本地存储加载配置
async function loadSettings() {
  try {
    const {
      youdaoAppKey = "",
      youdaoAppSecret = "",
      dotColor = DEFAULT_DOT_COLOR
    } = await chrome.storage.local.get([
      "youdaoAppKey",
      "youdaoAppSecret",
      "dotColor"
    ]);

    appKeyInput.value = youdaoAppKey;
    appSecretInput.value = youdaoAppSecret;
    dotColorInput.value = dotColor || DEFAULT_DOT_COLOR;
    setStatus(youdaoAppKey && youdaoAppSecret ? "已加载已保存配置" : "请填写并保存配置");
  } catch (_error) {
    setStatus("读取配置失败", true);
  }
}

// 保存配置到本地存储
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const appKey = appKeyInput.value.trim();
  const appSecret = appSecretInput.value.trim();
  const dotColor = dotColorInput.value || DEFAULT_DOT_COLOR;

  try {
    await chrome.storage.local.set({
      youdaoAppKey: appKey,
      youdaoAppSecret: appSecret,
      dotColor
    });
    setStatus("保存成功");
  } catch (_error) {
    setStatus("保存失败，请重试", true);
  }
});

loadSettings();
