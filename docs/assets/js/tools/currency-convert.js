/**
 * Đổi tiền tệ — tỷ giá realtime (open.er-api + fallback CDN).
 */
window.OTCurrency = (function () {
  "use strict";

  const CACHE_KEY = "ot-fx-rates-v1";
  const CACHE_MS = 6 * 60 * 60 * 1000;

  const CURRENCIES = [
    { code: "VND", name: "Việt Nam Đồng", flag: "🇻🇳" },
    { code: "USD", name: "Đô la Mỹ", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "GBP", name: "Bảng Anh", flag: "🇬🇧" },
    { code: "JPY", name: "Yên Nhật", flag: "🇯🇵" },
    { code: "CNY", name: "Nhân dân tệ", flag: "🇨🇳" },
    { code: "KRW", name: "Won Hàn", flag: "🇰🇷" },
    { code: "THB", name: "Baht Thái", flag: "🇹🇭" },
    { code: "SGD", name: "Đô la Singapore", flag: "🇸🇬" },
    { code: "AUD", name: "Đô la Úc", flag: "🇦🇺" },
    { code: "CAD", name: "Đô la Canada", flag: "🇨🇦" },
    { code: "CHF", name: "Franc Thụy Sĩ", flag: "🇨🇭" },
    { code: "HKD", name: "Đô la Hồng Kông", flag: "🇭🇰" },
    { code: "TWD", name: "Đài tệ", flag: "🇹🇼" },
    { code: "MYR", name: "Ringgit Malaysia", flag: "🇲🇾" },
    { code: "IDR", name: "Rupiah Indonesia", flag: "🇮🇩" },
    { code: "PHP", name: "Peso Philippines", flag: "🇵🇭" },
    { code: "INR", name: "Rupee Ấn Độ", flag: "🇮🇳" },
    { code: "RUB", name: "Rúp Nga", flag: "🇷🇺" },
    { code: "NZD", name: "Đô la New Zealand", flag: "🇳🇿" }
  ];

  let ratesCache = null; // { base: "USD", rates: {USD:1,...}, updatedAt, dateLabel, source }

  function readLocal() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj?.rates || !obj?.updatedAt) return null;
      if (Date.now() - obj.updatedAt > CACHE_MS) return null;
      return obj;
    } catch (_) {
      return null;
    }
  }

  function writeLocal(obj) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
    } catch (_) {
      /* ignore */
    }
  }

  async function fetchOpenEr() {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { mode: "cors" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (data.result !== "success" || !data.rates) throw new Error("Bad payload");
    return {
      base: "USD",
      rates: data.rates,
      updatedAt: Date.now(),
      dateLabel: data.time_last_update_utc || new Date().toUTCString(),
      source: "open.er-api.com"
    };
  }

  async function fetchFawaz() {
    const res = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json",
      { mode: "cors" }
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const usd = data.usd;
    if (!usd) throw new Error("Bad payload");
    const rates = { USD: 1 };
    Object.keys(usd).forEach((k) => {
      rates[k.toUpperCase()] = Number(usd[k]);
    });
    return {
      base: "USD",
      rates,
      updatedAt: Date.now(),
      dateLabel: data.date || new Date().toISOString().slice(0, 10),
      source: "currency-api (jsDelivr)"
    };
  }

  async function loadRates(force) {
    if (!force && ratesCache) return ratesCache;
    if (!force) {
      const local = readLocal();
      if (local) {
        ratesCache = local;
        return ratesCache;
      }
    }

    let lastErr;
    for (const fn of [fetchOpenEr, fetchFawaz]) {
      try {
        const pack = await fn();
        if (!pack.rates.VND) throw new Error("Thiếu VND");
        ratesCache = pack;
        writeLocal(pack);
        return pack;
      } catch (e) {
        lastErr = e;
      }
    }
    // stale cache fallback
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj?.rates) {
          ratesCache = obj;
          return obj;
        }
      }
    } catch (_) {
      /* ignore */
    }
    throw new Error(lastErr?.message || "Không tải được tỷ giá.");
  }

  function convert(amount, from, to, pack) {
    const a = Number(amount);
    if (!Number.isFinite(a)) throw new Error("Số tiền không hợp lệ.");
    const f = String(from || "").toUpperCase();
    const t = String(to || "").toUpperCase();
    const rf = pack.rates[f];
    const rt = pack.rates[t];
    if (!rf || !rt) throw new Error("Chưa hỗ trợ cặp tiền này.");
    // amount in USD = a / rf ; result = usd * rt
    const result = (a / rf) * rt;
    const rate = rt / rf; // 1 from = rate to
    return { result, rate };
  }

  function formatAmount(n, code) {
    if (!Number.isFinite(n)) return "—";
    const c = String(code || "").toUpperCase();
    const zeroDec = c === "VND" || c === "JPY" || c === "KRW" || c === "IDR";
    try {
      return new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: zeroDec ? 0 : 4,
        minimumFractionDigits: zeroDec ? 0 : 0
      }).format(n);
    } catch (_) {
      return String(Math.round(n * 10000) / 10000);
    }
  }

  function parseAmount(raw) {
    let s = String(raw || "").trim().replace(/\s/g, "");
    if (!s) return NaN;
    // support 1.000.000,5 or 1,000,000.5
    if (/,/.test(s) && /\./.test(s)) {
      if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
        s = s.replace(/\./g, "").replace(",", ".");
      } else {
        s = s.replace(/,/g, "");
      }
    } else if (/,/.test(s)) {
      s = s.replace(",", ".");
    }
    return Number(s);
  }

  return {
    CURRENCIES,
    loadRates,
    convert,
    formatAmount,
    parseAmount
  };
})();
