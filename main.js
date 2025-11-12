const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");

let BASE_URL = "";
let sessionCookie = null;

// === Fungsi: Baca IP dari file ip.txt ===
function getIpFromFile() {
  try {
    const ipFile = path.join(process.cwd(), "ip.txt");
    if (!fs.existsSync(ipFile)) {
      throw new Error("File ip.txt tidak ditemukan!");
    }
    const content = fs.readFileSync(ipFile, "utf8").trim();
    const match = content.match(/ip[:=]\s*([\d.]+)/i);
    if (!match) {
      throw new Error("Format ip.txt salah! Gunakan ip=172.25.4.xx");
    }
    const ip = match[1];
    console.log("📡 IP dari file:", ip);
    return `http://${ip}`;
  } catch (err) {
    throw err;
  }
}

// === Login ===
async function doLogin() {
  const LOGIN_CONFIG = {
    username: "admin",
    password: "admin",
    loginPath: "/login.cgi",
  };

  const http = axios.create({ baseURL: BASE_URL, timeout: 15000 });
  console.log("🔐 Mencoba login...");

  const loginPage = await http.get("/login.html");
  const html = loginPage.data;
  const loc = html.match(/name="locationID"[^>]*value="([^"]+)"/);
  const tmp = html.match(/name="tempSessionID"[^>]*value="([^"]+)"/);
  if (!loc || !tmp) throw new Error("Token login tidak ditemukan!");

  const locationID = loc[1];
  const tempSessionID = tmp[1];

  const innerHash = crypto.createHmac("md5", locationID).update(LOGIN_CONFIG.password).digest("hex").toUpperCase();
  const finalHash = crypto.createHmac("md5", tempSessionID).update(innerHash).digest("hex").toUpperCase();

  const cookie = `SessionID=${tempSessionID}`;
  const data = new URLSearchParams({
    query_name: "logon",
    username: LOGIN_CONFIG.username,
    password: "",
    locationID,
    tempSessionID,
    hash: finalHash,
  });

  const res = await http.post(LOGIN_CONFIG.loginPath, data, {
    headers: { Cookie: cookie, "Content-Type": "application/x-www-form-urlencoded" },
  });

  const cookies = res.headers["set-cookie"];
  if (cookies) {
    const found = cookies.find(c => c.includes("SessionID="));
    if (found) {
      sessionCookie = found.split(";")[0];
      console.log("✅ Login sukses! Cookie:", sessionCookie);
      return sessionCookie;
    }
  }
  sessionCookie = cookie;
  console.log("✅ Cookie sementara digunakan:", cookie);
  return cookie;
}

// === Download logs ===
async function downloadLogs(type) {
  const http = axios.create({ baseURL: BASE_URL, timeout: 10000 });
  const map = {
    system: { path: "/diagnostics_system_log.html", kind: "errlog" },
    config: { path: "/diagnostics_configuration_log.html", kind: "usrlog" },
    data: { path: "/diagnostics_data_log.html", kind: "reclog" },
  };
  const { path: p, kind } = map[type];

  const today = new Date();
  const todayPrefix = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}-${String(today.getFullYear()).slice(-2)}`;
  const folderName = today.toISOString().slice(0, 10);
  const logsDir = path.join(app.getPath("desktop"), "Logs", folderName);
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

  let page = 1;
  let allLogs = "";
  let lastLog = "";
  while (true) {
    const url = `${p}?kind=${kind}&page=${page}`;
    const res = await http.get(url, { headers: { Cookie: sessionCookie } });
    const html = res.data.toString();
    if (html.toLowerCase().includes("login.html")) break;

    const match = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    if (!match) break;
    const logText = match[1].trim().replace(/<[^>]+>/g, "");
    if (!logText || logText === lastLog) break;

    const filtered = logText.split("\n").filter(line => line.startsWith(todayPrefix));
    if (filtered.length > 0) allLogs += `\n--- Page ${page} ---\n${filtered.join("\n")}\n`;
    lastLog = logText;
    page++;
  }

  const filePath = path.join(logsDir, `${type}.log`);
  fs.writeFileSync(filePath, allLogs || "Tidak ada log baru hari ini.\n", "utf8");
  console.log(`✅ ${type} log saved:`, filePath);
  return filePath;
}

// === IPC: Start Download ===
ipcMain.handle("start-download", async () => {
  try {
    BASE_URL = getIpFromFile();
    const cookie = await doLogin();
    const files = {
      system: await downloadLogs("system"),
      config: await downloadLogs("config"),
      data: await downloadLogs("data"),
    };
    return { success: true, cookie, files };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// === BUAT JENDELA ===
function createWindow() {
  const win = new BrowserWindow({
    width: 850,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // biar window.require("electron") bisa dipakai di status.html
    },
  });

  win.loadFile("status.html");
}

// === APP ===
app.whenReady().then(() => {
  createWindow();
});
