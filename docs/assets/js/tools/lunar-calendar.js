/**
 * Âm lịch Việt Nam — thuật toán Hồ Ngọc Đức (timezone +7).
 * Phạm vi tin cậy khoảng 1800–2199.
 */
window.OTLunar = (function () {
  "use strict";

  const PI = Math.PI;
  const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  const CHI_ANIMAL = [
    "Chuột", "Trâu", "Hổ", "Mèo", "Rồng", "Rắn",
    "Ngựa", "Dê", "Khỉ", "Gà", "Chó", "Lợn"
  ];
  const WEEKDAYS = [
    "Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"
  ];
  const MONTH_VI = [
    "", "Giêng", "Hai", "Ba", "Tư", "Năm", "Sáu",
    "Bảy", "Tám", "Chín", "Mười", "Mười Một", "Chạp"
  ];

  function INT(d) {
    return Math.floor(d);
  }

  function jdFromDate(dd, mm, yy) {
    const a = INT((14 - mm) / 12);
    const y = yy + 4800 - a;
    const m = mm + 12 * a - 3;
    let jd =
      dd +
      INT((153 * m + 2) / 5) +
      365 * y +
      INT(y / 4) -
      INT(y / 100) +
      INT(y / 400) -
      32045;
    if (jd < 2299161) {
      jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    }
    return jd;
  }

  function jdToDate(jd) {
    let a, b, c;
    if (jd > 2299160) {
      a = jd + 32044;
      b = INT((4 * a + 3) / 146097);
      c = a - INT((b * 146097) / 4);
    } else {
      b = 0;
      c = jd + 32082;
    }
    const d = INT((4 * c + 3) / 1461);
    const e = c - INT((1461 * d) / 4);
    const m = INT((5 * e + 2) / 153);
    const day = e - INT((153 * m + 2) / 5) + 1;
    const month = m + 3 - 12 * INT(m / 10);
    const year = b * 100 + d - 4800 + INT(m / 10);
    return { day, month, year };
  }

  function NewMoon(k) {
    const T = k / 1236.85;
    const T2 = T * T;
    const T3 = T2 * T;
    const dr = PI / 180;
    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    let C1 =
      (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    let deltat;
    if (T < -11) {
      deltat =
        0.001 +
        0.000839 * T +
        0.0002261 * T2 -
        0.00000845 * T3 -
        0.000000081 * T * T3;
    } else {
      deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
    }
    return Jd1 + C1 - deltat;
  }

  function SunLongitude(jdn) {
    const T = (jdn - 2451545.0) / 36525;
    const T2 = T * T;
    const dr = PI / 180;
    const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL =
      DL +
      (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) +
      0.00029 * Math.sin(dr * 3 * M);
    let L = L0 + DL;
    L = L * dr;
    L = L - PI * 2 * INT(L / (PI * 2));
    return L;
  }

  function getSunLongitude(dayNumber, timeZone) {
    return INT((SunLongitude(dayNumber - 0.5 - timeZone / 24) / PI) * 6);
  }

  function getNewMoonDay(k, timeZone) {
    return INT(NewMoon(k) + 0.5 + timeZone / 24);
  }

  function getLunarMonth11(yy, timeZone) {
    const off = jdFromDate(31, 12, yy) - 2415021;
    const k = INT(off / 29.530588853);
    let nm = getNewMoonDay(k, timeZone);
    const sunLong = getSunLongitude(nm, timeZone);
    if (sunLong >= 9) {
      nm = getNewMoonDay(k - 1, timeZone);
    }
    return nm;
  }

  function getLeapMonthOffset(a11, timeZone) {
    const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let last = 0;
    let i = 1;
    let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    do {
      last = arc;
      i++;
      arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    } while (arc !== last && i < 14);
    return i - 1;
  }

  function solarToLunar(dd, mm, yy, timeZone) {
    const tz = timeZone == null ? 7 : timeZone;
    const dayNumber = jdFromDate(dd, mm, yy);
    const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1, tz);
    if (monthStart > dayNumber) {
      monthStart = getNewMoonDay(k, tz);
    }
    let a11 = getLunarMonth11(yy, tz);
    let b11 = a11;
    let lunarYear;
    if (a11 >= monthStart) {
      lunarYear = yy;
      a11 = getLunarMonth11(yy - 1, tz);
    } else {
      lunarYear = yy + 1;
      b11 = getLunarMonth11(yy + 1, tz);
    }
    const lunarDay = dayNumber - monthStart + 1;
    const diff = INT((monthStart - a11) / 29);
    let lunarLeap = 0;
    let lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      const leapMonthDiff = getLeapMonthOffset(a11, tz);
      if (diff >= leapMonthDiff) {
        lunarMonth = diff + 10;
        if (diff === leapMonthDiff) {
          lunarLeap = 1;
        }
      }
    }
    if (lunarMonth > 12) {
      lunarMonth = lunarMonth - 12;
    }
    if (lunarMonth >= 11 && diff < 4) {
      lunarYear -= 1;
    }
    return {
      day: lunarDay,
      month: lunarMonth,
      year: lunarYear,
      leap: lunarLeap === 1,
      jd: dayNumber
    };
  }

  function lunarToSolar(lunarDay, lunarMonth, lunarYear, lunarLeap, timeZone) {
    const tz = timeZone == null ? 7 : timeZone;
    let a11, b11;
    if (lunarMonth < 11) {
      a11 = getLunarMonth11(lunarYear - 1, tz);
      b11 = getLunarMonth11(lunarYear, tz);
    } else {
      a11 = getLunarMonth11(lunarYear, tz);
      b11 = getLunarMonth11(lunarYear + 1, tz);
    }
    const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    let off = lunarMonth - 11;
    if (off < 0) off += 12;
    if (b11 - a11 > 365) {
      const leapOff = getLeapMonthOffset(a11, tz);
      let leapMonth = leapOff - 2;
      if (leapMonth < 0) leapMonth += 12;
      if (lunarLeap && lunarMonth !== leapMonth) {
        return null;
      }
      if (lunarLeap || off >= leapOff) {
        off += 1;
      }
    }
    const monthStart = getNewMoonDay(k + off, tz);
    return jdToDate(monthStart + lunarDay - 1);
  }

  function yearCanChi(year) {
    return CAN[(year + 6) % 10] + " " + CHI[(year + 8) % 12];
  }

  function yearAnimal(year) {
    return CHI_ANIMAL[(year + 8) % 12];
  }

  function dayCanChi(jd) {
    return CAN[(jd + 9) % 10] + " " + CHI[(jd + 1) % 12];
  }

  function monthCanChi(lunarMonth, lunarYear) {
    // Can của tháng phụ thuộc năm âm; Chi theo tháng
    const canIndex = (lunarYear * 12 + lunarMonth + 3) % 10;
    return CAN[canIndex] + " " + CHI[(lunarMonth + 1) % 12];
  }

  function weekdayName(jd) {
    // jd 0 = Monday in some systems; Ho Ngoc Duc: (jd + 1) % 7 — Sun=0 with jdFromDate
    // Standard: JD 0 was Monday; for civil: (jd + 1) % 7 == 0 Sunday when using this jdFromDate
    return WEEKDAYS[(jd + 1) % 7];
  }

  function monthNameVi(month, leap) {
    const base = MONTH_VI[month] || String(month);
    return leap ? "Nhuận " + base : "Tháng " + base;
  }

  function formatSolar(d, m, y) {
    return (
      String(d).padStart(2, "0") +
      "/" +
      String(m).padStart(2, "0") +
      "/" +
      y
    );
  }

  function formatLunar(d, m, y, leap) {
    return (
      String(d).padStart(2, "0") +
      "/" +
      String(m).padStart(2, "0") +
      "/" +
      y +
      (leap ? " (nhuận)" : "")
    );
  }

  function validateSolar(d, m, y) {
    if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) {
      throw new Error("Ngày tháng năm không hợp lệ.");
    }
    if (y < 1800 || y > 2199) throw new Error("Năm dương lịch hỗ trợ 1800–2199.");
    if (m < 1 || m > 12) throw new Error("Tháng phải từ 1–12.");
    const dim = new Date(y, m, 0).getDate();
    if (d < 1 || d > dim) throw new Error("Ngày không tồn tại trong tháng này.");
  }

  function validateLunar(d, m, y) {
    if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) {
      throw new Error("Ngày tháng năm không hợp lệ.");
    }
    if (y < 1800 || y > 2199) throw new Error("Năm âm lịch hỗ trợ 1800–2199.");
    if (m < 1 || m > 12) throw new Error("Tháng âm phải từ 1–12.");
    if (d < 1 || d > 30) throw new Error("Ngày âm thường từ 1–30.");
  }

  function convertSolarToLunar(d, m, y) {
    validateSolar(d, m, y);
    const lunar = solarToLunar(d, m, y, 7);
    const jd = jdFromDate(d, m, y);
    return {
      solar: { day: d, month: m, year: y },
      lunar,
      weekday: weekdayName(jd),
      yearCanChi: yearCanChi(lunar.year),
      yearAnimal: yearAnimal(lunar.year),
      monthCanChi: monthCanChi(lunar.month, lunar.year),
      dayCanChi: dayCanChi(jd),
      monthLabel: monthNameVi(lunar.month, lunar.leap),
      jd
    };
  }

  function convertLunarToSolar(d, m, y, leap) {
    validateLunar(d, m, y);
    const solar = lunarToSolar(d, m, y, !!leap, 7);
    if (!solar) {
      throw new Error("Tháng này không phải tháng nhuận trong năm âm đã chọn.");
    }
    // Verify round-trip: if leap requested but conversion landed elsewhere, still ok if solar exists
    const check = solarToLunar(solar.day, solar.month, solar.year, 7);
    if (leap && !check.leap) {
      throw new Error("Năm âm này không có tháng nhuận " + m + ".");
    }
    if (!leap && check.leap && check.month === m && check.day === d) {
      // ambiguous day exists in both — prefer non-leap path already taken
    }
    const jd = jdFromDate(solar.day, solar.month, solar.year);
    return {
      solar,
      lunar: { day: d, month: m, year: y, leap: !!leap, jd },
      weekday: weekdayName(jd),
      yearCanChi: yearCanChi(y),
      yearAnimal: yearAnimal(y),
      monthCanChi: monthCanChi(m, y),
      dayCanChi: dayCanChi(jd),
      monthLabel: monthNameVi(m, !!leap),
      jd
    };
  }

  function todayInfo() {
    const now = new Date();
    return convertSolarToLunar(now.getDate(), now.getMonth() + 1, now.getFullYear());
  }

  return {
    CAN,
    CHI,
    CHI_ANIMAL,
    WEEKDAYS,
    MONTH_VI,
    solarToLunar,
    lunarToSolar,
    convertSolarToLunar,
    convertLunarToSolar,
    yearCanChi,
    yearAnimal,
    dayCanChi,
    monthCanChi,
    weekdayName,
    monthNameVi,
    formatSolar,
    formatLunar,
    todayInfo,
    jdFromDate
  };
})();
