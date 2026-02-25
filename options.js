const form = document.getElementById("settings-form");
const appKeyInput = document.getElementById("app-key");
const appSecretInput = document.getElementById("app-secret");
const dotColorInput = document.getElementById("dot-color");
const dotRingInput = document.getElementById("dot-ring");
const statusEl = document.getElementById("status");

const DEFAULT_DOT_COLOR = "#2b2b2b";
const DEFAULT_DOT_RING = "#ffffff";

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.classList.toggle("error", isError);
}

async function loadSettings() {
  try {
    const {
      youdaoAppKey = "",
      youdaoAppSecret = "",
      dotColor = DEFAULT_DOT_COLOR,
      dotRing = DEFAULT_DOT_RING
    } = await chrome.storage.local.get([
      "youdaoAppKey",
      "youdaoAppSecret",
      "dotColor",
      "dotRing"
    ]);

    appKeyInput.value = youdaoAppKey;
    appSecretInput.value = youdaoAppSecret;
    dotColorInput.value = dotColor || DEFAULT_DOT_COLOR;
    dotRingInput.value = dotRing || DEFAULT_DOT_RING;
    setStatus(youdaoAppKey && youdaoAppSecret ? "已加载已保存配置" : "请填写并保存配置");
  } catch (_error) {
    setStatus("读取配置失败", true);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const appKey = appKeyInput.value.trim();
  const appSecret = appSecretInput.value.trim();
  const dotColor = dotColorInput.value || DEFAULT_DOT_COLOR;
  const dotRing = dotRingInput.value || DEFAULT_DOT_RING;

  if (!appKey || !appSecret) {
    setStatus("App Key 和 App Secret 不能为空", true);
    return;
  }

  try {
    await chrome.storage.local.set({
      youdaoAppKey: appKey,
      youdaoAppSecret: appSecret,
      dotColor,
      dotRing
    });
    setStatus("保存成功");
  } catch (_error) {
    setStatus("保存失败，请重试", true);
  }
});

loadSettings();
