/**
 * Quantumult X: Telegram 客户端多选跳转中转页
 */

const SCHEMES = {
  "Swiftgram": "sg",
  "Nicegram": "ng",
  "Turrit": "turrit",
  "iMe": "ime",
  "Lingogram": "lingo",
  "官方 Telegram": "tg"
};

function qval(qs, key) {
  if (!qs) return "";
  const re = new RegExp("(?:^|&)" + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^&]*)");
  const m = qs.match(re);
  return m ? decodeURIComponent(m[1]) : "";
}

function deeplink(s, path, qs) {
  const p = path.split("/").filter(Boolean);
  if (!p[0]) return "";
  if (p[0][0] === "+") return `${s}://join?invite=${encodeURIComponent(p[0].slice(1))}`;
  if (p[0] === "joinchat" && p[1]) return `${s}://join?invite=${encodeURIComponent(p[1])}`;
  if (p[0] === "addstickers" && p[1]) return `${s}://addstickers?set=${encodeURIComponent(p[1])}`;
  if (p[0] === "share" && p[1] === "url") return `${s}://msg_url?url=${encodeURIComponent(qval(qs, "url"))}&text=${encodeURIComponent(qval(qs, "text"))}`;
  if (p[1] && /^\d+$/.test(p[1])) return `${s}://resolve?domain=${encodeURIComponent(p[0])}&post=${encodeURIComponent(p[1])}`;
  return `${s}://resolve?domain=${encodeURIComponent(p[0])}`;
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

  // 生成各客户端的选择按钮
  let buttonsHtml = "";
  for (const [name, scheme] of Object.entries(SCHEMES)) {
    const link = deeplink(scheme, path, qs);
    buttonsHtml += `<a href="${link}" class="btn">${name}</a>`;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>选择打开方式</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 90vh; margin: 0; background-color: #f7f9fa; }
    .card { background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); width: 85%; max-width: 320px; text-align: center; }
    h3 { margin-top: 0; margin-bottom: 16px; font-size: 18px; color: #1c1e21; }
    .btn { display: block; padding: 12px; margin-bottom: 10px; background-color: #0088cc; color: white; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 500; transition: background 0.2s; }
    .btn:last-child { margin-bottom: 0; }
    .btn:active { background-color: #006699; }
  </style>
</head>
<body>
  <div class="card">
    <h3>选择 Telegram 客户端</h3>
    ${buttonsHtml}
  </div>
</body>
</html>`;

  $done({
    response: {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache"
      },
      body: html
    }
  });
})();
