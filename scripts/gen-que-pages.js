(function () {
  "use strict";
  const PUBLISHED = "2026-10-02";
  const V = { catalog: "20261002k", layout: "20261002h", core: "20261002a", site: "20261002c", blog: "20261002b", gq: "20261002c" };
  const ORIGIN = "https://onetool.vn";
  const DATA = window.OTQueData || [];

  const RANKS = [
    { name: "Đại cát", sub: "Thượng thượng", note: "rất tốt, thời vận hanh thông, hợp khởi sự việc lớn" },
    { name: "Thượng cát", sub: "Rất tốt", note: "tốt, mọi việc thuận lợi, có quý nhân giúp đỡ" },
    { name: "Trung cát", sub: "Tốt", note: "khá tốt, tiến triển đều, kiên trì sẽ thành" },
    { name: "Bình hòa", sub: "Cát dần", note: "chưa phải lúc bứt phá, nên chậm lại và chuẩn bị; khó khăn chỉ là tạm thời" }
  ];
  const ASPECTS = [
    { id: "cong", name: "Công việc", icon: "💼" },
    { id: "tai", name: "Tài lộc", icon: "💰" },
    { id: "tinh", name: "Tình duyên", icon: "💞" },
    { id: "gia", name: "Gia đạo", icon: "🏡" },
    { id: "suc", name: "Sức khỏe", icon: "🌿" },
    { id: "hoc", name: "Thi cử", icon: "📚" },
    { id: "di", name: "Xuất hành", icon: "🧭" }
  ];
  const ELEMENTS = [
    { name: "Kim", color: "Trắng, bạc, ánh kim", dir: "Tây, Tây Bắc", sw: ["#f1f5f9", "#cbd5e1"] },
    { name: "Thủy", color: "Xanh dương, đen", dir: "Bắc", sw: ["#2563eb", "#0f172a"] },
    { name: "Mộc", color: "Xanh lá", dir: "Đông, Đông Nam", sw: ["#16a34a", "#86efac"] },
    { name: "Hỏa", color: "Đỏ, hồng, tím", dir: "Nam", sw: ["#dc2626", "#db2777"] },
    { name: "Thổ", color: "Vàng, nâu đất", dir: "Đông Bắc, Tây Nam", sw: ["#eab308", "#92400e"] }
  ];

  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const slug = (n) => "que-so-" + n + ".html";
  const url = (path) => ORIGIN + "/gieo-que/" + path;
  const clip = (s, max) => (s.length > max ? s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…" : s);

  function luckyNumbers(n) {
    const a = ((n * 7) % 9) + 1;
    let b = ((n * 4 + 3) % 9) + 1;
    if (b === a) b = (b % 9) + 1;
    return [a, b, 10 + ((n * 37 + 11) % 90)];
  }

  function head({ title, desc, path, ogTitle, ogDesc, type, jsonld }) {
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
  <link rel="canonical" href="${url(path)}" />
  <meta name="robots" content="index,follow" />
  <meta property="og:title" content="${esc(ogTitle)}" />
  <meta property="og:description" content="${esc(ogDesc || desc)}" />
  <meta property="og:url" content="${url(path)}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:site_name" content="OneTool" />
  <meta property="og:locale" content="vi_VN" />
  <meta property="og:image" content="${ORIGIN}/assets/img/og-gieo-que.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="stylesheet" href="../assets/css/site.css?v=20260911a" />
  <link rel="stylesheet" href="../assets/css/blog.css?v=${V.blog}" />
  <link rel="stylesheet" href="../assets/css/shell-critical.css?v=20260826p" />
  <link rel="stylesheet" href="../assets/css/ot-shell.css?v=20260903a" />
  <link rel="stylesheet" href="../assets/css/components.css?v=20260826r" />
  <link rel="stylesheet" href="../assets/css/tools/gieo-que.css?v=${V.gq}" />
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

  const crumbs = (extra) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: ORIGIN + "/" },
      { "@type": "ListItem", position: 2, name: "Gieo quẻ online", item: ORIGIN + "/cong-cu-tien-ich/gieo-que.html" },
      { "@type": "ListItem", position: 3, name: "36 quẻ", item: url("") },
      ...(extra ? [{ "@type": "ListItem", position: 4, name: extra.name, item: extra.item }] : [])
    ]
  });

  const related = `<aside class="blog-related">
      <h2>Đọc tiếp</h2>
      <ul>
        <li><a href="../cong-cu-tien-ich/gieo-que.html">Gieo quẻ online — lắc điện thoại xin quẻ</a></li>
        <li><a href="../cong-cu-tien-ich/tung-dong-xu.html">Tung đồng xu online — gieo 3 xu cổ, xin âm dương</a></li>
        <li><a href="../cong-cu-tien-ich/lunar-calendar.html">Lịch âm hôm nay — ngày hoàng đạo, giờ tốt</a></li>
        <li><a href="../blog/van-khan-mung-1-ngay-ram.html">Văn khấn mùng 1 và ngày rằm</a></li>
      </ul>
    </aside>`;

  function quePage(q) {
    const rank = RANKS[q.r];
    const el = ELEMENTS[q.n % 5];
    const nums = luckyNumbers(q.n);
    const path = slug(q.n);
    const prev = DATA[(q.n + DATA.length - 2) % DATA.length];
    const next = DATA[q.n % DATA.length];
    const desc = clip(`Quẻ số ${q.n} «${q.name}» (${rank.name}): ${q.y}`, 158);
    const jsonld = [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: `Quẻ số ${q.n}: ${q.name} — ${rank.name}`,
        description: desc,
        image: ORIGIN + "/assets/img/og-gieo-que.png",
        datePublished: PUBLISHED,
        dateModified: PUBLISHED,
        author: { "@type": "Organization", name: "OneTool" },
        publisher: { "@type": "Organization", name: "OneTool", logo: { "@type": "ImageObject", url: ORIGIN + "/assets/img/logo-mark.png" } },
        mainEntityOfPage: url(path),
        inLanguage: "vi"
      },
      crumbs({ name: "Quẻ số " + q.n, item: url(path) })
    ];
    const fb = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url(path));
    return head({
      title: `Quẻ số ${q.n}: ${q.name} (${rank.name}) — giải quẻ | OneTool`,
      desc,
      path,
      ogTitle: `🎋 Quẻ số ${q.n} «${q.name}» — ${rank.name}`,
      ogDesc: q.poem.join(" / ") + " — Gieo quẻ của bạn tại OneTool.",
      type: "article",
      jsonld
    }) + `
<body class="blog-page" data-tool="que-page">
<div id="site-header"></div>
<main role="main">
  <article class="blog-article qp-page">
    <header class="blog-article-head">
      <div class="blog-card-meta"><a href="./">36 quẻ OneTool</a><span>Quẻ số ${q.n}/36</span></div>
      <h1>Quẻ số ${q.n}: ${esc(q.name)}</h1>
      <p class="lede">Quẻ <strong>${rank.name}</strong> — ${rank.note}. Dưới đây là thơ quẻ, lời giải và lời quẻ cho từng việc.</p>
    </header>
    <div class="gq-result qp-result">
      <section class="gq-main is-r${q.r}">
        <div class="gq-main-top">
          <span class="gq-no">Quẻ số <b>${q.n}</b><small>/36</small></span>
          <span class="gq-rank">${rank.name}<small>${rank.sub}</small></span>
        </div>
        <p class="gq-name">${esc(q.name)}</p>
        <div class="gq-poem">${q.poem.map((l) => `<p>${esc(l)}</p>`).join("")}</div>
      </section>

      <section class="gq-card gq-lead">
        <h2>Giải quẻ</h2>
        <p class="gq-lead-text">${esc(q.y)}</p>
      </section>

      <section class="gq-aspects" aria-label="Lời quẻ theo từng việc">
        ${ASPECTS.map((a) => `<div class="gq-aspect"><h3><span aria-hidden="true">${a.icon}</span> ${a.name}</h3><p>${esc(q[a.id])}</p></div>`).join("\n        ")}
      </section>

      <section class="gq-card gq-advice">
        <h2>Lời khuyên</h2>
        <p>${esc(q.k)}</p>
      </section>

      <section class="gq-lucky" aria-label="Điều may mắn">
        <div class="gq-lucky-item"><span>Số may mắn</span><strong>${nums.join(" · ")}</strong></div>
        <div class="gq-lucky-item"><span>Màu hợp (hành ${el.name})</span><strong><i class="gq-sw" style="background:linear-gradient(135deg,${el.sw[0]},${el.sw[1]})"></i>${el.color}</strong></div>
        <div class="gq-lucky-item"><span>Hướng tốt</span><strong>${el.dir}</strong></div>
      </section>

      <div class="qp-cta">
        <p>Mỗi người một duyên quẻ. Thành tâm nghĩ về điều muốn hỏi rồi lắc ống quẻ của riêng bạn.</p>
        <div class="gq-actions">
          <a class="btn btn-primary" href="../cong-cu-tien-ich/gieo-que.html">🎋 Gieo quẻ của bạn</a>
          <a class="btn btn-outline" href="${fb}" target="_blank" rel="noopener">Chia sẻ Facebook</a>
        </div>
      </div>
      <p class="gq-note">Thơ quẻ và lời giải do OneTool tự soạn, mang tính chiêm nghiệm và giải trí. Mọi quyết định quan trọng hãy cân nhắc dựa trên thực tế.</p>
    </div>
    <nav class="lm-nav" aria-label="Chuyển quẻ">
      <a href="${slug(prev.n)}">← Quẻ số ${prev.n}</a>
      <a href="./">Tất cả 36 quẻ</a>
      <a href="${slug(next.n)}">Quẻ số ${next.n} →</a>
    </nav>
    ${related}
  </article>
</main>
` + foot();
  }

  function indexPage() {
    const desc = "Ý nghĩa 36 quẻ xin online của OneTool: thơ quẻ, lời giải công việc, tài lộc, tình duyên, sức khỏe cho từng quẻ Đại cát, Thượng cát, Trung cát, Bình hòa.";
    const jsonld = [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "36 quẻ OneTool — ý nghĩa từng quẻ",
        description: desc,
        url: url(""),
        inLanguage: "vi",
        hasPart: DATA.map((q) => ({ "@type": "WebPage", name: "Quẻ số " + q.n + ": " + q.name, url: url(slug(q.n)) }))
      },
      crumbs(null)
    ];
    const group = (r) => DATA.filter((q) => q.r === r);
    return head({
      title: "Ý nghĩa 36 quẻ: thơ quẻ và lời giải từng quẻ | OneTool",
      desc,
      path: "",
      ogTitle: "🎋 Ý nghĩa 36 quẻ — thơ quẻ và lời giải",
      type: "website",
      jsonld
    }) + `
<body class="blog-page" data-tool="que-index">
<div id="site-header"></div>
<main role="main">
  <article class="blog-article qp-page">
    <header class="blog-article-head">
      <div class="blog-card-meta"><span>Gieo quẻ</span><a href="../cong-cu-tien-ich/gieo-que.html">Gieo quẻ online →</a></div>
      <h1>Ý nghĩa 36 quẻ</h1>
      <p class="lede">Bộ 36 quẻ của OneTool chia làm 4 bậc. Chọn một quẻ để đọc thơ quẻ, lời giải và lời quẻ cho công việc, tài lộc, tình duyên, gia đạo, sức khỏe, thi cử và xuất hành.</p>
    </header>
    <div class="qp-cta qp-cta--top">
      <a class="btn btn-primary" href="../cong-cu-tien-ich/gieo-que.html">🎋 Gieo quẻ của bạn</a>
    </div>
    <div class="blog-prose">
      ${RANKS.map((rk, r) => `<h2>${rk.name} (${group(r).length} quẻ)</h2>
      <p>Quẻ ${rk.name}: ${rk.note}.</p>
      <div class="lm-cards">
        ${group(r).map((q) => `<a class="lm-card" href="${slug(q.n)}"><b>Quẻ ${q.n} · ${esc(q.name)}</b><span>${esc(q.poem[0])}</span><small>${rk.name}</small></a>`).join("\n        ")}
      </div>`).join("\n      ")}

      <h2>Cách đọc một quẻ</h2>
      <ul>
        <li><strong>Thơ quẻ</strong> gồm bốn câu lục bát, gợi hình ảnh của thời vận.</li>
        <li><strong>Giải quẻ</strong> nói ý chính của quẻ; lời quẻ theo từng việc giúp bạn soi vào điều đang hỏi.</li>
        <li><strong>Lời khuyên</strong> là điều nên giữ trong lòng khi làm việc ấy.</li>
      </ul>
      <p>Thơ quẻ và lời giải do OneTool tự soạn, lấy cảm hứng từ hình ảnh quen thuộc trong đời sống người Việt. Quẻ mang tính chiêm nghiệm và giải trí, giúp thêm niềm tin và động lực.</p>
    </div>
    ${related}
  </article>
</main>
` + foot();
  }

  const out = {};
  DATA.forEach((q) => { out["gieo-que/" + slug(q.n)] = quePage(q); });
  out["gieo-que/index.html"] = indexPage();
  window.__out = out;
  document.getElementById("log").textContent = Object.keys(out).length + " trang:\n" + Object.keys(out).join("\n");
})();
