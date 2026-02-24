const form = document.getElementById("settings-form");
const appKeyInput = document.getElementById("app-key");
const appSecretInput = document.getElementById("app-secret");
const statusEl = document.getElementById("status");

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.classList.toggle("error", isError);
}

async function loadSettings() {
  try {
    const { youdaoAppKey = "", youdaoAppSecret = "" } = await chrome.storage.local.get([
      "youdaoAppKey",
      "youdaoAppSecret"
    ]);

    appKeyInput.value = youdaoAppKey;
    appSecretInput.value = youdaoAppSecret;
    setStatus(youdaoAppKey && youdaoAppSecret ? "已加载已保存配置" : "请填写并保存配置");
  } catch (_error) {
    setStatus("读取配置失败", true);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const appKey = appKeyInput.value.trim();
  const appSecret = appSecretInput.value.trim();

  if (!appKey || !appSecret) {
    setStatus("App Key 和 App Secret 不能为空", true);
    return;
  }

  try {
    await chrome.storage.local.set({
      youdaoAppKey: appKey,
      youdaoAppSecret: appSecret
    });
    setStatus("保存成功");
  } catch (_error) {
    setStatus("保存失败，请重试", true);
  }
});

loadSettings();
