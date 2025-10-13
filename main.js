const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");

const BASE_URL = "http://172.25.4.22";
let sessionCookie = null;
let mainWindow;

// --- KONFIGURASI LOGIN ---
const LOGIN_CONFIG = {
  username: "admin",
  password: "admin",
  loginPath: "/login.cgi"
};

// --- MD5 HMAC FUNCTIONS ---
function hex_hmac_md5(key, data) {
  const hmac = crypto.createHmac("md5", key);
  hmac.update(data);
  return hmac.digest("hex").toUpperCase();
}

// --- BUAT WINDOW ---
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile("status.html");
}

// --- AUTO LOGIN ---
async function doLogin() {
  const http = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    maxRedirects: 5,
    validateStatus: () => true,
  });

  const loginPageResponse = await http.get("/login.html");
  const loginPageHtml = loginPageResponse.data;

  const locationIDMatch = loginPageHtml.match(/name="locationID"[^>]*value="([^"]+)"/);
  const tempSessionIDMatch = loginPageHtml.match(/name="tempSessionID"[^>]*value="([^"]+)"/);

  if (!locationIDMatch || !tempSessionIDMatch) {
    throw new Error("Tidak menemukan locationID / tempSessionID");
  }

  const locationID = locationIDMatch[1];
  const tempSessionID = tempSessionIDMatch[1];

  const innerHash = hex_hmac_md5(locationID, LOGIN_CONFIG.password);
  const finalHash = hex_hmac_md5(tempSessionID, innerHash);

  const cookieJar = `SessionID=${tempSessionID}`;
  const loginData = new URLSearchParams();
  loginData.append("query_name", "logon");
  loginData.append("username", LOGIN_CONFIG.username);
  loginData.append("password", "");
  loginData.append("locationID", locationID);
  loginData.append("tempSessionID", tempSessionID);
  loginData.append("hash", finalHash);

  const loginResponse = await http.post(LOGIN_CONFIG.loginPath, loginData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieJar,
    },
    maxRedirects: 0,
    validateStatus: (s) => s >= 200 && s < 400,
  });

  let cookies = loginResponse.headers["set-cookie"];
  if (cookies && cookies.length > 0) {
    const sessionCookieRaw = cookies.find((c) => c.includes("SessionID="));
    if (sessionCookieRaw) {
      sessionCookie = sessionCookieRaw.split(";")[0];
      return sessionCookie;
    }
  }

  sessionCookie = cookieJar;
  return sessionCookie;
}

// --- DOWNLOAD FUNCTION ---
async function downloadLogs(logType) {
  if (!sessionCookie) throw new Error("Belum login!");

  const http = axios.create({ baseURL: BASE_URL, timeout: 10000 });
  const logMap = {
    system: { path: "/diagnostics_system_log.html", kind: "errlog" },
    config: { path: "/diagnostics_configuration_log.html", kind: "usrlog" },
    data: { path: "/diagnostics_data_log.html", kind: "reclog" },
  };

  const { path: basePath, kind } = logMap[logType];
  let allLogs = "";
  let page = 1;
  let lastLogText = "";

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yy = String(today.getFullYear()).slice(-2);
  const todayPrefix = `${mm}-${dd}-${yy}`;
  const folderName = today.toISOString().slice(0, 10);
  const logsDir = path.join(app.getPath("desktop"), "Logs", folderName);

  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

  while (true) {
    const url = `${basePath}?kind=${kind}&page=${page}`;
    const res = await http.get(url, { headers: { Cookie: sessionCookie } });
    const html = res.data.toString();

    if (html.toLowerCase().includes("login.html")) break;
    const match = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    if (!match) break;

    let logText = match[1].trim().replace(/<[^>]+>/g, "");
    if (logText.length === 0 || logText === lastLogText) break;

    const filteredLines = logText
      .split("\n")
      .filter((line) => line.startsWith(todayPrefix));

    if (filteredLines.length > 0) {
      allLogs += `\n--- Page ${page} ---\n${filteredLines.join("\n")}\n`;
    }

    lastLogText = logText;
    page++;
  }

  const filePath = path.join(logsDir, `${logType}.log`);
  fs.appendFileSync(filePath, allLogs || "\nTidak ada log baru.\n", "utf8");
  return filePath;
}

// --- IPC UNTUK UI ---
ipcMain.handle("start-download", async () => {
  try {
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

// --- APP START ---
app.on("ready", createWindow);
