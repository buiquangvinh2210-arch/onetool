(function () {
  "use strict";

  const BANKS = [
    { bin: "970436", name: "Vietcombank" },
    { bin: "970418", name: "BIDV" },
    { bin: "970415", name: "VietinBank" },
    { bin: "970405", name: "Agribank" },
    { bin: "970407", name: "Techcombank" },
    { bin: "970422", name: "MB Bank" },
    { bin: "970416", name: "ACB" },
    { bin: "970432", name: "VPBank" },
    { bin: "970423", name: "TPBank" },
    { bin: "970403", name: "Sacombank" },
    { bin: "970441", name: "VIB" },
    { bin: "970443", name: "SHB" },
    { bin: "970437", name: "HDBank" },
    { bin: "970426", name: "MSB" },
    { bin: "970448", name: "OCB" },
    { bin: "970440", name: "SeABank" },
    { bin: "970431", name: "Eximbank" },
    { bin: "970449", name: "LPBank" },
    { bin: "970412", name: "PVcomBank" },
    { bin: "970428", name: "Nam A Bank" },
    { bin: "970409", name: "Bac A Bank" },
    { bin: "970438", name: "BaoViet Bank" },
    { bin: "970425", name: "ABBank" },
    { bin: "970419", name: "NCB" },
    { bin: "970452", name: "KienlongBank" },
    { bin: "970433", name: "VietBank" },
    { bin: "970424", name: "Shinhan Bank" },
    { bin: "970458", name: "UOB Việt Nam" },
    { bin: "546034", name: "CAKE by VPBank" }
  ];

  const els = {
    bank: document.getElementById("bank"),
    account: document.getElementById("account"),
    name: document.getElementById("accName"),
    amount: document.getElementById("amount"),
    memo: document.getElementById("memo"),
    status: document.getElementById("status"),
    preview: document.getElementById("preview"),
    empty: document.getElementById("qrEmpty"),
    copyBtn: document.getElementById("copyBtn"),
    downloadBtn: document.getElementById("downloadBtn"),
    payload: document.getElementById("payload")
  };

  let lastBlob = null;

  function tlv(id, value) {
    const v = String(value);
    return id + String(v.length).padStart(2, "0") + v;
  }

  function crc16(str) {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let b = 0; b < 8; b++) {
        crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  function stripVi(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^A-Za-z0-9 .,_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function buildPayload() {
    const bin = els.bank.value;
    const acc = els.account.value.replace(/\s+/g, "");
    if (!bin) throw new Error("Chọn ngân hàng.");
    if (!/^\d{6,19}$/.test(acc)) throw new Error("Số tài khoản chỉ gồm chữ số, 6–19 ký tự.");
    const amountRaw = String(els.amount.value || "").replace(/[^\d]/g, "");
    const memo = stripVi(els.memo.value).slice(0, 25);
    const consumer = tlv("00", bin) + tlv("01", acc);
    const merchantInfo = tlv("00", "A000000727") + tlv("01", consumer) + tlv("02", "QRIBFTTA");
    let payload = tlv("00", "01") + tlv("01", amountRaw ? "12" : "11") + tlv("38", merchantInfo) + tlv("53", "704");
    if (amountRaw) payload += tlv("54", amountRaw);
    payload += tlv("58", "VN");
    if (memo) payload += tlv("62", tlv("08", memo));
    payload += "6304";
    return payload + crc16(payload);
  }

  function fillBanks() {
    els.bank.innerHTML =
      `<option value="">— Chọn ngân hàng —</option>` +
      BANKS.map((b) => `<option value="${b.bin}">${b.name} (${b.bin})</option>`).join("");
  }

  function money(n) {
    if (!n) return "";
    return Number(n).toLocaleString("vi-VN") + " đ";
  }

  async function paintCard(payload) {
    const bank = BANKS.find((b) => b.bin === els.bank.value);
    const acc = els.account.value.replace(/\s+/g, "");
    const name = (els.name.value || "").trim();
    const amountRaw = String(els.amount.value || "").replace(/[^\d]/g, "");
    const qrUrl = await OTUtils.makeQrDataUrl(payload, 640);
    const qr = await new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = qrUrl;
    });
    const w = 720;
    const h = 960;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const x = c.getContext("2d");
    x.fillStyle = "#f4f1ff";
    x.fillRect(0, 0, w, h);
    roundRect(x, 36, 36, w - 72, h - 72, 28, "#fff");
    x.fillStyle = "#7c3aed";
    x.font = "800 28px Plus Jakarta Sans, system-ui, sans-serif";
    x.textAlign = "center";
    x.fillText("VietQR", w / 2, 92);
    x.fillStyle = "#16121c";
    x.font = "700 26px Plus Jakarta Sans, system-ui, sans-serif";
    x.fillText(bank ? bank.name : "Ngân hàng", w / 2, 132);
    x.drawImage(qr, (w - 480) / 2, 168, 480, 480);
    x.fillStyle = "#16121c";
    x.font = "700 32px ui-monospace, Consolas, monospace";
    x.fillText(acc.replace(/(\d{4})(?=\d)/g, "$1 ").trim(), w / 2, 700);
    if (name) {
      x.font = "650 24px Plus Jakarta Sans, system-ui, sans-serif";
      x.fillStyle = "#4b4458";
      x.fillText(name.toUpperCase(), w / 2, 744);
    }
    if (amountRaw) {
      x.fillStyle = "#7c3aed";
      x.font = "800 36px Plus Jakarta Sans, system-ui, sans-serif";
      x.fillText(money(amountRaw), w / 2, 800);
    }
    x.fillStyle = "#8a8496";
    x.font = "600 16px Plus Jakarta Sans, system-ui, sans-serif";
    x.fillText("Quét bằng app ngân hàng · NAPAS VietQR", w / 2, 868);
    return OT.canvasToBlob(c, "image/png");
  }

  function roundRect(x, left, top, w, h, r, fill) {
    x.beginPath();
    x.moveTo(left + r, top);
    x.arcTo(left + w, top, left + w, top + h, r);
    x.arcTo(left + w, top + h, left, top + h, r);
    x.arcTo(left, top + h, left, top, r);
    x.arcTo(left, top, left + w, top, r);
    x.closePath();
    x.fillStyle = fill;
    x.fill();
  }

  async function generate() {
    try {
      const payload = buildPayload();
      els.payload.value = payload;
      lastBlob = await paintCard(payload);
      const url = URL.createObjectURL(lastBlob);
      els.preview.innerHTML = `<img alt="Mã VietQR" src="${url}" />`;
      els.preview.hidden = false;
      els.empty.hidden = true;
      els.copyBtn.disabled = false;
      els.downloadBtn.disabled = false;
      els.status.textContent = "Xong — quét thử bằng app ngân hàng trước khi in.";
      els.status.className = "vqr-status is-ok";
    } catch (e) {
      els.status.textContent = e.message || String(e);
      els.status.className = "vqr-status is-err";
    }
  }

  fillBanks();
  document.getElementById("runBtn").addEventListener("click", generate);
  els.copyBtn.addEventListener("click", async () => {
    if (!lastBlob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": lastBlob })]);
      els.status.textContent = "Đã sao chép ảnh VietQR.";
      els.status.className = "vqr-status is-ok";
    } catch {
      els.status.textContent = "Không sao chép được — hãy tải PNG.";
      els.status.className = "vqr-status is-err";
    }
  });
  els.downloadBtn.addEventListener("click", () => {
    if (!lastBlob) return;
    OT.downloadBlob(lastBlob, "vietqr.png");
  });
})();
