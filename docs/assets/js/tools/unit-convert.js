/**
 * Chuyển đổi đơn vị — SI chuẩn, live, đa nhóm.
 * Temperature dùng công thức riêng; nhóm khác quy về đơn vị gốc rồi nhân hệ số.
 */
window.OTUnitConvert = (function () {
  "use strict";

  const CATEGORIES = [
    {
      id: "mass",
      slug: "unit-mass",
      name: "Khối lượng",
      h1: "Đổi khối lượng · kg · lb · g",
      lead: "Đổi kilogram, gram, pound, ounce, tấn… Hệ số NIST/SI chuẩn, xem tất cả đơn vị cùng lúc.",
      chips: ["kg ↔ lb", "g · mg", "tấn", "ounce"],
      hint: "kg, g, tấn, pound…",
      base: "kg",
      defaults: { from: "kg", to: "lb", value: "1" },
      units: [
        { id: "t", name: "Tấn (t)", toBase: 1000 },
        { id: "kg", name: "Kilogram (kg)", toBase: 1 },
        { id: "g", name: "Gram (g)", toBase: 0.001 },
        { id: "mg", name: "Milligram (mg)", toBase: 1e-6 },
        { id: "ug", name: "Microgram (µg)", toBase: 1e-9 },
        { id: "lb", name: "Pound (lb)", toBase: 0.45359237 },
        { id: "oz", name: "Ounce (oz)", toBase: 0.028349523125 },
        { id: "st", name: "Stone (st)", toBase: 6.35029318 },
        { id: "slug", name: "Slug", toBase: 14.5939029 },
        { id: "ct", name: "Carat (ct)", toBase: 0.0002 },
        { id: "gr", name: "Grain (gr)", toBase: 6.479891e-5 }
      ]
    },
    {
      id: "length",
      slug: "unit-length",
      name: "Chiều dài",
      h1: "Đổi chiều dài · m · ft · inch",
      lead: "Đổi mét, centimet, inch, feet, mile, hải lý… Chuẩn SI: 1 inch = 25,4 mm.",
      chips: ["m ↔ ft", "cm · mm", "inch", "mile"],
      hint: "m, km, inch, mile…",
      base: "m",
      defaults: { from: "m", to: "ft", value: "1" },
      units: [
        { id: "km", name: "Kilômét (km)", toBase: 1000 },
        { id: "m", name: "Mét (m)", toBase: 1 },
        { id: "dm", name: "Đềximét (dm)", toBase: 0.1 },
        { id: "cm", name: "Xentimét (cm)", toBase: 0.01 },
        { id: "mm", name: "Milimét (mm)", toBase: 0.001 },
        { id: "um", name: "Micromét (µm)", toBase: 1e-6 },
        { id: "nm", name: "Nanomét (nm)", toBase: 1e-9 },
        { id: "mi", name: "Dặm (mi)", toBase: 1609.344 },
        { id: "yd", name: "Yard (yd)", toBase: 0.9144 },
        { id: "ft", name: "Feet (ft)", toBase: 0.3048 },
        { id: "in", name: "Inch (in)", toBase: 0.0254 },
        { id: "nmi", name: "Hải lý (nmi)", toBase: 1852 },
        { id: "au", name: "Đơn vị thiên văn (AU)", toBase: 149597870700 }
      ]
    },
    {
      id: "area",
      slug: "unit-area",
      name: "Diện tích",
      h1: "Đổi diện tích · m² · ha · acre",
      lead: "Đổi mét vuông, hecta, acre, feet vuông… Hệ số SI chuẩn.",
      chips: ["m²", "ha", "acre", "ft²"],
      hint: "m², ha, acre…",
      base: "m2",
      defaults: { from: "m2", to: "ft2", value: "1" },
      units: [
        { id: "km2", name: "Kilômét vuông (km²)", toBase: 1e6 },
        { id: "ha", name: "Hecta (ha)", toBase: 10000 },
        { id: "a", name: "Are (a)", toBase: 100 },
        { id: "m2", name: "Mét vuông (m²)", toBase: 1 },
        { id: "dm2", name: "Đềximét vuông (dm²)", toBase: 0.01 },
        { id: "cm2", name: "Xentimét vuông (cm²)", toBase: 1e-4 },
        { id: "mm2", name: "Milimét vuông (mm²)", toBase: 1e-6 },
        { id: "mi2", name: "Dặm vuông (mi²)", toBase: 2589988.110336 },
        { id: "yd2", name: "Yard vuông (yd²)", toBase: 0.83612736 },
        { id: "ft2", name: "Feet vuông (ft²)", toBase: 0.09290304 },
        { id: "in2", name: "Inch vuông (in²)", toBase: 0.00064516 },
        { id: "acre", name: "Acre", toBase: 4046.8564224 }
      ]
    },
    {
      id: "volume",
      slug: "unit-volume",
      name: "Thể tích",
      h1: "Đổi thể tích · L · mL · gallon",
      lead: "Đổi lít, mililít, mét khối, gallon Mỹ/Anh, cup…",
      chips: ["L · mL", "m³", "gallon", "cup"],
      hint: "L, mL, m³, gallon…",
      base: "L",
      defaults: { from: "L", to: "gal_us", value: "1" },
      units: [
        { id: "m3", name: "Mét khối (m³)", toBase: 1000 },
        { id: "L", name: "Lít (L)", toBase: 1 },
        { id: "dL", name: "Đềxilít (dL)", toBase: 0.1 },
        { id: "cL", name: "Xentilít (cL)", toBase: 0.01 },
        { id: "mL", name: "Mililít (mL)", toBase: 0.001 },
        { id: "cm3", name: "Xentimét khối (cm³)", toBase: 0.001 },
        { id: "mm3", name: "Milimét khối (mm³)", toBase: 1e-6 },
        { id: "gal_us", name: "Gallon Mỹ (gal US)", toBase: 3.785411784 },
        { id: "gal_uk", name: "Gallon Anh (gal UK)", toBase: 4.54609 },
        { id: "qt_us", name: "Quart Mỹ (qt)", toBase: 0.946352946 },
        { id: "pt_us", name: "Pint Mỹ (pt)", toBase: 0.473176473 },
        { id: "cup_us", name: "Cup Mỹ", toBase: 0.2365882365 },
        { id: "fl_oz_us", name: "Fluid ounce Mỹ (fl oz)", toBase: 0.0295735295625 },
        { id: "tbsp", name: "Muỗng canh (tbsp)", toBase: 0.01478676478125 },
        { id: "tsp", name: "Muỗng cà phê (tsp)", toBase: 0.00492892159375 },
        { id: "bbl", name: "Thùng dầu (bbl)", toBase: 158.987294928 }
      ]
    },
    {
      id: "temp",
      slug: "unit-temp",
      name: "Nhiệt độ",
      h1: "Đổi nhiệt độ · °C · °F · K",
      lead: "Đổi độ C, độ F, Kelvin, Rankine theo công thức chuẩn.",
      chips: ["°C ↔ °F", "Kelvin", "Rankine"],
      hint: "°C, °F, K…",
      base: "C",
      special: "temperature",
      defaults: { from: "C", to: "F", value: "25" },
      units: [
        { id: "C", name: "Độ C (°C)" },
        { id: "F", name: "Độ F (°F)" },
        { id: "K", name: "Kelvin (K)" },
        { id: "R", name: "Rankine (°R)" }
      ]
    },
    {
      id: "speed",
      slug: "unit-speed",
      name: "Tốc độ",
      h1: "Đổi tốc độ · km/h · mph",
      lead: "Đổi km/h, m/s, mph, knot, feet/giây…",
      chips: ["km/h", "mph", "m/s", "knot"],
      hint: "km/h, m/s, mph…",
      base: "mps",
      defaults: { from: "kmh", to: "mph", value: "60" },
      units: [
        { id: "mps", name: "Mét/giây (m/s)", toBase: 1 },
        { id: "kmh", name: "Kilômét/giờ (km/h)", toBase: 1000 / 3600 },
        { id: "mph", name: "Dặm/giờ (mph)", toBase: 0.44704 },
        { id: "knot", name: "Hải lý/giờ (knot)", toBase: 1852 / 3600 },
        { id: "fps", name: "Feet/giây (ft/s)", toBase: 0.3048 },
        { id: "c", name: "Tốc độ ánh sáng (c)", toBase: 299792458 }
      ]
    },
    {
      id: "time",
      slug: "unit-time",
      name: "Thời gian",
      h1: "Đổi thời gian · giờ · phút · giây",
      lead: "Đổi giây, phút, giờ, ngày, tuần, năm…",
      chips: ["giờ", "phút", "ngày", "ms"],
      hint: "giây, phút, giờ, ngày…",
      base: "s",
      defaults: { from: "h", to: "min", value: "1" },
      units: [
        { id: "y", name: "Năm (365d)", toBase: 31536000 },
        { id: "mo", name: "Tháng (30d)", toBase: 2592000 },
        { id: "w", name: "Tuần", toBase: 604800 },
        { id: "d", name: "Ngày", toBase: 86400 },
        { id: "h", name: "Giờ", toBase: 3600 },
        { id: "min", name: "Phút", toBase: 60 },
        { id: "s", name: "Giây", toBase: 1 },
        { id: "ms", name: "Miligiây (ms)", toBase: 0.001 },
        { id: "us", name: "Microgiây (µs)", toBase: 1e-6 },
        { id: "ns", name: "Nanogiây (ns)", toBase: 1e-9 }
      ]
    },
    {
      id: "data",
      slug: "unit-data",
      name: "Dung lượng",
      h1: "Đổi dung lượng · MB · GiB",
      lead: "Đổi Byte, KB/MB/GB (SI) và KiB/MiB/GiB (IEC) chính xác.",
      chips: ["MB ↔ MiB", "GB · GiB", "Bit · Byte"],
      hint: "B, KB, MB, GiB…",
      base: "B",
      defaults: { from: "MB", to: "MiB", value: "1" },
      units: [
        { id: "bit", name: "Bit", toBase: 0.125 },
        { id: "B", name: "Byte (B)", toBase: 1 },
        { id: "KB", name: "Kilobyte (KB) · 10³", toBase: 1e3 },
        { id: "MB", name: "Megabyte (MB) · 10⁶", toBase: 1e6 },
        { id: "GB", name: "Gigabyte (GB) · 10⁹", toBase: 1e9 },
        { id: "TB", name: "Terabyte (TB) · 10¹²", toBase: 1e12 },
        { id: "PB", name: "Petabyte (PB) · 10¹⁵", toBase: 1e15 },
        { id: "KiB", name: "Kibibyte (KiB) · 2¹⁰", toBase: 1024 },
        { id: "MiB", name: "Mebibyte (MiB) · 2²⁰", toBase: 1048576 },
        { id: "GiB", name: "Gibibyte (GiB) · 2³⁰", toBase: 1073741824 },
        { id: "TiB", name: "Tebibyte (TiB) · 2⁴⁰", toBase: 1099511627776 },
        { id: "PiB", name: "Pebibyte (PiB) · 2⁵⁰", toBase: 1125899906842624 }
      ]
    },
    {
      id: "energy",
      slug: "unit-energy",
      name: "Năng lượng",
      h1: "Đổi năng lượng · J · kWh · cal",
      lead: "Đổi joule, kilowatt-giờ, calo, BTU…",
      chips: ["J", "kWh", "kcal", "BTU"],
      hint: "J, kWh, cal…",
      base: "J",
      defaults: { from: "kWh", to: "J", value: "1" },
      units: [
        { id: "GJ", name: "Gigajoule (GJ)", toBase: 1e9 },
        { id: "MJ", name: "Megajoule (MJ)", toBase: 1e6 },
        { id: "kJ", name: "Kilojoule (kJ)", toBase: 1000 },
        { id: "J", name: "Joule (J)", toBase: 1 },
        { id: "Wh", name: "Watt-giờ (Wh)", toBase: 3600 },
        { id: "kWh", name: "Kilowatt-giờ (kWh)", toBase: 3.6e6 },
        { id: "cal", name: "Calo nhỏ (cal)", toBase: 4.184 },
        { id: "kcal", name: "Kilocalo (kcal)", toBase: 4184 },
        { id: "BTU", name: "BTU (IT)", toBase: 1055.05585262 },
        { id: "eV", name: "Electronvolt (eV)", toBase: 1.602176634e-19 }
      ]
    },
    {
      id: "pressure",
      slug: "unit-pressure",
      name: "Áp suất",
      h1: "Đổi áp suất · Pa · bar · atm",
      lead: "Đổi pascal, bar, atm, psi, torr…",
      chips: ["Pa", "bar", "atm", "psi"],
      hint: "Pa, bar, atm, psi…",
      base: "Pa",
      defaults: { from: "atm", to: "Pa", value: "1" },
      units: [
        { id: "MPa", name: "Megapascal (MPa)", toBase: 1e6 },
        { id: "kPa", name: "Kilopascal (kPa)", toBase: 1000 },
        { id: "Pa", name: "Pascal (Pa)", toBase: 1 },
        { id: "bar", name: "Bar", toBase: 1e5 },
        { id: "mbar", name: "Millibar (mbar)", toBase: 100 },
        { id: "atm", name: "Khí quyển chuẩn (atm)", toBase: 101325 },
        { id: "torr", name: "Torr (mmHg)", toBase: 133.322368421 },
        { id: "psi", name: "Pound/inch² (psi)", toBase: 6894.757293168 },
        { id: "inHg", name: "Inch thủy ngân (inHg)", toBase: 3386.389 }
      ]
    },
    {
      id: "power",
      slug: "unit-power",
      name: "Công suất",
      h1: "Đổi công suất · W · kW · HP",
      lead: "Đổi watt, kilowatt, mã lực (HP/PS)…",
      chips: ["W · kW", "HP", "PS"],
      hint: "W, kW, HP…",
      base: "W",
      defaults: { from: "kW", to: "HP", value: "1" },
      units: [
        { id: "GW", name: "Gigawatt (GW)", toBase: 1e9 },
        { id: "MW", name: "Megawatt (MW)", toBase: 1e6 },
        { id: "kW", name: "Kilowatt (kW)", toBase: 1000 },
        { id: "W", name: "Watt (W)", toBase: 1 },
        { id: "mW", name: "Milliwatt (mW)", toBase: 0.001 },
        { id: "HP", name: "Mã lực cơ (HP)", toBase: 745.6998715822702 },
        { id: "PS", name: "Mã lực metric (PS)", toBase: 735.49875 },
        { id: "BTUh", name: "BTU/giờ", toBase: 0.2930710701722222 }
      ]
    },
    {
      id: "angle",
      slug: "unit-angle",
      name: "Góc",
      h1: "Đổi góc · độ · radian",
      lead: "Đổi độ, radian, grad, phút/giây cung…",
      chips: ["độ", "radian", "grad"],
      hint: "độ, radian…",
      base: "deg",
      defaults: { from: "deg", to: "rad", value: "180" },
      units: [
        { id: "deg", name: "Độ (°)", toBase: 1 },
        { id: "rad", name: "Radian (rad)", toBase: 180 / Math.PI },
        { id: "grad", name: "Grad (gon)", toBase: 0.9 },
        { id: "arcmin", name: "Phút cung (′)", toBase: 1 / 60 },
        { id: "arcsec", name: "Giây cung (″)", toBase: 1 / 3600 },
        { id: "turn", name: "Vòng (turn)", toBase: 360 }
      ]
    },
    {
      id: "fuel",
      slug: "unit-fuel",
      name: "Tiêu hao nhiên liệu",
      h1: "Đổi tiêu hao nhiên liệu · L/100km · mpg",
      lead: "Đổi L/100km, km/L, mpg Mỹ và mpg Anh.",
      chips: ["L/100km", "km/L", "mpg"],
      hint: "L/100km ↔ mpg",
      base: "L100",
      special: "fuel",
      defaults: { from: "L100", to: "mpg_us", value: "6" },
      units: [
        { id: "L100", name: "Lít / 100 km" },
        { id: "kmL", name: "km / Lít" },
        { id: "mpg_us", name: "mpg (Mỹ)" },
        { id: "mpg_uk", name: "mpg (Anh)" }
      ]
    }
  ];

  function category(id) {
    return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
  }

  function unitMap(cat) {
    const map = Object.create(null);
    (cat.units || []).forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }

  function parseNumber(raw) {
    if (raw == null) return NaN;
    let s = String(raw).trim().replace(/\s+/g, "").replace(",", ".");
    if (!s) return NaN;
    if (/^-?\d+(\.\d+)?e[+-]?\d+$/i.test(s)) return Number(s);
    if (!/^-?\d*\.?\d+$/.test(s)) return NaN;
    return Number(s);
  }

  function tempToKelvin(v, from) {
    switch (from) {
      case "C":
        return v + 273.15;
      case "F":
        return ((v - 32) * 5) / 9 + 273.15;
      case "K":
        return v;
      case "R":
        return (v * 5) / 9;
      default:
        return NaN;
    }
  }

  function kelvinToTemp(k, to) {
    switch (to) {
      case "C":
        return k - 273.15;
      case "F":
        return ((k - 273.15) * 9) / 5 + 32;
      case "K":
        return k;
      case "R":
        return (k * 9) / 5;
      default:
        return NaN;
    }
  }

  /** Quy về L/100km */
  function fuelToL100(v, from) {
    if (!(v > 0) || !Number.isFinite(v)) return NaN;
    switch (from) {
      case "L100":
        return v;
      case "kmL":
        return 100 / v;
      case "mpg_us":
        return 235.214583333333 / v;
      case "mpg_uk":
        return 282.480936327986 / v;
      default:
        return NaN;
    }
  }

  function l100ToFuel(l100, to) {
    if (!(l100 > 0) || !Number.isFinite(l100)) return NaN;
    switch (to) {
      case "L100":
        return l100;
      case "kmL":
        return 100 / l100;
      case "mpg_us":
        return 235.214583333333 / l100;
      case "mpg_uk":
        return 282.480936327986 / l100;
      default:
        return NaN;
    }
  }

  function convertValue(catId, value, fromId, toId) {
    const cat = category(catId);
    const n = typeof value === "number" ? value : parseNumber(value);
    if (!Number.isFinite(n)) return NaN;
    if (fromId === toId) return n;

    if (cat.special === "temperature") {
      const k = tempToKelvin(n, fromId);
      return kelvinToTemp(k, toId);
    }
    if (cat.special === "fuel") {
      const l100 = fuelToL100(n, fromId);
      return l100ToFuel(l100, toId);
    }

    const map = unitMap(cat);
    const from = map[fromId];
    const to = map[toId];
    if (!from || !to || !(from.toBase > 0) || !(to.toBase > 0)) return NaN;
    return (n * from.toBase) / to.toBase;
  }

  function convertAll(catId, value, fromId) {
    const cat = category(catId);
    const n = typeof value === "number" ? value : parseNumber(value);
    return (cat.units || []).map((u) => ({
      id: u.id,
      name: u.name,
      value: Number.isFinite(n) ? convertValue(catId, n, fromId, u.id) : NaN
    }));
  }

  function formatNumber(n, precision) {
    if (!Number.isFinite(n)) return "—";
    const p = Math.max(0, Math.min(12, Number(precision) || 6));
    if (n === 0) return "0";
    const abs = Math.abs(n);
    if (abs >= 1e9 || (abs > 0 && abs < 1e-6)) {
      return n.toExponential(Math.min(p, 8)).replace(/\.?0+e/, "e").replace("e+", "e");
    }
    let s = n.toFixed(p);
    if (s.includes(".")) s = s.replace(/\.?0+$/, "");
    return s;
  }

  function formatVi(n, precision) {
    const raw = formatNumber(n, precision);
    if (raw === "—" || /e/i.test(raw)) return raw;
    const parts = raw.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.length > 1 ? parts[0] + "," + parts[1] : parts[0];
  }

  function noteFor(cat) {
    if (cat.id === "data") {
      return "KB/MB/GB theo SI (10³). KiB/MiB/GiB theo IEC (2¹⁰) — đúng chuẩn máy tính.";
    }
    if (cat.id === "fuel") {
      return "mpg Mỹ ≈ 235,215 ÷ (L/100km). mpg Anh ≈ 282,481 ÷ (L/100km).";
    }
    if (cat.id === "temp") {
      return "°C ↔ °F ↔ K ↔ °R theo công thức nhiệt động lực học chuẩn.";
    }
    return "Hệ số theo chuẩn SI / NIST (lb = 0,45359237 kg, inch = 25,4 mm).";
  }

  function siblingHtml(activeId, baseHref) {
    const root = String(baseHref || "").replace(/\/$/, "");
    return CATEGORIES.map((c) => {
      const href = root + "/" + c.slug + ".html";
      const on = c.id === activeId ? " is-on" : "";
      return (
        '<a class="uc-sib' +
        on +
        '" href="' +
        href +
        '">' +
        c.name +
        "</a>"
      );
    }).join("");
  }

  function mount(opts) {
    const lockedId = String(opts?.catId || document.body?.dataset?.unitCat || "").trim();
    const catLocked = lockedId ? category(lockedId) : null;
    let catId = catLocked ? catLocked.id : "mass";
    let fromId = category(catId).defaults.from;
    let toId = category(catId).defaults.to;

    const catTabs = document.getElementById("catTabs");
    const sibNav = document.getElementById("sibNav");
    const fromValue = document.getElementById("fromValue");
    const toValue = document.getElementById("toValue");
    const fromUnit = document.getElementById("fromUnit");
    const toUnit = document.getElementById("toUnit");
    const formulaBox = document.getElementById("formulaBox");
    const allBody = document.getElementById("allBody");
    const statusEl = document.getElementById("status");
    const precision = document.getElementById("precision");
    const optVi = document.getElementById("optVi");
    const panelTitle = document.getElementById("panelTitle");
    const hintText = document.getElementById("hintText");
    if (!fromValue || !fromUnit || !toUnit) return;

    function setStatus(msg, kind) {
      if (!statusEl) return;
      statusEl.textContent = msg || "";
      statusEl.className =
        "uc-status" + (kind === "ok" ? " is-ok" : kind === "err" ? " is-err" : "");
    }

    function fmt(n) {
      const p = Number(precision?.value) || 6;
      return optVi?.checked ? formatVi(n, p) : formatNumber(n, p);
    }

    function fillSelects() {
      const cat = category(catId);
      const opts = cat.units
        .map((u) => '<option value="' + u.id + '">' + u.name + "</option>")
        .join("");
      fromUnit.innerHTML = opts;
      toUnit.innerHTML = opts;
      if (!cat.units.some((u) => u.id === fromId)) fromId = cat.defaults.from;
      if (!cat.units.some((u) => u.id === toId)) toId = cat.defaults.to;
      fromUnit.value = fromId;
      toUnit.value = toId;
    }

    function unitName(id) {
      const u = category(catId).units.find((x) => x.id === id);
      return u ? u.name : id;
    }

    function refresh() {
      fromId = fromUnit.value;
      toId = toUnit.value;
      const raw = fromValue.value;
      const n = parseNumber(raw);
      if (!String(raw).trim()) {
        toValue.value = "";
        formulaBox.textContent = "Nhập một số để xem kết quả.";
        allBody.innerHTML = "";
        setStatus("Chờ nhập giá trị…");
        return;
      }
      if (!Number.isFinite(n)) {
        toValue.value = "";
        formulaBox.textContent = "Số không hợp lệ.";
        allBody.innerHTML = "";
        setStatus("Chỉ nhập số (dùng dấu . hoặc ,).", "err");
        return;
      }

      const out = convertValue(catId, n, fromId, toId);
      toValue.value = fmt(out);
      formulaBox.textContent =
        fmt(n) + " " + unitName(fromId) + "  =  " + fmt(out) + " " + unitName(toId);

      const rows = convertAll(catId, n, fromId);
      allBody.innerHTML = rows
        .map((r) => {
          const cls = r.id === fromId ? "is-from" : r.id === toId ? "is-to" : "";
          return (
            '<tr class="' +
            cls +
            '">' +
            "<td>" +
            r.name +
            "</td>" +
            '<td class="uc-val">' +
            fmt(r.value) +
            "</td>" +
            '<td><button type="button" data-copy="' +
            encodeURIComponent(String(r.value)) +
            '">Chép</button></td>' +
            "</tr>"
          );
        })
        .join("");

      setStatus("Đã đổi · " + category(catId).name, "ok");
    }

    function setCategory(id, resetDefaults) {
      catId = id;
      const cat = category(id);
      if (resetDefaults !== false) {
        fromId = cat.defaults.from;
        toId = cat.defaults.to;
        fromValue.value = cat.defaults.value;
      }
      if (panelTitle) panelTitle.textContent = "1 · " + cat.name;
      if (hintText) hintText.textContent = noteFor(cat);
      if (catTabs) {
        catTabs.querySelectorAll(".uc-cat").forEach((btn) => {
          const on = btn.dataset.cat === id;
          btn.classList.toggle("is-on", on);
          btn.setAttribute("aria-selected", on ? "true" : "false");
        });
      }
      fillSelects();
      refresh();
    }

    if (sibNav) {
      const base =
        opts?.sibBase ||
        (window.OT_BASE ? String(window.OT_BASE).replace(/\/$/, "") + "/cong-cu-don-vi" : ".");
      sibNav.innerHTML = siblingHtml(catId, base);
    }

    if (catTabs) {
      if (catLocked) {
        catTabs.hidden = true;
        catTabs.innerHTML = "";
      } else {
        catTabs.hidden = false;
        catTabs.innerHTML = "";
        CATEGORIES.forEach((c) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "uc-cat";
          btn.dataset.cat = c.id;
          btn.setAttribute("role", "tab");
          btn.textContent = c.name;
          btn.title = c.hint;
          btn.addEventListener("click", () => {
            setCategory(c.id, true);
            if (sibNav) {
              const base =
                opts?.sibBase ||
                (window.OT_BASE
                  ? String(window.OT_BASE).replace(/\/$/, "") + "/cong-cu-don-vi"
                  : ".");
              sibNav.innerHTML = siblingHtml(c.id, base);
            }
          });
          catTabs.appendChild(btn);
        });
      }
    }

    fromValue.addEventListener("input", refresh);
    fromUnit.addEventListener("change", refresh);
    toUnit.addEventListener("change", refresh);
    precision?.addEventListener("change", refresh);
    optVi?.addEventListener("change", refresh);

    document.getElementById("swapBtn")?.addEventListener("click", () => {
      const n = parseNumber(fromValue.value);
      const nextFrom = toUnit.value;
      const nextTo = fromUnit.value;
      if (Number.isFinite(n)) {
        const swapped = convertValue(catId, n, fromUnit.value, nextFrom);
        fromValue.value = Number.isFinite(swapped)
          ? formatNumber(swapped, 12)
          : fromValue.value;
      }
      fromUnit.value = nextFrom;
      toUnit.value = nextTo;
      refresh();
      setStatus("Đã đảo chiều đơn vị.", "ok");
    });

    document.getElementById("copyBtn")?.addEventListener("click", async () => {
      const text = formulaBox.textContent || "";
      if (!text || text === "—") return;
      try {
        await window.OT.copyText(text);
        setStatus("Đã sao chép công thức kết quả.", "ok");
      } catch (e) {
        setStatus(e.message || "Không sao chép được.", "err");
      }
    });

    document.getElementById("sampleBtn")?.addEventListener("click", () => {
      const cat = category(catId);
      fromValue.value = cat.defaults.value;
      fromUnit.value = cat.defaults.from;
      toUnit.value = cat.defaults.to;
      refresh();
      setStatus("Đã nạp giá trị mẫu.", "ok");
    });

    allBody?.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-copy]");
      if (!btn) return;
      const raw = decodeURIComponent(btn.getAttribute("data-copy") || "");
      const n = Number(raw);
      const text = Number.isFinite(n) ? fmt(n) : raw;
      try {
        await window.OT.copyText(text);
        setStatus("Đã sao chép " + text, "ok");
      } catch (err) {
        setStatus(err.message || "Không sao chép được.", "err");
      }
    });

    setCategory(catId, true);
  }

  return {
    CATEGORIES,
    category,
    parseNumber,
    convertValue,
    convertAll,
    formatNumber,
    formatVi,
    noteFor,
    siblingHtml,
    mount
  };
})();
