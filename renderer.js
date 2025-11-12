const { ipcRenderer } = require("electron");

// tombol login
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    document.getElementById("status").innerText = "Sedang login...";
    const result = await ipcRenderer.invoke("do-login");
    if (result.success) {
      document.getElementById("status").innerText =
        "Login berhasil, membuka halaman download...";
    } else {
      document.getElementById("status").innerText =
        "Login gagal: " + result.error;
    }
  });
}

// tombol download
const downloadBtn = document.getElementById("downloadBtn");
if (downloadBtn) {
  downloadBtn.addEventListener("click", async () => {
    const logType = document.getElementById("logType").value;
    document.getElementById("status").innerText = "Sedang download...";
    const result = await ipcRenderer.invoke("download-logs", logType);

    if (result.success) {
      document.getElementById("status").innerText =
        "Log berhasil disimpan ke: " + result.filePath;
    } else {
      document.getElementById("status").innerText =
        "Download gagal: " + result.error;
    }
  });
}
