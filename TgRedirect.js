/**
 * Quantumult X: t.me → 第三方 Telegram 客户端重定向
 *
 * 说明：
 * 圈x 通过 $prefs.valueForKey("tg_client") 读取配置的客户端名称。
 * 支持在 BoxJS 或脚本顶部修改默认值。
 */

const SCHEME = {
  Telegram: "tg",
  Nagram: "tg",
  Swiftgram: "sg",
  Turrit: "turrit",
  iMe: "ime",
  Nicegram: "ng",
  Lingogram: "lingo",
  Regram: "rg",
};

function qval(qs, key) {
  if (!qs) return "";
  const re = new RegExp(
    "(?:^|&)" + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^&]*)",
  );
  const m = qs.match(re);
  return m ? decodeURIComponent(m[1]) : "";
}

function deeplink(s, path, qs) {
  const p = path.split("/").filter(Boolean);
  if (!p[0]) return "";

  if (p[0][0] === "+") {
    return `${s}://join?invite=${encodeURIComponent(p[0].slice(1))}`;
  }
  if (p[0] === "joinchat" && p[1]) {
    return `${s}://join?invite=${encodeURIComponent(p[1])}`;
  }
  if (p[0] === "addstickers" && p[1]) {
    return `${s}://addstickers?set=${encodeURIComponent(p[1])}`;
  }
  if (p[0] === "share" && p[1] === "url") {
    return `${s}://msg_url?url=${encodeURIComponent(qval(qs, "url"))}&text=${encodeURIComponent(qval(qs, "text"))}`;
  }
  if (p[1] && /^\d+$/.test(p[1])) {
    return `${s}://resolve?domain=${encodeURIComponent(p[0])}&post=${encodeURIComponent(p[1])}`;
  }
  return `${s}://resolve?domain=${encodeURIComponent(p[0])}`;
}

(function () {
  const url = $request.url;
  const m = url.match(/^https?:\/\/(?:t\.me|telegram\.me)\/(.+)$/i);
  if (!m) {
    $done({});
    return;
  }

  // 默认客户端，可直接改这里的字符串，如 "Swiftgram"
  const defaultClient = "Swiftgram";
  const client = ($prefs.valueForKey("tg_client") || defaultClient).trim();

  // 如果选择官方 Telegram 则直接放行
  if (client === "Telegram") {
    $done({});
    return;
  }

  const scheme = SCHEME[client] || "tg";

  let tail = m[1];
  if (tail.startsWith("s/")) tail = tail.slice(2);

  const qi = tail.indexOf("?");
  const path = qi < 0 ? tail : tail.slice(0, qi);
  const qs = qi < 0 ? "" : tail.slice(qi + 1);

  const loc = deeplink(scheme, path, qs);
  if (!loc) {
    $done({});
    return;
  }

  // 圈x 中通过 $done 直接返回 302 响应
  $done({
    response: {
      status: "HTTP/1.1 302 Found",
      headers: {
        Location: loc,
        "Cache-Control": "no-store, no-cache",
      },
      body: "",
    },
  });
})();
