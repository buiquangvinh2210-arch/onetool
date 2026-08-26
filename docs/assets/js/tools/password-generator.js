window.OTPassword = (function () {
  "use strict";

  const CHARSET = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    digits: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?"
  };

  const AMBIGUOUS = "0OIl1|";

  function secureRandomInt(max) {
    if (max <= 0) return 0;
    if (typeof crypto === "undefined" || typeof crypto.getRandomValues !== "function") {
      throw new Error("Trình duyệt không hỗ trợ tạo mật khẩu ngẫu nhiên an toàn.");
    }
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    let x;
    do {
      crypto.getRandomValues(buf);
      x = buf[0];
    } while (x >= limit);
    return x % max;
  }

  function buildPool(opts) {
    let pool = "";
    if (opts.lower) pool += CHARSET.lower;
    if (opts.upper) pool += CHARSET.upper;
    if (opts.digits) pool += CHARSET.digits;
    if (opts.symbols) pool += CHARSET.symbols;
    if (opts.excludeAmbiguous) {
      pool = [...pool].filter((c) => !AMBIGUOUS.includes(c)).join("");
    }
    return pool;
  }

  function pickFrom(pool) {
    return pool[secureRandomInt(pool.length)];
  }

  function shuffle(str) {
    const arr = [...str];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join("");
  }

  function generateOne(opts) {
    const length = Math.min(128, Math.max(4, Math.round(Number(opts.length) || 16)));
    const pool = buildPool(opts);
    if (!pool.length) throw new Error("Chọn ít nhất một loại ký tự.");

    const required = [];
    if (opts.lower) required.push(pickFrom(filterChars(CHARSET.lower, opts.excludeAmbiguous)));
    if (opts.upper) required.push(pickFrom(filterChars(CHARSET.upper, opts.excludeAmbiguous)));
    if (opts.digits) required.push(pickFrom(filterChars(CHARSET.digits, opts.excludeAmbiguous)));
    if (opts.symbols) required.push(pickFrom(filterChars(CHARSET.symbols, opts.excludeAmbiguous)));

    if (required.length > length) {
      throw new Error("Độ dài quá ngắn so với số loại ký tự đã chọn.");
    }

    let pwd = required.join("");
    while (pwd.length < length) pwd += pickFrom(pool);
    return shuffle(pwd);
  }

  function filterChars(set, excludeAmbiguous) {
    if (!excludeAmbiguous) return set;
    return [...set].filter((c) => !AMBIGUOUS.includes(c)).join("");
  }

  function poolSize(opts) {
    return buildPool(opts).length;
  }

  function estimateStrength(password, opts) {
    const len = password.length;
    const pool = poolSize(opts);
    if (!len || !pool) {
      return { bits: 0, label: "—", level: 0, pool };
    }
    const bits = Math.round(len * (Math.log(pool) / Math.LN2) * 10) / 10;
    let label = "Yếu";
    let level = 1;
    if (bits >= 80) {
      label = "Rất mạnh";
      level = 4;
    } else if (bits >= 60) {
      label = "Mạnh";
      level = 3;
    } else if (bits >= 40) {
      label = "Khá";
      level = 2;
    }
    return { bits, label, level, pool };
  }

  function generate(opts) {
    const count = Math.min(20, Math.max(1, Math.round(Number(opts.count) || 1)));
    const passwords = [];
    for (let i = 0; i < count; i++) passwords.push(generateOne(opts));
    const strength = estimateStrength(passwords[0], opts);
    return { passwords, strength };
  }

  const PRESETS = {
    strong: { length: 16, lower: true, upper: true, digits: true, symbols: true, excludeAmbiguous: false },
    max: { length: 24, lower: true, upper: true, digits: true, symbols: true, excludeAmbiguous: false },
    pin: { length: 6, lower: false, upper: false, digits: true, symbols: false, excludeAmbiguous: false },
    readable: { length: 16, lower: true, upper: true, digits: true, symbols: false, excludeAmbiguous: true }
  };

  return { generate, generateOne, estimateStrength, buildPool, PRESETS, CHARSET };
})();
