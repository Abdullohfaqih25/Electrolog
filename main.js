const { app } = require("electron");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");

const BASE_URL = "http://172.25.4.12";
let sessionCookie = null;

// --- KONFIGURASI LOGIN ---
const LOGIN_CONFIG = {
  username: "admin", // Username ElectroLogIXS
  password: "admin", // Password ElectroLogIXS
  loginPath: "/login.cgi" // Endpoint login CGI
};

// --- MD5 HMAC FUNCTIONS (sama seperti di login.html) ---
function hex_hmac_md5(key, data) {
  const hmac = crypto.createHmac('md5', key);
  hmac.update(data);
  return hmac.digest('hex').toUpperCase();
}

// --- AUTO LOGIN DENGAN COOKIE EXTRACTION ---
async function doLogin() {
  try {
    console.log("🔐 Mencoba login otomatis...");
    
    const http = axios.create({ 
      baseURL: BASE_URL, 
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: () => true
    });

    // LANGKAH 1: Ambil halaman login untuk mendapatkan hidden fields
    console.log("📡 Mengambil halaman login untuk mendapatkan token...");
    const loginPageResponse = await http.get("/login.html");
    const loginPageHtml = loginPageResponse.data;

    // Extract hidden fields dari HTML
    const locationIDMatch = loginPageHtml.match(/name="locationID"[^>]*value="([^"]+)"/);
    const tempSessionIDMatch = loginPageHtml.match(/name="tempSessionID"[^>]*value="([^"]+)"/);

    if (!locationIDMatch || !tempSessionIDMatch) {
      throw new Error("Tidak dapat menemukan locationID atau tempSessionID di halaman login");
    }

    const locationID = locationIDMatch[1];
    const tempSessionID = tempSessionIDMatch[1];

    console.log("🔑 locationID:", locationID);
    console.log("🔑 tempSessionID:", tempSessionID);

    // LANGKAH 2: Hash password seperti yang dilakukan JavaScript di browser
    const innerHash = hex_hmac_md5(locationID, LOGIN_CONFIG.password);
    const finalHash = hex_hmac_md5(tempSessionID, innerHash);

    console.log("🔐 Password hash:", finalHash);

    // LANGKAH 2.5: Set cookie SessionID = tempSessionID (PENTING!)
    const cookieJar = `SessionID=${tempSessionID}`;
    console.log("🍪 Setting cookie:", cookieJar);

    // LANGKAH 3: POST login dengan data yang benar (urutan penting!)
    console.log("📡 Mengirim login request...");
    const loginData = new URLSearchParams();
    loginData.append('query_name', 'logon');
    loginData.append('username', LOGIN_CONFIG.username);
    loginData.append('password', ''); // Kosong seperti browser
    loginData.append('locationID', locationID);
    loginData.append('tempSessionID', tempSessionID);
    loginData.append('hash', finalHash);

    console.log("📦 Data yang dikirim:", loginData.toString());

    const loginResponse = await http.post(LOGIN_CONFIG.loginPath, loginData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': BASE_URL + '/login.html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Origin': BASE_URL,
        'Cookie': cookieJar // PENTING: Kirim cookie SessionID = tempSessionID
      },
      maxRedirects: 0, // Jangan follow redirect otomatis
      validateStatus: (status) => status >= 200 && status < 400
    });

    console.log("📊 Response status:", loginResponse.status);
    console.log("📊 Response headers:", JSON.stringify(loginResponse.headers, null, 2));

    // Extract cookie dari response pertama
    let cookies = loginResponse.headers['set-cookie'];
    console.log("🍪 Cookies dari login response:", cookies || 'tidak ada');
    
    // Cek apakah ada redirect
    const redirectUrl = loginResponse.headers['location'] || 
                       (loginResponse.headers['refresh'] && loginResponse.headers['refresh'].match(/URL=(.+)/)?.[1]);
    
    if (redirectUrl) {
      console.log("🔄 Redirect ke:", redirectUrl);
      
      // Follow redirect dengan cookie tempSessionID
      const redirectResponse = await http.get(redirectUrl, {
        headers: { 
          'Cookie': cookieJar,
          'Referer': BASE_URL + '/login.cgi'
        }
      });
      
      console.log("📊 Redirect response status:", redirectResponse.status);
      console.log("📊 Redirect response headers:", JSON.stringify(redirectResponse.headers, null, 2));
      
      const redirectCookies = redirectResponse.headers['set-cookie'];
      console.log("🍪 Cookies dari redirect:", redirectCookies || 'tidak ada');
      
      if (redirectCookies) {
        cookies = redirectCookies;
      }
      
      // Cek apakah perlu follow redirect lagi
      const redirect2Url = redirectResponse.headers['location'] || 
                          (redirectResponse.headers['refresh'] && redirectResponse.headers['refresh'].match(/URL=(.+)/)?.[1]);
      
      if (redirect2Url) {
        console.log("🔄 Redirect kedua ke:", redirect2Url);
        const redirect2Response = await http.get(redirect2Url, {
          headers: { 
            'Cookie': cookieJar,
            'Referer': BASE_URL + redirectUrl
          }
        });
        
        console.log("📊 Redirect 2 response status:", redirect2Response.status);
        const redirect2Cookies = redirect2Response.headers['set-cookie'];
        console.log("🍪 Cookies dari redirect 2:", redirect2Cookies || 'tidak ada');
        
        if (redirect2Cookies) {
          cookies = redirect2Cookies;
        }
      }
    }

    if (cookies && cookies.length > 0) {
      console.log("🍪 Final cookies:", cookies);
      const sessionCookieRaw = cookies.find(c => c.includes('SessionID='));
      if (sessionCookieRaw) {
        sessionCookie = sessionCookieRaw.split(';')[0];
        console.log("✅ Login sukses! Cookie:", sessionCookie);
        return true;
      }
    }

    // Cookie mungkin masih pakai tempSessionID yang kita kirim
    console.log("💡 Cookie mungkin sudah valid dari tempSessionID...");
    sessionCookie = cookieJar;
    console.log("✅ Menggunakan cookie:", sessionCookie);
    return true;

  } catch (error) {
    console.error("❌ Login error:", error.message);
    throw error;
  }
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

  if (!logMap[logType]) throw new Error("Jenis log tidak dikenal!");
  const { path: basePath, kind } = logMap[logType];

  let allLogs = "";
  let page = 1;
  let lastLogText = "";

  // 🔎 Format tanggal hari ini (MM-DD-YY)
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yy = String(today.getFullYear()).slice(-2);
  const todayPrefix = `${mm}-${dd}-${yy}`;

  // 🔎 Folder harian (YYYY-MM-DD)
  const folderName = today.toISOString().slice(0, 10);
  const logsDir = path.join(app.getPath("desktop"), "Logs", folderName);

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  while (true) {
    const url = `${basePath}?kind=${kind}&page=${page}`;
    console.log("Fetching:", url);

    try {
      const res = await http.get(url, { headers: { Cookie: sessionCookie } });
      const html = res.data.toString();

      if (html.toLowerCase().includes("login.html")) {
        console.log("⚠️ Session expired → stop.");
        break;
      }

      const match = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
      if (!match) break;

      let logText = match[1].trim().replace(/<[^>]+>/g, "");
      if (logText.length === 0 || logText === lastLogText) break;

      // 🚨 Filter hanya log hari ini
      const filteredLines = logText
        .split("\n")
        .filter(line => line.startsWith(todayPrefix));

      if (filteredLines.length > 0) {
        allLogs += `\n--- Page ${page} ---\n${filteredLines.join("\n")}\n`;
      }

      lastLogText = logText;
      page++;

    } catch (error) {
      console.error(`❌ Error fetching page ${page}:`, error.message);
      break;
    }
  }

  // --- Simpan file di folder harian ---
  const filePath = path.join(logsDir, `${logType}.log`);
  if (allLogs) {
    fs.appendFileSync(filePath, allLogs + "\n", "utf8");
  } else {
    fs.appendFileSync(filePath, "\nTidak ada log baru untuk hari ini.\n", "utf8");
  }

  console.log(`✅ ${logType} log saved: ${filePath}`);
  return filePath;
}

// --- DOWNLOAD SEMUA ---
async function downloadAllLogs() {
  console.log("⏳ Mulai download semua log...");
  try {
    await downloadLogs("system");
    await downloadLogs("config");
    await downloadLogs("data");
    console.log("✅ Semua log selesai di-download");
  } catch (error) {
    console.error("❌ Error saat download:", error.message);
  }
}

// --- APP START ---
app.on("ready", async () => {
  console.log("🚀 Aplikasi dimulai...");
  
  try {
    await doLogin();          // Login otomatis di awal
    await downloadAllLogs();  // Download sekali saja
    console.log("✅ Download selesai. Aplikasi akan tertutup.");
  } catch (error) {
    console.error("❌ Aplikasi error:", error.message);
    console.log("\n💡 Solusi:");
    console.log("1. Periksa username & password di LOGIN_CONFIG");
    console.log("2. Pastikan server http://172.25.4.12 bisa diakses");
    console.log("3. Cek field name di form login (LoginID? username? user?)");
  } finally {
    app.quit(); // Tutup aplikasi
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});