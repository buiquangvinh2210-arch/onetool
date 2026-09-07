/**
 * Ký PDF — nhúng chữ ký / ngày / chữ (PNG) lên trang.
 * Tọa độ nhận từ UI đã quy về PDF user space (pdf.js convertToPdfPoint).
 */
window.OTPdfSign = (function () {
  "use strict";

  const MAX_BYTES = 40 * 1024 * 1024;
  const MAX_STAMPS = 48;
  const LIB_KEY = "ot-pdf-sign-lib-v1";

  const MONTHS_VI = [
    "tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
    "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"
  ];

  function dataUrlToBytes(dataUrl) {
    const s = String(dataUrl || "");
    const comma = s.indexOf(",");
    if (comma < 0) throw new Error("Chữ ký không hợp lệ.");
    const bin = atob(s.slice(comma + 1));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function trimCanvas(canvas, pad) {
    const p = pad == null ? 6 : pad;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h) return canvas;
    const data = ctx.getImageData(0, 0, w, h).data;
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 12) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX) return canvas;
    minX = Math.max(0, minX - p);
    minY = Math.max(0, minY - p);
    maxX = Math.min(w - 1, maxX + p);
    maxY = Math.min(h - 1, maxY + p);
    const tw = maxX - minX + 1;
    const th = maxY - minY + 1;
    const out = document.createElement("canvas");
    out.width = tw;
    out.height = th;
    out.getContext("2d").drawImage(canvas, minX, minY, tw, th, 0, 0, tw, th);
    return out;
  }

  function removeNearWhite(canvas, threshold) {
    const t = threshold == null ? 236 : threshold;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (min >= t && max - min < 28) {
        const fade = (min - t) / (255 - t);
        d[i + 3] = Math.round(d[i + 3] * (1 - Math.min(1, fade + 0.65)));
      }
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  }

  async function canvasPngDataUrl(canvas) {
    const blob = await OT.canvasToBlob(canvas, "image/png");
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ""));
      r.onerror = () => reject(new Error("Không đọc được chữ ký."));
      r.readAsDataURL(blob);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Không đọc được ảnh chữ ký."));
      img.src = src;
    });
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function formatDateVi(date, fmt) {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) throw new Error("Ngày không hợp lệ.");
    const day = pad2(d.getDate());
    const month = pad2(d.getMonth() + 1);
    const year = d.getFullYear();
    const monthName = MONTHS_VI[d.getMonth()];
    switch (fmt) {
      case "iso":
        return `${year}-${month}-${day}`;
      case "long":
        return `${day} ${monthName}, ${year}`;
      case "legal":
        return `Ngày ${day} ${monthName} năm ${year}`;
      case "dmy":
      default:
        return `${day}/${month}/${year}`;
    }
  }

  async function renderTextPng(opts) {
    const text = String(opts.text || "").trim();
    if (!text) throw new Error("Nhập nội dung chữ ký.");
    const fontFamily = opts.fontFamily || "Pacifico, cursive";
    const color = opts.color || "#1e3a8a";
    const fontSize = Math.max(28, Number(opts.fontSize) || 88);
    const weight = opts.fontWeight || "700";
    const style = opts.fontStyle || "normal";
    try {
      await document.fonts.load(`${style} ${weight} ${fontSize}px ${fontFamily}`);
      await document.fonts.ready;
    } catch (_) {}

    const probe = document.createElement("canvas");
    const pctx = probe.getContext("2d");
    pctx.font = `${style} ${weight} ${fontSize}px ${fontFamily}`;
    const lines = text.split(/\n/).map((s) => s.trim()).filter(Boolean);
    const use = lines.length ? lines : [text];
    let maxW = 0;
    use.forEach((ln) => {
      maxW = Math.max(maxW, pctx.measureText(ln).width);
    });
    const lineH = fontSize * 1.18;
    const padX = Math.round(fontSize * 0.28);
    const padY = Math.round(fontSize * 0.22);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(32, Math.ceil(maxW + padX * 2));
    canvas.height = Math.max(32, Math.ceil(use.length * lineH + padY * 2));
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${style} ${weight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    use.forEach((ln, i) => {
      ctx.fillText(ln, padX, padY + i * lineH);
    });
    const trimmed = trimCanvas(canvas, 4);
    return {
      dataUrl: await canvasPngDataUrl(trimmed),
      width: trimmed.width,
      height: trimmed.height
    };
  }

  async function renderDatePng(opts) {
    const text = String(opts.text || "").trim();
    if (!text) throw new Error("Chọn ngày ký.");
    return renderTextPng({
      text,
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      fontSize: 42,
      fontWeight: "650",
      fontStyle: "normal",
      color: opts.color || "#111827"
    });
  }

  async function renderLinePng(opts) {
    const w = 720;
    const h = 86;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = opts.color || "#334155";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(8, 52);
    ctx.lineTo(w - 8, 52);
    ctx.stroke();
    ctx.fillStyle = opts.color || "#64748b";
    ctx.font = '500 22px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textBaseline = "top";
    ctx.fillText(opts.label || "Ký tên / Signature", 8, 58);
    return {
      dataUrl: await canvasPngDataUrl(canvas),
      width: w,
      height: h
    };
  }

  async function processUploadFile(file) {
    if (!file) throw new Error("Chọn ảnh chữ ký.");
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const maxEdge = 1600;
      const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(8, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(8, Math.round(img.naturalHeight * scale));
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      removeNearWhite(canvas);
      const trimmed = trimCanvas(canvas, 8);
      return {
        dataUrl: await canvasPngDataUrl(trimmed),
        width: trimmed.width,
        height: trimmed.height
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function bakeRotatedPng(dataUrl, cssW, cssH, rotateDeg) {
    const img = await loadImage(dataUrl);
    const rad = ((Number(rotateDeg) || 0) * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const outW = Math.max(8, Math.ceil(cssW * cos + cssH * sin));
    const outH = Math.max(8, Math.ceil(cssW * sin + cssH * cos));
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(16, Math.round(outW * scale));
    canvas.height = Math.max(16, Math.round(outH * scale));
    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(
      img,
      (-cssW * scale) / 2,
      (-cssH * scale) / 2,
      cssW * scale,
      cssH * scale
    );
    return {
      dataUrl: await canvasPngDataUrl(canvas),
      width: canvas.width,
      height: canvas.height
    };
  }

  function rotatedAabb(x, y, w, h, deg) {
    const rad = ((Number(deg) || 0) * Math.PI) / 180;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const pts = [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h]
    ].map(([px, py]) => {
      const dx = px - cx;
      const dy = py - cy;
      return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
    });
    let minX = pts[0][0];
    let minY = pts[0][1];
    let maxX = pts[0][0];
    let maxY = pts[0][1];
    pts.forEach(([px, py]) => {
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
    });
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  function cssBoxToPdf(left, top, w, h, viewport) {
    const bl = viewport.convertToPdfPoint(left, top + h);
    const br = viewport.convertToPdfPoint(left + w, top + h);
    const tl = viewport.convertToPdfPoint(left, top);
    const tr = viewport.convertToPdfPoint(left + w, top);
    const xs = [bl[0], br[0], tl[0], tr[0]];
    const ys = [bl[1], br[1], tl[1], tr[1]];
    const x = Math.min.apply(null, xs);
    const y = Math.min.apply(null, ys);
    return {
      x,
      y,
      width: Math.max(4, Math.max.apply(null, xs) - x),
      height: Math.max(4, Math.max.apply(null, ys) - y)
    };
  }

  function pdfBoxToCss(box, viewport) {
    const p1 = viewport.convertToViewportPoint(box.x, box.y);
    const p2 = viewport.convertToViewportPoint(box.x + box.width, box.y + box.height);
    const left = Math.min(p1[0], p2[0]);
    const top = Math.min(p1[1], p2[1]);
    return {
      left,
      top,
      w: Math.abs(p2[0] - p1[0]),
      h: Math.abs(p2[1] - p1[1])
    };
  }

  function readLib() {
    try {
      const raw = JSON.parse(localStorage.getItem(LIB_KEY) || "[]");
      return Array.isArray(raw) ? raw.slice(0, 12) : [];
    } catch (_) {
      return [];
    }
  }

  function writeLib(items) {
    try {
      localStorage.setItem(LIB_KEY, JSON.stringify((items || []).slice(0, 12)));
    } catch (_) {}
  }

  /**
   * @param {File} file
   * @param {Array<{ pageIndex: number, dataUrl: string, x: number, y: number, width: number, height: number, rotate: number, opacity: number }>} draws
   */
  async function apply(file, draws) {
    if (!file) throw new Error("Chọn file PDF.");
    if (!draws || !draws.length) throw new Error("Đặt ít nhất một chữ ký hoặc dấu lên trang.");
    if (draws.length > MAX_STAMPS) throw new Error("Tối đa " + MAX_STAMPS + " chữ ký / dấu trên một file.");

    const { PDFDocument, degrees } = await OTPdf.loadPdfLib();
    const srcBytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
    const pageCount = doc.getPageCount();

    const cache = new Map();
    async function embedPng(dataUrl) {
      if (cache.has(dataUrl)) return cache.get(dataUrl);
      const bytes = dataUrlToBytes(dataUrl);
      const img = await doc.embedPng(bytes);
      cache.set(dataUrl, img);
      return img;
    }

    for (const d of draws) {
      const idx = Number(d.pageIndex);
      if (!Number.isInteger(idx) || idx < 0 || idx >= pageCount) {
        throw new Error("Chữ ký nằm ngoài số trang PDF.");
      }
      const page = doc.getPage(idx);
      const img = await embedPng(d.dataUrl);
      const rot = Number(d.rotate) || 0;
      const opacity = Math.max(0.08, Math.min(1, d.opacity == null ? 1 : Number(d.opacity)));
      page.drawImage(img, {
        x: Number(d.x) || 0,
        y: Number(d.y) || 0,
        width: Math.max(4, Number(d.width) || 40),
        height: Math.max(4, Number(d.height) || 16),
        rotate: degrees(rot),
        opacity
      });
    }

    const bytes = await doc.save({ useObjectStreams: true });
    return {
      blob: new Blob([bytes], { type: "application/pdf" }),
      pageCount,
      signed: draws.length
    };
  }

  return {
    MAX_BYTES,
    MAX_STAMPS,
    apply,
    trimCanvas,
    removeNearWhite,
    canvasPngDataUrl,
    renderTextPng,
    renderDatePng,
    renderLinePng,
    processUploadFile,
    bakeRotatedPng,
    formatDateVi,
    loadImage,
    dataUrlToBytes,
    cssBoxToPdf,
    pdfBoxToCss,
    rotatedAabb,
    readLib,
    writeLib
  };
})();
