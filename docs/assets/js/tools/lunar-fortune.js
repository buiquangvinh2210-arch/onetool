/**
 * Xem ngày theo phong tục: 12 Trực, ngày tốt theo việc, nạp âm & vận may theo tuổi, quẻ đầu ngày, văn khấn.
 * Dựa trên OTLunar. Nội dung mang tính tham khảo / giải trí.
 */
window.OTFortune = (function () {
  "use strict";

  const L = window.OTLunar;
  if (!L) return null;

  const CHI = L.CHI;

  const TRUC = [
    { name: "Kiến", good: ["Xuất hành", "Cưới hỏi", "Thăm hỏi", "Nhậm chức"], bad: ["Động thổ", "Đào giếng", "An táng"] },
    { name: "Trừ", good: ["Chữa bệnh", "Cúng giải hạn", "Dọn dẹp nhà cửa"], bad: ["Cưới hỏi", "Đi xa", "Khai trương"] },
    { name: "Mãn", good: ["Khai trương", "Cầu tài", "Xuất hành", "Mua sắm"], bad: ["Kiện tụng", "Nhậm chức", "Uống thuốc"] },
    { name: "Bình", good: ["Sửa nhà", "Động thổ", "Về nhà mới", "Nhập kho"], bad: ["Kiện tụng", "Tranh chấp"] },
    { name: "Định", good: ["Cưới hỏi", "Ký hợp đồng", "Về nhà mới", "Mua bán"], bad: ["Kiện tụng", "Đi xa", "Chữa bệnh"] },
    { name: "Chấp", good: ["Ký hợp đồng", "Động thổ", "Xây dựng", "Tuyển người"], bad: ["Dời nhà", "Xuất hành", "Mở kho"] },
    { name: "Phá", good: ["Phá dỡ nhà cũ", "Chữa bệnh"], bad: ["Cưới hỏi", "Khai trương", "Xuất hành", "Ký hợp đồng"] },
    { name: "Nguy", good: ["Cúng lễ", "Tế tự"], bad: ["Leo cao", "Đi thuyền", "Khai trương", "Việc mạo hiểm"] },
    { name: "Thành", good: ["Khai trương", "Cưới hỏi", "Nhập học", "Động thổ", "Xuất hành"], bad: ["Kiện tụng"] },
    { name: "Thu", good: ["Thu nợ", "Mua bán", "Nhập kho", "Thu hoạch"], bad: ["Khai trương", "An táng", "Xuất hành"] },
    { name: "Khai", good: ["Khai trương", "Động thổ", "Cưới hỏi", "Nhậm chức", "Xuất hành"], bad: ["An táng", "Chôn cất"] },
    { name: "Bế", good: ["Đắp đê", "Lấp hố", "Xây tường"], bad: ["Khai trương", "Cưới hỏi", "Xuất hành", "Chữa bệnh"] }
  ];

  const TAM_NUONG = [3, 7, 13, 18, 22, 27];
  const NGUYET_KY = [5, 14, 23];

  const ACTIVITIES = [
    { id: "cuoi-hoi", name: "Cưới hỏi", icon: "💍", truc: [4, 8, 10] },
    { id: "khai-truong", name: "Khai trương", icon: "🎊", truc: [2, 4, 8, 10] },
    { id: "dong-tho", name: "Động thổ", icon: "🏗️", truc: [3, 5, 8, 10] },
    { id: "nhap-trach", name: "Về nhà mới", icon: "🏠", truc: [3, 4, 8, 10] },
    { id: "xuat-hanh", name: "Xuất hành", icon: "🧳", truc: [0, 2, 8, 10] },
    { id: "mua-xe", name: "Mua xe", icon: "🚗", truc: [2, 4, 8, 9, 10] },
    { id: "hop-dong", name: "Ký hợp đồng", icon: "✍️", truc: [4, 5, 8, 10] }
  ];

  // Trực tính theo tháng tiết khí: Lập xuân bắt đầu tháng Dần, mỗi tháng 2 tiết.
  function trucIndex(jd) {
    const monthChi = (Math.floor(((L.solarTermIndex(jd) + 3) % 24) / 2) + 2) % 12;
    return ((jd + 1) % 12 - monthChi + 12) % 12;
  }

  function badLunarDay(lunarDay) {
    if (TAM_NUONG.includes(lunarDay)) return "Tam nương";
    if (NGUYET_KY.includes(lunarDay)) return "Nguyệt kỵ";
    return "";
  }

  function dayAdvice(jd, lunar) {
    const t = TRUC[trucIndex(jd)];
    return { truc: t.name, good: t.good, bad: t.bad, warn: badLunarDay(lunar.day) };
  }

  function fitsActivity(jd, lunar, actId, birthChi) {
    const act = ACTIVITIES.find((a) => a.id === actId);
    if (!act) return null;
    const g = L.dayGuide(jd, lunar.month);
    const t = trucIndex(jd);
    if (!g.good || !act.truc.includes(t) || badLunarDay(lunar.day)) return null;
    if (birthChi != null && ((jd + 1) % 12 + 6) % 12 === birthChi) return null;
    return { truc: TRUC[t].name, god: g.god };
  }

  /* ── Nạp âm & ngũ hành ── */
  const NAP_AM = [
    "Hải Trung Kim", "Lư Trung Hỏa", "Đại Lâm Mộc", "Lộ Bàng Thổ", "Kiếm Phong Kim",
    "Sơn Đầu Hỏa", "Giản Hạ Thủy", "Thành Đầu Thổ", "Bạch Lạp Kim", "Dương Liễu Mộc",
    "Tuyền Trung Thủy", "Ốc Thượng Thổ", "Tích Lịch Hỏa", "Tùng Bách Mộc", "Trường Lưu Thủy",
    "Sa Trung Kim", "Sơn Hạ Hỏa", "Bình Địa Mộc", "Bích Thượng Thổ", "Kim Bạch Kim",
    "Phú Đăng Hỏa", "Thiên Hà Thủy", "Đại Trạch Thổ", "Thoa Xuyến Kim", "Tang Đố Mộc",
    "Đại Khê Thủy", "Sa Trung Thổ", "Thiên Thượng Hỏa", "Thạch Lựu Mộc", "Đại Hải Thủy"
  ];
  const SINH = { Kim: "Thủy", Thủy: "Mộc", Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim" };
  const KHAC = { Kim: "Mộc", Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim" };
  const COLORS = {
    Kim: [["Trắng", "#f8fafc"], ["Bạc", "#cbd5e1"], ["Vàng", "#facc15"], ["Nâu đất", "#a16207"]],
    Mộc: [["Xanh lá", "#22c55e"], ["Xanh rêu", "#4d7c0f"], ["Xanh dương", "#3b82f6"], ["Đen", "#111827"]],
    Thủy: [["Đen", "#111827"], ["Xanh dương", "#2563eb"], ["Trắng", "#f8fafc"], ["Bạc", "#cbd5e1"]],
    Hỏa: [["Đỏ", "#dc2626"], ["Hồng", "#ec4899"], ["Tím", "#9333ea"], ["Xanh lá", "#22c55e"]],
    Thổ: [["Vàng", "#eab308"], ["Nâu", "#92400e"], ["Đỏ", "#dc2626"], ["Hồng", "#f472b6"]]
  };
  const NUMBERS = { Thủy: [1, 6], Hỏa: [2, 7], Mộc: [3, 8], Kim: [4, 9], Thổ: [0, 5] };

  const elementOf = (napAm) => napAm.split(" ").pop();

  function napAmOfYear(year) {
    const name = NAP_AM[Math.floor((((year - 4) % 60) + 60) % 60 / 2)];
    return { name, element: elementOf(name) };
  }

  function napAmOfDay(jd) {
    const name = NAP_AM[Math.floor(((jd + 49) % 60) / 2)];
    return { name, element: elementOf(name) };
  }

  const STAR_LABEL = ["", "Không thuận", "Nên cẩn trọng", "Bình thường", "Tốt", "Rất tốt"];
  const STAR_ADVICE = [
    "",
    "Ngày nên nghỉ ngơi, tránh tranh cãi và ký kết quan trọng.",
    "Nên giữ nhịp chậm, cân nhắc kỹ trước quyết định lớn.",
    "Ngày bình ổn — làm tốt việc thường ngày là đẹp.",
    "Ngày thuận lợi, hợp gặp gỡ, bàn chuyện làm ăn.",
    "Ngày đại cát — mạnh dạn triển khai việc quan trọng."
  ];

  function tuoiDay(birthYear, jd, lunarMonth) {
    const chi = (birthYear + 8) % 12;
    const me = napAmOfYear(birthYear);
    const day = napAmOfDay(jd);
    const dayChi = (jd + 1) % 12;
    const g = L.dayGuide(jd, lunarMonth);
    const reasons = [];
    let score = 3;

    if (SINH[day.element] === me.element) {
      score += 1;
      reasons.push({ ok: true, text: `Ngày hành ${day.element} sinh mệnh ${me.element} của bạn` });
    } else if (day.element === me.element) {
      score += 0.5;
      reasons.push({ ok: true, text: `Ngày cùng hành ${day.element} với mệnh bạn` });
    } else if (KHAC[day.element] === me.element) {
      score -= 1;
      reasons.push({ ok: false, text: `Ngày hành ${day.element} khắc mệnh ${me.element}` });
    } else if (SINH[me.element] === day.element) {
      score -= 0.25;
      reasons.push({ ok: null, text: `Mệnh ${me.element} sinh cho ngày hành ${day.element} — dễ hao sức` });
    } else {
      score += 0.25;
      reasons.push({ ok: true, text: `Mệnh ${me.element} khắc ngày hành ${day.element} — bạn làm chủ tình thế` });
    }

    if ((chi + dayChi) % 12 === 1) {
      score += 1;
      reasons.push({ ok: true, text: `Ngày ${CHI[dayChi]} lục hợp với tuổi ${CHI[chi]}` });
    } else if (chi !== dayChi && chi % 4 === dayChi % 4) {
      score += 1;
      reasons.push({ ok: true, text: `Ngày ${CHI[dayChi]} tam hợp với tuổi ${CHI[chi]}` });
    } else if ((chi + 6) % 12 === dayChi) {
      score -= 1.5;
      reasons.push({ ok: false, text: `Ngày ${CHI[dayChi]} xung với tuổi ${CHI[chi]}` });
    } else if ((chi + dayChi) % 12 === 7) {
      score -= 0.75;
      reasons.push({ ok: false, text: `Ngày ${CHI[dayChi]} tương hại với tuổi ${CHI[chi]}` });
    }

    if (g.good) {
      score += 0.5;
      reasons.push({ ok: true, text: `Ngày hoàng đạo (${g.god})` });
    } else {
      score -= 0.25;
      reasons.push({ ok: null, text: `Ngày hắc đạo (${g.god})` });
    }

    const stars = Math.max(1, Math.min(5, Math.round(score)));
    const hours = L.luckyHours(jd).filter((h) => (chi + 6) % 12 !== CHI.indexOf(h.name));
    const lucky = ((jd * 37 + birthYear * 11) % 89) + 10;
    return {
      chi,
      chiName: CHI[chi],
      canChi: L.yearCanChi(birthYear),
      napAm: me,
      dayNapAm: day,
      stars,
      label: STAR_LABEL[stars],
      advice: STAR_ADVICE[stars],
      reasons,
      colors: COLORS[me.element],
      numbers: NUMBERS[me.element].concat(lucky),
      hours,
      hyThan: g.hyThan
    };
  }

  /* ── Quẻ đầu ngày ── */
  const QUE = [
    { level: "Đại cát", title: "Rồng gặp mây", verse: ["Mây lành theo gió về đâu", "Rồng xanh vượt sóng, bắt đầu vận hanh"], work: "Ý tưởng được ủng hộ, nên chủ động đề xuất.", money: "Có lộc bất ngờ, đừng vội tiêu ngay.", love: "Người ấy đang để ý bạn.", health: "Tinh thần sung mãn." },
    { level: "Đại cát", title: "Hoa nở đầu xuân", verse: ["Cành mai chớm nụ đón xuân", "Việc xưa vướng mắc, nay dần thông suốt"], work: "Việc tồn đọng được gỡ, tiến độ nhanh.", money: "Thu nhập ổn định, có thể đầu tư nhỏ.", love: "Hợp hẹn hò, nói lời thật lòng.", health: "Ăn ngủ điều độ là đủ khỏe." },
    { level: "Đại cát", title: "Thuyền xuôi gió thuận", verse: ["Thuyền xuôi gió thuận buồm căng", "Đường xa mấy dặm cũng thành gần thôi"], work: "Hợp ký kết, đi công tác.", money: "Buôn bán có lời.", love: "Gắn kết, dễ cảm thông.", health: "Đi lại nhiều nhưng vẫn khỏe." },
    { level: "Thượng cát", title: "Trăng rằm soi lối", verse: ["Trăng rằm vằng vặc trên cao", "Lòng ngay dạ thẳng, quý nhân đến gần"], work: "Có người giúp đỡ đúng lúc.", money: "Tài chính sáng sủa.", love: "Gặp người hợp ý qua bạn bè.", health: "Nên dạo bộ buổi tối." },
    { level: "Thượng cát", title: "Giếng trong nước ngọt", verse: ["Giếng trong nước ngọt quanh năm", "Chăm lo từ gốc, lộc tăng tự nhiên"], work: "Làm kỹ phần nền, kết quả bền.", money: "Tiết kiệm sinh lời.", love: "Quan tâm việc nhỏ được ghi nhận.", health: "Uống đủ nước, giữ ấm." },
    { level: "Thượng cát", title: "Chim én báo tin", verse: ["Én bay rộn rã ngoài thềm", "Tin vui đâu đó gõ thêm cửa nhà"], work: "Sắp có tin tốt về công việc.", money: "Khoản chờ đợi sắp về.", love: "Người xa nhắn tin hỏi han.", health: "Vui vẻ, ít ốm vặt." },
    { level: "Thượng cát", title: "Lúa chín vàng đồng", verse: ["Đồng xa lúa đã chín vàng", "Công lao bấy lâu, nay sang mùa gặt"], work: "Thành quả được công nhận.", money: "Có thưởng hoặc lộc từ công sức.", love: "Hợp ra mắt, bàn chuyện tương lai.", health: "Đừng làm quá sức." },
    { level: "Thượng cát", title: "Bếp hồng sum vầy", verse: ["Bếp hồng lửa ấm quây quần", "Nhà vui, người khỏe, phúc phần đầy sân"], work: "Đồng đội ăn ý, việc chung trôi chảy.", money: "Có lộc từ người thân.", love: "Hợp gặp gỡ gia đình hai bên.", health: "Ăn uống ngon miệng." },
    { level: "Trung cát", title: "Mưa nhỏ thấm đất", verse: ["Mưa phùn nhè nhẹ thấm sâu", "Từ từ mà chắc, chẳng cầu vội chi"], work: "Tiến chậm mà chắc, đừng nóng vội.", money: "Thu chi cân bằng.", love: "Kiên nhẫn sẽ được đáp lại.", health: "Ngủ sớm hơn một chút." },
    { level: "Trung cát", title: "Cầu tre qua suối", verse: ["Cầu tre lắt lẻo qua khe", "Bước đều chân vững, chẳng e ngại gì"], work: "Có trở ngại nhỏ nhưng vượt được.", money: "Cân nhắc trước khi chi lớn.", love: "Nói rõ để tránh hiểu lầm.", health: "Cẩn thận khi đi lại." },
    { level: "Trung cát", title: "Đèn khuya sách mở", verse: ["Đèn khuya một ngọn sách đầy", "Học thêm một chữ, mai này thêm khôn"], work: "Hợp học hỏi, nâng kỹ năng.", money: "Đầu tư cho bản thân là có lời.", love: "Tìm điểm chung qua sở thích.", health: "Nghỉ mắt sau mỗi giờ làm." },
    { level: "Trung cát", title: "Gió mát hiên nhà", verse: ["Hiên nhà gió mát trưa hè", "Việc nhà êm ấm, bạn bè ghé chơi"], work: "Ngày yên ả, xử lý việc thường.", money: "Không lo thiếu hụt.", love: "Gia đình hòa thuận.", health: "Thư giãn đúng lúc." },
    { level: "Tiểu cát", title: "Mầm non đội đất", verse: ["Mầm non đội đất vươn lên", "Bắt đầu tuy nhỏ, vững bền về sau"], work: "Hợp khởi đầu việc nhỏ.", money: "Lộc ít nhưng đều.", love: "Tình cảm mới nhen nhóm.", health: "Tập thể dục nhẹ nhàng." },
    { level: "Tiểu cát", title: "Sông chia hai nhánh", verse: ["Sông dài chia nhánh đôi đường", "Chọn đi một hướng, đừng vương cả hai"], work: "Tập trung một việc chính.", money: "Tránh đầu tư dàn trải.", love: "Dứt khoát với cảm xúc của mình.", health: "Bớt cà phê, ngủ đủ giấc." },
    { level: "Tiểu cát", title: "Mây che trăng tạm", verse: ["Mây trôi che khuất vầng trăng", "Đợi qua chốc lát, sáng bằng ngày xưa"], work: "Chưa phải lúc, cứ chuẩn bị kỹ.", money: "Giữ tiền mặt, chưa vội chi.", love: "Đừng vội kết luận.", health: "Giữ tinh thần lạc quan." },
    { level: "Bình", title: "Nước lặng hồ thu", verse: ["Hồ thu nước lặng như gương", "Giữ lòng thanh thản, trăm đường an vui"], work: "Không tốt không xấu, làm đúng phần mình.", money: "Thu chi bình thường.", love: "Bình yên là hạnh phúc.", health: "Sức khỏe ổn định." },
    { level: "Bình", title: "Đường quen lối cũ", verse: ["Đường quen lối cũ đi về", "Cẩn thận từng bước, chớ hề chủ quan"], work: "Làm theo quy trình, tránh sai sót vặt.", money: "Kiểm tra lại hóa đơn, giấy tờ.", love: "Đừng so sánh với người khác.", health: "Chú ý ăn uống." },
    { level: "Bình", title: "Cây đứng giữa đồi", verse: ["Một cây lặng đứng giữa đồi", "Gió lay chẳng đổ, nắng phơi chẳng sờn"], work: "Giữ lập trường trước áp lực.", money: "Không nên cho vay hôm nay.", love: "Tự tin vào bản thân.", health: "Đứng dậy vận động, giãn cơ." },
    { level: "Hạ", title: "Thuyền gặp gió ngược", verse: ["Thuyền con gặp gió ngược chiều", "Neo vào bến đợi, chớ liều ra khơi"], work: "Hoãn quyết định lớn sang hôm khác.", money: "Tránh mua sắm theo cảm hứng.", love: "Nhường nhịn để tránh cãi vã.", health: "Nghỉ ngơi nhiều hơn." },
    { level: "Hạ", title: "Sương mù sớm mai", verse: ["Sương mù giăng kín lối đi", "Chậm chân một chút, đến khi nắng lên"], work: "Thông tin chưa rõ, hỏi kỹ trước khi làm.", money: "Cảnh giác lời mời đầu tư.", love: "Đừng nghe lời đồn.", health: "Giữ ấm cổ họng." }
  ];

  /* ── Văn khấn ── */
  const OPEN = "Nam mô A Di Đà Phật! (3 lần)";
  const CLOSE = "Lễ mọn lòng thành, con xin kính cẩn dâng lên, cúi mong chư vị chứng giám.\nNam mô A Di Đà Phật! (3 lần)";
  const THAN_LINH =
    "Con kính lạy Hoàng thiên Hậu thổ, chư vị Tôn thần.\n" +
    "Con kính lạy Thành hoàng, Thổ địa, Táo quân và các vị Thần linh coi sóc nơi gia đình con sinh sống.";
  const TO_TIEN = (family) => `Con kính lạy Tổ tiên, ông bà và các bậc tiền nhân nội ngoại họ ${family}.`;
  const WHO = (v) => `Con tên là: ${v.name}\nHiện ở tại: ${v.address}`;

  const VAN_KHAN = [
    {
      id: "mung1",
      name: "Mùng 1",
      icon: "🌑",
      offerings: "Hương, hoa tươi, trà, quả, nước sạch; có thể thêm xôi, chè hoặc mâm cơm chay.",
      body: (v) =>
        `${OPEN}\n${THAN_LINH}\n${TO_TIEN(v.family)}\n\n${WHO(v)}\n\n` +
        `Hôm nay là ${v.date}, ngày đầu tháng.\n\n` +
        "Nhân dịp đầu tháng mới, gia đình con chuẩn bị nén hương cùng chút lễ vật, thành kính mời các vị Thần linh và Tổ tiên về chứng giám tấm lòng của con cháu.\n\n" +
        "Con xin cầu cho cả nhà một tháng mới khỏe mạnh, yên ổn; công việc thuận lợi, người đi xa được bình an, trong nhà luôn vui vẻ, hòa thuận.\n\n" +
        CLOSE
    },
    {
      id: "ram",
      name: "Ngày Rằm",
      icon: "🌕",
      offerings: "Hương, hoa, trà, ngũ quả, nến; nhiều gia đình làm mâm cơm chay hoặc mặn dâng gia tiên.",
      body: (v) =>
        `${OPEN}\n${THAN_LINH}\n${TO_TIEN(v.family)}\n\n${WHO(v)}\n\n` +
        `Hôm nay là ${v.date}, ngày trăng tròn.\n\n` +
        "Đêm rằm trăng sáng, gia đình con thắp hương dâng lễ, nhớ ơn các vị Thần linh đã che chở và ông bà Tổ tiên đã vun đắp cho con cháu hôm nay.\n\n" +
        "Con kính xin chư vị phù hộ cho gia đình sức khỏe đầy đủ, việc nhà êm ấm, việc làm ăn có kết quả tốt, con cháu chăm ngoan, học hành tiến bộ.\n\n" +
        CLOSE
    },
    {
      id: "gio",
      name: "Giỗ gia tiên",
      icon: "🕯️",
      offerings: "Mâm cơm (món người mất lúc sinh thời ưa thích), hương, hoa, trà, rượu, quả, vàng mã tùy phong tục.",
      body: (v) =>
        `${OPEN}\n${THAN_LINH}\n${TO_TIEN(v.family)}\n\n${WHO(v)}\n\n` +
        `Hôm nay là ${v.date}, ngày giỗ của ${v.deceased}.\n\n` +
        `Đến ngày giỗ, con cháu trong nhà cùng sum họp, làm mâm cơm và thắp nén hương tưởng nhớ ${v.deceased}. ` +
        "Công ơn sinh thành, dưỡng dục và những lời dạy bảo năm xưa, con cháu luôn ghi nhớ.\n\n" +
        `Kính mời hương linh ${v.deceased} cùng Tổ tiên về chứng giám, nhận tấm lòng của con cháu. ` +
        "Xin phù hộ cho gia đình đoàn kết, mạnh khỏe, mọi người sống tử tế và làm ăn ngay thẳng.\n\n" +
        CLOSE
    },
    {
      id: "than-tai",
      name: "Thần Tài",
      icon: "💰",
      offerings: "Hương, hoa, nước, trà, quả; ngày vía Thần Tài (mùng 10 tháng Giêng) thường có thêm heo quay, vàng.",
      body: (v) =>
        `${OPEN}\nCon kính lạy Hoàng thiên Hậu thổ, chư vị Tôn thần.\nCon kính lạy ngài Thần Tài, ngài Thổ địa cùng các vị Thần linh coi sóc nơi này.\n\n${WHO(v)}\n\n` +
        `Hôm nay là ${v.date}.\n\n` +
        "Con thắp nén hương, dâng chút lễ vật, cảm tạ các ngài đã cho cửa hàng, công việc của con được thuận lợi thời gian qua.\n\n" +
        "Con xin các ngài tiếp tục phù trợ: buôn bán đắt hàng, khách quen nhớ đến, khách mới tìm về, tiền bạc rõ ràng, làm ăn giữ chữ tín, cả nhà bình an.\n\n" +
        CLOSE
    },
    {
      id: "tao-quan",
      name: "Ông Công ông Táo",
      icon: "🐟",
      offerings: "Mũ ông Công (2 mũ nam, 1 mũ nữ), cá chép (sống hoặc giấy), hương, hoa, trà, quả, mâm cỗ tùy gia đình.",
      body: (v) =>
        `${OPEN}\nCon kính lạy ngài Táo quân, vị Thần coi sóc bếp lửa và việc nhà.\n\n${WHO(v)}\n\n` +
        `Hôm nay là ${v.date}, ngày tiễn ông Công ông Táo về trời.\n\n` +
        "Gia đình con sửa soạn mũ áo, cá chép cùng mâm lễ, thành kính tiễn ngài lên đường. Suốt một năm qua, nhờ ngài giữ gìn bếp lửa mà nhà con được ấm êm.\n\n" +
        "Con xin ngài tâu lên những điều tốt đẹp, lượng thứ cho những thiếu sót của gia đình, và phù hộ cho năm mới cả nhà khỏe mạnh, đủ đầy, mọi việc hanh thông.\n\n" +
        CLOSE
    }
  ];

  return {
    TRUC,
    ACTIVITIES,
    QUE,
    VAN_KHAN,
    trucIndex,
    dayAdvice,
    fitsActivity,
    napAmOfYear,
    tuoiDay
  };
})();
