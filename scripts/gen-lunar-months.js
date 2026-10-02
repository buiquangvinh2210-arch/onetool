(function () {
  "use strict";
  const FROM = { y: 2026, m: 1 };
  const TO = { y: 2027, m: 12 };
  const PUBLISHED = "2026-10-02";
  const V = { catalog: "20261002k", layout: "20261002g", core: "20261002a", site: "20261002c", blog: "20261002b" };

  const L = window.OTLunar;
  const F = window.OTFortune;
  const ORIGIN = "https://onetool.vn";
  const WD = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const TAM_NUONG = [3, 7, 13, 18, 22, 27];
  const NGUYET_KY = [5, 14, 23];

  const SOLAR_EVENTS = {
    "1-1": "Tết Dương lịch", "3-2": "Thành lập Đảng Cộng sản Việt Nam", "14-2": "Lễ tình nhân (Valentine)",
    "8-3": "Quốc tế Phụ nữ", "30-4": "Ngày Giải phóng miền Nam", "1-5": "Quốc tế Lao động",
    "1-6": "Quốc tế Thiếu nhi", "27-7": "Ngày Thương binh Liệt sĩ", "2-9": "Quốc khánh",
    "20-10": "Ngày Phụ nữ Việt Nam", "20-11": "Ngày Nhà giáo Việt Nam", "22-12": "Thành lập Quân đội Nhân dân",
    "24-12": "Đêm Giáng sinh", "25-12": "Lễ Giáng sinh"
  };
  const LUNAR_EVENTS = {
    "1-1": "Tết Nguyên đán", "2-1": "Mùng 2 Tết", "3-1": "Mùng 3 Tết", "10-1": "Vía Thần Tài",
    "15-1": "Rằm tháng Giêng (Tết Nguyên tiêu)", "3-3": "Tết Hàn thực", "10-3": "Giỗ Tổ Hùng Vương",
    "15-4": "Lễ Phật đản", "5-5": "Tết Đoan ngọ", "15-7": "Lễ Vu Lan (rằm tháng Bảy)",
    "15-8": "Tết Trung thu", "15-10": "Tết Hạ nguyên (rằm tháng Mười)", "23-12": "Ông Công ông Táo"
  };

  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const pad = (n) => String(n).padStart(2, "0");
  const ddmm = (d, m) => pad(d) + "/" + pad(m);
  const full = (d, m, y) => ddmm(d, m) + "/" + y;
  const slug = (m, y) => "thang-" + m + "-" + y + ".html";
  const lunarMonthName = (lm, leap) => L.monthNameVi(lm, leap).replace(/^Tháng /, "tháng ").replace(/^Nhuận /, "tháng nhuận ");
  const lunarYearName = (ly) => L.yearCanChi(ly);
  const wdIndex = (jd) => (jd + 1) % 7;
  const wdFull = (jd) => L.weekdayName(jd);
  const dim = (m, y) => new Date(y, m, 0).getDate();
  const inRange = (m, y) => (y > FROM.y || (y === FROM.y && m >= FROM.m)) && (y < TO.y || (y === TO.y && m <= TO.m));
  const shift = (m, y, k) => { const t = y * 12 + (m - 1) + k; return { m: (t % 12) + 1, y: Math.floor(t / 12) }; };

  function dayData(d, m, y) {
    const jd = L.jdFromDate(d, m, y);
    const lunar = L.solarToLunar(d, m, y, 7);
    const next = L.solarToLunar(...(() => { const n = new Date(y, m - 1, d + 1); return [n.getDate(), n.getMonth() + 1, n.getFullYear()]; })(), 7);
    const guide = L.dayGuide(jd, lunar.month);
    const truc = F.TRUC[F.trucIndex(jd)];
    const events = [];
    if (SOLAR_EVENTS[d + "-" + m]) events.push(SOLAR_EVENTS[d + "-" + m]);
    if (!lunar.leap) {
      if (LUNAR_EVENTS[lunar.day + "-" + lunar.month]) events.push(LUNAR_EVENTS[lunar.day + "-" + lunar.month]);
      if (lunar.month === 12 && next.day === 1) events.push("Giao thừa (tối " + full(d, m, y) + ")");
    }
    const term = L.solarTermIndex(jd) !== L.solarTermIndex(jd - 1) ? L.solarTerm(jd) : "";
    const warn = TAM_NUONG.includes(lunar.day) ? "Tam nương" : NGUYET_KY.includes(lunar.day) ? "Nguyệt kỵ" : "";
    const fits = F.ACTIVITIES.filter((a) => F.fitsActivity(jd, lunar, a.id, null));
    return {
      d, m, y, jd, lunar, guide, truc, events, term, warn, fits,
      canChi: L.dayCanChi(jd),
      hours: L.luckyHours(jd).map((h) => h.name),
      wd: wdIndex(jd)
    };
  }

  function monthData(m, y) {
    const days = [];
    for (let d = 1; d <= dim(m, y); d++) days.push(dayData(d, m, y));
    const spans = [];
    days.forEach((x) => {
      const key = x.lunar.year + "-" + x.lunar.month + "-" + (x.lunar.leap ? 1 : 0);
      if (!spans.length || spans[spans.length - 1].key !== key) spans.push({ key, lm: x.lunar.month, ly: x.lunar.year, leap: x.lunar.leap });
    });
    return { m, y, days, spans };
  }

  const spanText = (s) => lunarMonthName(s.lm, s.leap) + " (" + L.monthCanChi(s.lm, s.ly) + ")";

  function spansSentence(md) {
    const years = [...new Set(md.spans.map((s) => s.ly))];
    if (years.length === 1) return md.spans.map(spanText).join(" và ") + " năm " + lunarYearName(years[0]);
    return md.spans.map((s) => spanText(s) + " năm " + lunarYearName(s.ly)).join(" và ");
  }

  const short = (x) => "<b>" + ddmm(x.d, x.m) + "</b> <small>" + WD[x.wd] + " · " + x.lunar.day + "/" + x.lunar.month + "</small>";

  function head({ title, desc, path, ogTitle, jsonld }) {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <link rel="icon" href="/assets/img/favicon-96.png" type="image/png" sizes="96x96" />
  <link rel="icon" href="/assets/img/favicon-192.png" type="image/png" sizes="192x192" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="shortcut icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" sizes="180x180" />
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <script>
(function(){try{var t=localStorage.getItem("lamai-theme");var r=document.documentElement;if(t)r.setAttribute("data-theme",t);else if(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)r.setAttribute("data-theme","dark");}catch(e){}})();
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${ORIGIN}/${path}" />
  <meta name="robots" content="index,follow" />
  <meta property="og:title" content="${esc(ogTitle)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${ORIGIN}/${path}" />
  <meta property="og:type" content="article" />
  <meta property="og:image" content="${ORIGIN}/assets/img/og-lunar.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <link rel="stylesheet" href="../assets/css/site.css?v=20260911a" />
  <link rel="stylesheet" href="../assets/css/blog.css?v=${V.blog}" />
  <link rel="stylesheet" href="../assets/css/shell-critical.css?v=20260826p" />
  <link rel="stylesheet" href="../assets/css/ot-shell.css?v=20260903a" />
  <link rel="stylesheet" href="../assets/css/components.css?v=20260826r" />
  <script>window.OT_BASE = "..";</script>
${jsonld.map((j) => '  <script type="application/ld+json">' + JSON.stringify(j) + "</script>").join("\n")}
</head>`;
  }

  const foot = () => `<div id="site-footer"></div>
<script src="../assets/js/catalog.js?v=${V.catalog}"></script>
<script src="../assets/js/layout.js?v=${V.layout}"></script>
<script src="../assets/js/core.js?v=${V.core}"></script>
<script src="../assets/js/site.js?v=${V.site}"></script>
</body>
</html>
`;

  function calendarGrid(md) {
    const first = md.days[0].wd;
    const lead = (first + 6) % 7;
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push('<td class="lm-out"></td>');
    md.days.forEach((x) => {
      const cls = ["lm-day"];
      if (x.guide.good) cls.push("is-hd");
      if (x.events.length) cls.push("is-ev");
      if (x.wd === 0) cls.push("is-sun");
      if (x.lunar.day === 1 || x.lunar.day === 15) cls.push("is-moon");
      const lun = x.lunar.day === 1 ? "1/" + x.lunar.month + (x.lunar.leap ? "N" : "") : String(x.lunar.day);
      const tip = full(x.d, x.m, x.y) + " · âm lịch " + x.lunar.day + "/" + x.lunar.month + (x.guide.good ? " · hoàng đạo" : "") + (x.events.length ? " · " + x.events.join(", ") : "");
      cells.push(`<td class="${cls.join(" ")}" title="${esc(tip)}"><b>${x.d}</b><small>${lun}</small></td>`);
    });
    while (cells.length % 7) cells.push('<td class="lm-out"></td>');
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push("<tr>" + cells.slice(i, i + 7).join("") + "</tr>");
    return `<div class="lm-cal-wrap"><table class="lm-cal">
          <caption>Lịch âm tháng ${md.m}/${md.y}</caption>
          <thead><tr><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>T6</th><th>T7</th><th>CN</th></tr></thead>
          <tbody>${rows.join("")}</tbody>
        </table>
        <p class="lm-legend"><span class="lm-k lm-k-hd"></span> Ngày hoàng đạo <span class="lm-k lm-k-ev"></span> Ngày lễ <span class="lm-k lm-k-moon"></span> Mùng 1, rằm</p></div>`;
  }

  function monthPage(md) {
    const { m, y, days } = md;
    const path = "lich-am/" + slug(m, y);
    const firsts = days.filter((x) => x.lunar.day === 1);
    const fulls = days.filter((x) => x.lunar.day === 15);
    const terms = days.filter((x) => x.term);
    const events = days.filter((x) => x.events.length);
    const hd = days.filter((x) => x.guide.good);
    const tam = days.filter((x) => x.warn === "Tam nương");
    const nk = days.filter((x) => x.warn === "Nguyệt kỵ");
    const a = days[0], z = days[days.length - 1];
    const prev = shift(m, y, -1), next = shift(m, y, 1);
    const yName = (x) => lunarMonthName(x.lunar.month, x.lunar.leap) + " năm " + lunarYearName(x.lunar.year);

    const descBits = [];
    if (firsts[0]) descBits.push("mùng 1 " + lunarMonthName(firsts[0].lunar.month, firsts[0].lunar.leap) + " là " + ddmm(firsts[0].d, m));
    if (fulls[0]) descBits.push("rằm " + ddmm(fulls[0].d, m));
    let desc = "Lịch âm tháng " + m + "/" + y + (descBits.length ? ": " + descBits.join(", ") : "") +
      ". Ngày tốt cưới hỏi, khai trương, giờ hoàng đạo từng ngày và ngày lễ trong tháng.";
    if (desc.length > 160) desc = "Lịch âm tháng " + m + "/" + y + ": ngày tốt cưới hỏi, khai trương, động thổ, giờ hoàng đạo từng ngày, mùng 1, rằm và ngày lễ.";

    const faqs = [];
    firsts.forEach((x) => faqs.push([
      "Mùng 1 " + yName(x) + " là ngày nào?",
      "Mùng 1 " + yName(x) + " là " + wdFull(x.jd) + ", ngày " + full(x.d, m, y) + " dương lịch."
    ]));
    fulls.forEach((x) => faqs.push([
      "Rằm " + yName(x) + " là ngày nào?",
      "Rằm (ngày 15) " + yName(x) + " là " + wdFull(x.jd) + ", ngày " + full(x.d, m, y) + " dương lịch."
    ]));
    const wed = days.filter((x) => x.fits.some((f) => f.id === "cuoi-hoi"));
    faqs.push([
      "Tháng " + m + "/" + y + " có ngày nào tốt để cưới hỏi?",
      wed.length
        ? "Theo tiêu chí hoàng đạo, trực hợp việc và tránh Tam nương, Nguyệt kỵ, các ngày đẹp để cưới hỏi là " + wed.map((x) => ddmm(x.d, m)).join(", ") + ". Nên đối chiếu thêm với tuổi cô dâu chú rể."
        : "Tháng này không có ngày đạt đủ các tiêu chí phổ biến cho cưới hỏi. Bạn có thể xem tháng " + next.m + "/" + next.y + "."
    ]);
    faqs.push([
      "Tháng " + m + "/" + y + " có những ngày lễ nào?",
      events.length
        ? events.map((x) => x.events.join(", ") + " (" + ddmm(x.d, m) + ")").join("; ") + "."
        : "Tháng " + m + "/" + y + " không có ngày lễ lớn theo cả dương lịch và âm lịch."
    ]);

    const title = "Lịch âm tháng " + m + "/" + y + ": ngày tốt, ngày hoàng đạo | OneTool";
    const jsonld = [
      { "@context": "https://schema.org", "@type": "Article", headline: "Lịch âm tháng " + m + " năm " + y, description: desc,
        image: ORIGIN + "/assets/img/og-lunar.png", datePublished: PUBLISHED, dateModified: PUBLISHED,
        author: { "@type": "Organization", name: "OneTool" },
        publisher: { "@type": "Organization", name: "OneTool", logo: { "@type": "ImageObject", url: ORIGIN + "/assets/img/logo-mark.png" } },
        mainEntityOfPage: ORIGIN + "/" + path, inLanguage: "vi" },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: ORIGIN + "/" },
        { "@type": "ListItem", position: 2, name: "Lịch âm các tháng", item: ORIGIN + "/lich-am/" },
        { "@type": "ListItem", position: 3, name: "Tháng " + m + "/" + y, item: ORIGIN + "/" + path } ] },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([q, ans]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: ans } })) }
    ];

    const facts = [];
    [...firsts.map((x) => ["Mùng 1", x]), ...fulls.map((x) => ["Rằm", x])]
      .sort((p, q) => p[1].d - q[1].d)
      .forEach(([t, x]) => facts.push(`<li><strong>${t} ${esc(yName(x))}:</strong> ${esc(wdFull(x.jd))}, ${full(x.d, m, y)}</li>`));
    terms.forEach((x) => facts.push(`<li><strong>Tiết ${esc(x.term)}:</strong> bắt đầu ${esc(wdFull(x.jd))}, ${full(x.d, m, y)}</li>`));
    facts.push(`<li><strong>Ngày hoàng đạo:</strong> ${hd.length} ngày trong tháng</li>`);

    const actRows = F.ACTIVITIES.map((act) => {
      const list = days.filter((x) => x.fits.some((f) => f.id === act.id));
      return `<tr><td>${act.icon} ${esc(act.name)}</td><td>${list.length ? list.map(short).join(", ") : "<small>Không có ngày đạt đủ tiêu chí</small>"}</td></tr>`;
    }).join("\n            ");

    const dayRows = days.map((x) => {
      const note = [x.events.join(", "), x.term ? "Tiết " + x.term : "", x.warn].filter(Boolean).join(" · ");
      return `<tr class="${x.guide.good ? "is-hd" : ""}${x.wd === 0 ? " is-sun" : ""}"><td><b>${WD[x.wd]} ${ddmm(x.d, m)}</b>${note ? "<small>" + esc(note) + "</small>" : ""}</td><td>${x.lunar.day}/${x.lunar.month}${x.lunar.leap ? " (N)" : ""}</td><td>${esc(x.canChi)}</td><td>${x.guide.good ? "✓ " : ""}${esc(x.guide.god)}<small>Trực ${esc(x.truc.name)}</small></td><td>${esc(x.hours.join(", "))}</td></tr>`;
    }).join("\n            ");

    const evList = events.length
      ? "<ul>" + events.map((x) => `<li><strong>${full(x.d, m, y)}</strong> (${WD[x.wd]}, ${x.lunar.day}/${x.lunar.month} âm lịch): ${esc(x.events.join(", "))}</li>`).join("") + "</ul>"
      : "<p>Tháng này không có ngày lễ lớn theo dương lịch hay âm lịch.</p>";

    const related = [`<li><a href="../cong-cu-tien-ich/lunar-calendar.html">Lịch âm hôm nay — xem ngày tốt theo tuổi</a></li>`];
    if (y === 2026 || (y === 2027 && m <= 2)) related.push(`<li><a href="../blog/lich-am-2026.html">Lịch âm 2026: mùng 1, rằm và ngày lễ cả năm</a></li>`);
    if ((y === 2026 && m >= 10) || (y === 2027 && m === 1)) related.push(`<li><a href="../blog/xem-ngay-tot-cuoi-nam-2026.html">Xem ngày tốt cuối năm 2026</a></li>`);
    related.push(`<li><a href="../blog/van-khan-mung-1-ngay-ram.html">Văn khấn mùng 1 và ngày rằm</a></li>`);

    return head({ title, desc, path, ogTitle: "Lịch âm tháng " + m + "/" + y + " — ngày tốt, giờ hoàng đạo", jsonld }) + `
<body class="blog-page" data-tool="lunar-month">
<div id="site-header"></div>
<main role="main">
  <article class="blog-article lm-page">
    <header class="blog-article-head">
      <div class="blog-card-meta"><a href="./">Lịch âm các tháng</a><span>Năm ${esc(lunarYearName(a.lunar.year))}${a.lunar.year !== z.lunar.year ? " – " + esc(lunarYearName(z.lunar.year)) : ""}</span></div>
      <h1>Lịch âm tháng ${m} năm ${y}</h1>
      <p class="lede">Tháng ${m}/${y} dương lịch bắt đầu ngày <strong>${a.lunar.day}/${a.lunar.month} âm lịch</strong> và kết thúc ngày <strong>${z.lunar.day}/${z.lunar.month} âm lịch</strong>, thuộc ${esc(spansSentence(md))}.</p>
    </header>
    <nav class="lm-nav" aria-label="Chuyển tháng">
      ${inRange(prev.m, prev.y) ? `<a href="${slug(prev.m, prev.y)}">← Tháng ${prev.m}/${prev.y}</a>` : "<span></span>"}
      <a href="./">Tất cả các tháng</a>
      ${inRange(next.m, next.y) ? `<a href="${slug(next.m, next.y)}">Tháng ${next.m}/${next.y} →</a>` : "<span></span>"}
    </nav>
    <div class="blog-prose">
      ${calendarGrid(md)}

      <h2>Điểm nhanh tháng ${m}/${y}</h2>
      <ul>
        ${facts.join("\n        ")}
      </ul>

      <h2>Ngày lễ tháng ${m}/${y}</h2>
      ${evList}

      <h2>Ngày tốt tháng ${m}/${y} theo từng việc</h2>
      <p>Ngày được chọn khi đủ ba điều kiện: là ngày hoàng đạo, có trực hợp với việc định làm, và không rơi vào Tam nương hay Nguyệt kỵ. Danh sách chưa xét tuổi; muốn lọc theo năm sinh, hãy dùng <a href="../cong-cu-tien-ich/lunar-calendar.html">lịch âm</a> và nhập tuổi ở tab Xem tuổi.</p>
      <div class="blog-table-wrap">
        <table class="lm-act">
          <thead><tr><th>Việc</th><th>Ngày đẹp <small>(dương lịch · thứ · âm lịch)</small></th></tr></thead>
          <tbody>
            ${actRows}
          </tbody>
        </table>
      </div>

      <h2>Ngày nên tránh trong tháng ${m}/${y}</h2>
      <ul>
        <li><strong>Tam nương</strong> (mùng 3, 7, 13, 18, 22, 27 âm lịch): ${tam.length ? tam.map((x) => ddmm(x.d, m)).join(", ") : "không có"}.</li>
        <li><strong>Nguyệt kỵ</strong> (mùng 5, 14, 23 âm lịch): ${nk.length ? nk.map((x) => ddmm(x.d, m)).join(", ") : "không có"}.</li>
        <li><strong>Ngày hắc đạo:</strong> ${days.length - hd.length} ngày, là các ngày không có dấu ✓ trong bảng bên dưới.</li>
      </ul>

      <div class="blog-cta">
        <strong>Xem ngày hợp tuổi của bạn</strong>
        Nhập năm sinh để lịch tô xanh ngày hợp tuổi, kèm giờ tốt, việc nên làm và quẻ đầu ngày.
        <a class="btn btn-primary" href="../cong-cu-tien-ich/lunar-calendar.html">Mở lịch âm →</a>
      </div>

      <h2>Chi tiết từng ngày tháng ${m}/${y}</h2>
      <p>Dấu ✓ là ngày hoàng đạo. Giờ hoàng đạo ghi theo tên giờ: Tý 23–1h, Sửu 1–3h, Dần 3–5h, Mão 5–7h, Thìn 7–9h, Tỵ 9–11h, Ngọ 11–13h, Mùi 13–15h, Thân 15–17h, Dậu 17–19h, Tuất 19–21h, Hợi 21–23h.</p>
      <div class="blog-table-wrap">
        <table class="lm-days">
          <thead><tr><th>Ngày</th><th>Âm lịch</th><th>Can Chi</th><th>Sao · Trực</th><th>Giờ hoàng đạo</th></tr></thead>
          <tbody>
            ${dayRows}
          </tbody>
        </table>
      </div>

      <h2>Câu hỏi thường gặp</h2>
      ${faqs.map(([q, ans]) => `<p><strong>${esc(q)}</strong><br />${esc(ans)}</p>`).join("\n      ")}

      <p class="lm-note">Ngày tốt xấu, giờ hoàng đạo và trực ngày được tính theo phong tục lịch vạn niên Việt Nam (múi giờ UTC+7), chỉ mang tính tham khảo.</p>
    </div>
    <nav class="lm-nav" aria-label="Chuyển tháng">
      ${inRange(prev.m, prev.y) ? `<a href="${slug(prev.m, prev.y)}">← Tháng ${prev.m}/${prev.y}</a>` : "<span></span>"}
      <a href="./">Tất cả các tháng</a>
      ${inRange(next.m, next.y) ? `<a href="${slug(next.m, next.y)}">Tháng ${next.m}/${next.y} →</a>` : "<span></span>"}
    </nav>
    <aside class="blog-related">
      <h2>Đọc tiếp</h2>
      <ul>
        ${related.join("\n        ")}
      </ul>
    </aside>
  </article>
</main>
` + foot();
  }

  function indexPage(all) {
    const years = [...new Set(all.map((md) => md.y))];
    const cards = (yy) => all.filter((md) => md.y === yy).map((md) => {
      const f = md.days.find((x) => x.lunar.day === 1);
      const r = md.days.find((x) => x.lunar.day === 15);
      const hd = md.days.filter((x) => x.guide.good).length;
      const ev = md.days.filter((x) => x.events.length).map((x) => x.events[0])[0];
      const marks = [f && { d: f.d, t: "Mùng 1: " }, r && { d: r.d, t: "Rằm: " }].filter(Boolean).sort((p, q) => p.d - q.d);
      return `<a class="lm-card" href="${slug(md.m, md.y)}"><b>Tháng ${md.m}/${md.y}</b><span>${marks.map((x) => x.t + ddmm(x.d, md.m)).join(" · ")}</span><small>${hd} ngày hoàng đạo${ev ? " · " + esc(ev) : ""}</small></a>`;
    }).join("\n        ");
    const desc = "Lịch âm từng tháng " + years.join(", ") + ": ngày mùng 1, rằm, ngày lễ, ngày tốt cưới hỏi, khai trương và giờ hoàng đạo mỗi ngày theo lịch vạn niên Việt Nam.";
    const jsonld = [
      { "@context": "https://schema.org", "@type": "CollectionPage", name: "Lịch âm các tháng " + years.join(" – "), description: desc, url: ORIGIN + "/lich-am/", inLanguage: "vi",
        hasPart: all.map((md) => ({ "@type": "WebPage", name: "Lịch âm tháng " + md.m + "/" + md.y, url: ORIGIN + "/lich-am/" + slug(md.m, md.y) })) },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: ORIGIN + "/" },
        { "@type": "ListItem", position: 2, name: "Lịch âm các tháng", item: ORIGIN + "/lich-am/" } ] }
    ];
    return head({ title: "Lịch âm các tháng " + years.join(", ") + ": mùng 1, rằm, ngày tốt | OneTool", desc, path: "lich-am/", ogTitle: "Lịch âm từng tháng " + years.join(" – "), jsonld }) + `
<body class="blog-page" data-tool="lunar-months">
<div id="site-header"></div>
<main role="main">
  <article class="blog-article lm-page">
    <header class="blog-article-head">
      <div class="blog-card-meta"><span>Lịch âm</span><a href="../cong-cu-tien-ich/lunar-calendar.html">Lịch âm hôm nay →</a></div>
      <h1>Lịch âm từng tháng ${years.join(" – ")}</h1>
      <p class="lede">Chọn một tháng để xem lịch âm dương, ngày mùng 1, rằm, ngày lễ, ngày tốt cho cưới hỏi, khai trương, động thổ và giờ hoàng đạo của từng ngày.</p>
    </header>
    <div class="blog-prose">
      ${years.map((yy) => `<h2>Lịch âm năm ${yy}</h2>
      <div class="lm-cards">
        ${cards(yy)}
      </div>`).join("\n      ")}

      <h2>Cách đọc lịch âm từng tháng</h2>
      <ul>
        <li><strong>Lưới lịch</strong> có ngày dương lớn và ngày âm nhỏ; ngày hoàng đạo có chấm xanh, ngày lễ tô đỏ.</li>
        <li><strong>Ngày tốt theo việc</strong> lọc theo ba tiêu chí: ngày hoàng đạo, trực hợp việc, tránh Tam nương và Nguyệt kỵ.</li>
        <li><strong>Chi tiết từng ngày</strong> gồm Can Chi, sao, trực và 6 giờ hoàng đạo.</li>
      </ul>
      <p>Tất cả được tính theo múi giờ Việt Nam (UTC+7) bằng thuật toán âm lịch của Hồ Ngọc Đức, giống lịch treo tường trong nước. Muốn lọc ngày hợp tuổi, hãy dùng <a href="../cong-cu-tien-ich/lunar-calendar.html">lịch âm hôm nay</a>.</p>
    </div>
    <aside class="blog-related">
      <h2>Đọc tiếp</h2>
      <ul>
        <li><a href="../blog/lich-am-2026.html">Lịch âm 2026: mùng 1, rằm và ngày lễ cả năm</a></li>
        <li><a href="../blog/xem-ngay-tot-cuoi-nam-2026.html">Xem ngày tốt cuối năm 2026</a></li>
        <li><a href="../blog/van-khan-mung-1-ngay-ram.html">Văn khấn mùng 1 và ngày rằm</a></li>
      </ul>
    </aside>
  </article>
</main>
` + foot();
  }

  const all = [];
  for (let t = { ...FROM }; inRange(t.m, t.y); t = shift(t.m, t.y, 1)) all.push(monthData(t.m, t.y));
  const out = {};
  all.forEach((md) => { out["lich-am/" + slug(md.m, md.y)] = monthPage(md); });
  out["lich-am/index.html"] = indexPage(all);
  window.__out = out;
  document.getElementById("log").textContent = Object.keys(out).length + " trang:\n" + Object.keys(out).join("\n");
})();
