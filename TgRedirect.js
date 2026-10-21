/**
 * Quantumult X: t.me 选择跳转客户端 (修改响应体方案)
 */

const CLIENTS = [
  { name: "Swiftgram", scheme: "sg" },
  { name: "Turrit", scheme: "turrit" },
  { name: "Nicegram", scheme: "ng" },
  { name: "iMe", scheme: "ime" },
  { name: "Telegram (官方)", scheme: "tg" },
  { name: "Lingogram", scheme: "lingo" },
  { name: "Regram", scheme: "rg" },
];

function qval(qs, key) {
  if (!qs) return "";
  const re = new RegExp(
    "(?:^|&)" + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^&]*)",
  );
  const m = qs.match(re);
  return m ? decodeURIComponent(m[1]) : "";
}

function getDeepLinkPath(path, qs) {
  const p = path.split("/").filter(Boolean);
  if (!p[0]) return "";
  if (p[0][0] === "+") return `join?invite=${encodeURIComponent(p[0].slice(1))}`;
  if (p[0] === "joinchat" && p[1]) return `join?invite=${encodeURIComponent(p[1])}`;
  if (p[0] === "addstickers" && p[1]) return `addstickers?set=${encodeURIComponent(p[1])}`;
  if (p[0] === "share" && p[1] === "url") {
    return `msg_url?url=${encodeURIComponent(qval(qs, "url"))}&text=${encodeURIComponent(qval(qs, "text"))}`;
  }
  if (p[1] && /^\d+$/.test(p[1])) {
    return `resolve?domain=${encodeURIComponent(p[0])}&post=${encodeURIComponent(p[1])}`;
  }
  return `resolve?domain=${encodeURIComponent(p[0])}`;
}

(function () {
  const url = $request.url;
  const m = url.match(/^https?:\/\/(?:t\.me|telegram\.me)\/(.+)$/i);
  if (!m) {
    $done({});
    return;
  }

  let tail = m[1];
  if (tail.startsWith("s/")) tail = tail.slice(2);

  const qi = tail.indexOf("?");
  const path = qi < 0 ? tail : tail.slice(0, qi);
  const qs = qi < 0 ? "" : tail.slice(qi + 1);

  const linkPath = getDeepLinkPath(path, qs);
  if (!linkPath) {
    $done({});
    return;
  }

  const buttonsHtml = CLIENTS.map(c => `
    <button class="btn" onclick="openClient('${c.scheme}')">${c.name}</button>
  `).join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>选择打开方式</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f2f2f7;
      margin: 0;
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 80vh;
      justify-content: center;
      box-sizing: border-box;
    }
    .card {
      background: #ffffff;
      border-radius: 18px;
      padding: 24px 20px;
      width: 100%;
      max-width: 360px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      text-align: center;
      box-sizing: border-box;
    }
    h2 { margin: 0 0 8px 0; font-size: 19px; color: #1c1c1e; }
    p { margin: 0 0 20px 0; font-size: 13px; color: #8e8e93; }
    .btn {
      width: 100%;
      padding: 13px;
      margin-bottom: 10px;
      font-size: 16px;
      font-weight: 500;
      border: none;
      border-radius: 12px;
      background: #007aff;
      color: #fff;
      cursor: pointer;
      outline: none;
      transition: opacity 0.2s;
    }
    .btn:active { opacity: 0.7; }
    .btn-auto {
      background: #34c759;
      margin-bottom: 16px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>选择打开方式</h2>
    <p>请选择你要唤起的 Telegram 客户端</p>
    <button id="lastBtn" class="btn btn-auto" onclick="openLast()"></button>
    ${buttonsHtml}
  </div>

  <script>
    const linkPath = "${linkPath}";
    const lastScheme = localStorage.getItem("tg_last_scheme");
    const lastName = localStorage.getItem("tg_last_name");

    if (lastScheme && lastName) {
      const btn = document.getElementById("lastBtn");
      btn.innerText = "上次使用: " + lastName;
      btn.style.display = "block";
    }

    function openClient(scheme) {
      const clientName = event.target.innerText;
      localStorage.setItem("tg_last_scheme", scheme);
      localStorage.setItem("tg_last_name", clientName);
      window.location.href = scheme + "://" + linkPath;
    }

    function openLast() {
      if (lastScheme) {
        window.location.href = lastScheme + "://" + linkPath;
      }
    }
  </script>
</body>
</html>`;

  $done({ body: html });
})();
