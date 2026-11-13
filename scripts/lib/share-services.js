"use strict";

const SHARE_SERVICE_IDS = Object.freeze([
  "qrcode",
  "link",
  "weibo",
  "x",
  "telegram",
  "whatsapp",
  "email"
]);

// 1.x 兼容别名：qrcode1 / wechat 都指向二维码
const SHARE_SERVICE_ALIASES = Object.freeze({
  qrcode1: "qrcode",
  wechat: "qrcode"
});

const SHARE_SERVICE_SET = new Set(SHARE_SERVICE_IDS);
const SHARE_SERVICE_LABELS = Object.freeze({
  qrcode: "QR Code",
  link: "Copy Link",
  weibo: "Weibo",
  email: "Email",
  x: "X",
  telegram: "Telegram",
  whatsapp: "WhatsApp"
});

function text(value) {
  return value == null ? "" : String(value);
}

function query(pairs) {
  return pairs
    .filter(([, value, omitEmpty]) => !omitEmpty || value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
}

function normalizeShareService(service) {
  const raw = text(service).trim();
  return SHARE_SERVICE_ALIASES[raw] || raw;
}

function filterShareServices(services) {
  if (!Array.isArray(services)) return [];
  const result = [];
  for (const service of services) {
    const normalized = normalizeShareService(service);
    if (!SHARE_SERVICE_SET.has(normalized) || result.includes(normalized)) continue;
    result.push(normalized);
  }
  return result;
}

function buildShareAction(service, share = {}) {
  if (!SHARE_SERVICE_SET.has(service)) return null;
  const permalink = text(share.permalink);
  // 1.x 兼容：二维码与复制链接使用 shortlink
  const shortlink = text(share.shortlink) || permalink;
  const title = text(share.title);
  const image = text(share.image);
  const summary = text(share.summary);
  const action = {
    service,
    label: SHARE_SERVICE_LABELS[service]
  };

  if (service === "qrcode") {
    action.kind = "toggle";
    action.target = "share-qrcode";
    action.permalink = shortlink;
  } else if (service === "link") {
    action.kind = "copy";
    action.value = shortlink;
  } else if (service === "weibo") {
    action.kind = "external";
    action.href = `https://service.weibo.com/share/share.php?${query([
      ["url", permalink],
      ["title", title],
      ["pics", image, true],
      ["summary", summary]
    ])}`;
  } else if (service === "email") {
    action.kind = "link";
    action.href = `mailto:?${query([["subject", title], ["body", permalink]])}`;
  } else if (service === "x") {
    action.kind = "external";
    action.href = `https://x.com/intent/tweet?${query([["text", title], ["url", permalink]])}`;
  } else if (service === "telegram") {
    action.kind = "external";
    action.href = `https://t.me/share/url?${query([["url", permalink], ["text", title]])}`;
  } else if (service === "whatsapp") {
    action.kind = "external";
    action.href = `https://wa.me/?${query([["text", `${title}\n${permalink}`]])}`;
  }

  return action;
}

module.exports = {
  SHARE_SERVICE_IDS,
  SHARE_SERVICE_ALIASES,
  normalizeShareService,
  buildShareAction,
  filterShareServices
};
