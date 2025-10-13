<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status Download Logs</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Courier New', 'Consolas', monospace;
      padding: 20px;
      background: #0a0e27;
      min-height: 100vh;
      color: #00ff41;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow-x: hidden;
      position: relative;
    }

    /* Matrix Rain Effect */
    .background-animation {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      overflow: hidden;
      background: #0a0e27;
    }

    .matrix-column {
      position: absolute;
      top: -100%;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #00ff41;
      text-shadow: 0 0 8px #00ff41;
      animation: matrixfall linear infinite;
      opacity: 0.8;
      white-space: nowrap;
    }

    @keyframes matrixfall {
      0% {
        top: -100%;
        opacity: 0;
      }
      10% {
        opacity: 0.8;
      }
      90% {
        opacity: 0.8;
      }
      100% {
        top: 100%;
        opacity: 0;
      }
    }

    /* Binary Grid Background */
    .binary-grid {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -2;
      background-image: 
        linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px);
      background-size: 20px 20px;
      animation: gridScroll 20s linear infinite;
    }

    @keyframes gridScroll {
      0% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(20px);
      }
    }

    /* Glitch Lines */
    .glitch-line {
      position: absolute;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(0, 255, 65, 0.5) 50%, 
        transparent 100%);
      animation: glitchScan 8s linear infinite;
      opacity: 0.3;
    }

    @keyframes glitchScan {
      0% {
        top: 0%;
        opacity: 0;
      }
      5% {
        opacity: 0.3;
      }
      95% {
        opacity: 0.3;
      }
      100% {
        top: 100%;
        opacity: 0;
      }
    }

    /* Floating Code Snippets */
    .code-snippet {
      position: absolute;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: rgba(0, 255, 65, 0.2);
      animation: floatCode 15s infinite ease-in-out;
      pointer-events: none;
    }

    @keyframes floatCode {
      0%, 100% {
        transform: translateY(0) translateX(0) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 0.3;
      }
      50% {
        transform: translateY(-100px) translateX(50px) rotate(5deg);
        opacity: 0.2;
      }
      90% {
        opacity: 0.3;
      }
      100% {
        transform: translateY(-200px) translateX(-30px) rotate(-5deg);
        opacity: 0;
      }
    }

    .container {
      max-width: 800px;
      width: 100%;
      background: rgba(30, 30, 50, 0.8);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 215, 0, 0.2);
      animation: slideIn 0.6s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    h1 {
      color: #ffd700;
      text-align: center;
      margin-bottom: 30px;
      font-size: 2.5em;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      animation: glow 2s ease-in-out infinite;
    }

    @keyframes glow {
      0%, 100% {
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.3);
      }
      50% {
        text-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 0 50px rgba(255, 215, 0, 0.5);
      }
    }

    .status-container {
      position: relative;
      padding: 25px;
      background: rgba(20, 20, 35, 0.7);
      border-radius: 15px;
      border: 1px solid rgba(255, 215, 0, 0.15);
      min-height: 200px;
    }

    .loading-spinner {
      display: inline-block;
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 215, 0, 0.2);
      border-top-color: #ffd700;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    @keyframes spin {
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }

    #output {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.8;
      white-space: pre-wrap;
      word-wrap: break-word;
      color: #e0e0e0;
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .success-icon {
      display: inline-block;
      animation: bounceIn 0.6s ease-out;
    }

    @keyframes bounceIn {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .file-item {
      padding: 8px 0;
      border-left: 3px solid #ffd700;
      padding-left: 15px;
      margin: 8px 0;
      animation: slideInLeft 0.4s ease-out backwards;
    }

    .file-item:nth-child(1) { animation-delay: 0.1s; }
    .file-item:nth-child(2) { animation-delay: 0.2s; }
    .file-item:nth-child(3) { animation-delay: 0.3s; }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .error-message {
      color: #ff6b6b;
      background: rgba(255, 107, 107, 0.1);
      padding: 15px;
      border-radius: 10px;
      border-left: 4px solid #ff6b6b;
      animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }

    .pulse {
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .footer {
      margin-top: 30px;
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="background-animation">
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="circle"></div>
  </div>

  <div class="container">
    <h1>⚡ ElectroLogIXS</h1>
    <div class="status-container">
      <div id="loading" class="loading-spinner"></div>
      <pre id="output"><span class="pulse">⏳ Sedang login & download...</span></pre>
    </div>
    <div class="footer">Powered by ElectroLogIXS System</div>
  </div>

  <script>
    // Check if running in Electron environment
    async function start() {
      const outputEl = document.getElementById("output");
      const loadingEl = document.getElementById("loading");
      
      try {
        // Access ipcRenderer from window object (preload script should expose this)
        const ipcRenderer = window.require ? window.require("electron").ipcRenderer : window.ipcRenderer;
        
        if (!ipcRenderer) {
          throw new Error("IPC Renderer tidak tersedia. Pastikan preload script sudah dikonfigurasi.");
        }
        
        const result = await ipcRenderer.invoke("start-download");
        
        // Hide loading spinner
        loadingEl.style.display = 'none';
        
        if (result.success) {
          outputEl.innerHTML = 
            `<span class="success-icon">✅</span> <strong>Login sukses</strong>\n` +
            `🍪 <strong>Cookie:</strong> ${result.cookie}\n\n` +
            `📂 <strong>File tersimpan:</strong>\n` +
            `<div class="file-item">- ${result.files.system}</div>` +
            `<div class="file-item">- ${result.files.config}</div>` +
            `<div class="file-item">- ${result.files.data}</div>`;
        } else {
          outputEl.innerHTML = `<div class="error-message">❌ <strong>Error:</strong> ${result.error}</div>`;
        }
      } catch (error) {
        loadingEl.style.display = 'none';
        outputEl.innerHTML = `<div class="error-message">❌ <strong>Error:</strong> ${error.message || error}</div>`;
      }
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  </script>
</body>
</html>
