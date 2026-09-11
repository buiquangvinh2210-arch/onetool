/**
 * Watermark PDF — text / ảnh, opacity, góc xoay, vị trí (preset / kéo tay / lặp ô).
 * Phụ thuộc OTPdf.loadPdfLib + pdf-lib.
 */
window.OTPdfWatermark = (function () {
  "use strict";

  function clamp(n, a, b) {
    return Math.min(b, Math.max(a, n));
  }

  function parsePages(spec, count) {
    if (!spec || !String(spec).trim() || String(spec).trim() === "all") {
      return Array.from({ length: count }, (_, i) => i);
    }
    return OT.parsePageSpec(String(spec), count).map((n) => n - 1);
  }

  function hexToRgb(hex) {
    const h = String(hex || "#7c3aed").replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16);
    if (Number.isNaN(n)) return { r: 0.49, g: 0.23, b: 0.93 };
    return {
      r: ((n >> 16) & 255) / 255,
      g: ((n >> 8) & 255) / 255,
      b: (n & 255) / 255
    };
  }

  async function loadImageBytes(file) {
    const buf = new Uint8Array(await file.arrayBuffer());
    const name = String(file.name || "").toLowerCase();
    const type = String(file.type || "").toLowerCase();
    if (type.includes("png") || name.endsWith(".png")) return { bytes: buf, kind: "png" };
    if (type.includes("jpeg") || type.includes("jpg") || name.endsWith(".jpg") || name.endsWith(".jpeg")) {
      return { bytes: buf, kind: "jpg" };
    }
    const bmp = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    canvas.getContext("2d").drawImage(bmp, 0, 0);
    bmp.close?.();
    const blob = await OT.canvasToBlob(canvas, "image/png");
    return { bytes: new Uint8Array(await blob.arrayBuffer()), kind: "png" };
  }

  /** pdf-lib xoay quanh góc dưới-trái — tính BL để tâm nằm tại (cx, cy). */
  function bottomLeftForCenter(cx, cy, w, h, angleDeg) {
    const rad = (Number(angleDeg) || 0) * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
      x: cx - (w / 2) * cos + (h / 2) * sin,
      y: cy - (w / 2) * sin - (h / 2) * cos
    };
  }

  function presetCenter(position, pageW, pageH, boxW, boxH) {
    const pad = 40;
    const cx = pageW / 2;
    const cy = pageH / 2;
    if (position === "tl") return { cx: pad + boxW / 2, cy: pageH - pad - boxH / 2 };
    if (position === "tr") return { cx: pageW - pad - boxW / 2, cy: pageH - pad - boxH / 2 };
    if (position === "bl") return { cx: pad + boxW / 2, cy: pad + boxH / 2 };
    if (position === "br") return { cx: pageW - pad - boxW / 2, cy: pad + boxH / 2 };
    return { cx, cy };
  }

  /**
   * @param {File} file
   * @param {object} opts
   */
  async function apply(file, opts = {}) {
    if (!file) throw new Error("Chọn file PDF.");
    const mode = opts.mode === "image" ? "image" : "text";
    const text = String(opts.text || "OneTool").trim() || "CONFIDENTIAL";
    const opacity = clamp(Number(opts.opacity ?? 0.28), 0.05, 1);
    const angle = Number(opts.angle ?? -32) || 0;
    let fontSize = clamp(Number(opts.fontSize ?? 48), 10, 200);
    const position = opts.position || "center";
    const pagesSpec = opts.pages || "all";
    const colorHex = opts.color || "#7c3aed";
    let imageScale = clamp(Number(opts.imageScale ?? 0.35), 0.05, 1);
    const custom = opts.custom && typeof opts.custom === "object" ? opts.custom : null;

    const { PDFDocument, rgb, degrees, StandardFonts } = await OTPdf.loadPdfLib();
    const srcBytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const indices = parsePages(pagesSpec, doc.getPageCount());
    if (!indices.length) throw new Error("Không có trang nào khớp khoảng trang.");

    let embedded = null;
    if (mode === "image") {
      if (!opts.imageFile) throw new Error("Chọn ảnh watermark.");
      const { bytes, kind } = await loadImageBytes(opts.imageFile);
      embedded = kind === "png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    }

    const { r, g, b } = hexToRgb(colorHex);
    const useCustom = position === "custom" && custom && Number.isFinite(custom.cx) && Number.isFinite(custom.cy);

    for (const idx of indices) {
      const page = doc.getPage(idx);
      const { width, height } = page.getSize();

      const drawOne = (x, y, w, h, size) => {
        if (mode === "image" && embedded) {
          page.drawImage(embedded, {
            x,
            y,
            width: w,
            height: h,
            opacity,
            rotate: degrees(angle)
          });
        } else {
          page.drawText(text, {
            x,
            y,
            size: size || fontSize,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(angle)
          });
        }
      };

      if (mode === "image" && embedded) {
        let iw = embedded.width * imageScale;
        let ih = embedded.height * imageScale;
        if (useCustom && Number.isFinite(custom.wNorm) && custom.wNorm > 0) {
          iw = clamp(custom.wNorm, 0.04, 1.2) * width;
          ih =
            Number.isFinite(custom.hNorm) && custom.hNorm > 0
              ? clamp(custom.hNorm, 0.02, 1.2) * height
              : iw * (embedded.height / Math.max(1, embedded.width));
        }

        if (position === "tile") {
          const gapX = iw * 1.6;
          const gapY = ih * 1.8;
          for (let y = ih * 0.3; y < height; y += gapY) {
            for (let x = iw * 0.2; x < width; x += gapX) {
              drawOne(x, y, iw, ih);
            }
          }
        } else {
          let center;
          if (useCustom) {
            center = {
              cx: clamp(custom.cx, 0, 1) * width,
              cy: clamp(custom.cy, 0, 1) * height
            };
          } else {
            center = presetCenter(position, width, height, iw, ih);
          }
          const bl = bottomLeftForCenter(center.cx, center.cy, iw, ih, angle);
          drawOne(bl.x, bl.y, iw, ih);
        }
      } else {
        // Scale cỡ chữ theo tỉ lệ bề rộng trang → mọi khổ trang nhìn cân nhau
        let size = fontSize;
        if (useCustom && Number.isFinite(custom.wNorm) && custom.wNorm > 0) {
          const targetW = clamp(custom.wNorm, 0.04, 1.2) * width;
          const baseW = font.widthOfTextAtSize(text, 100) || 100;
          size = clamp((targetW / baseW) * 100, 8, 400);
        }
        let textW = font.widthOfTextAtSize(text, size);
        let textH = size;

        if (position === "tile") {
          const gapX = Math.max(textW * 1.4, 160);
          const gapY = size * 3.2;
          for (let y = size; y < height; y += gapY) {
            for (let x = 24; x < width; x += gapX) {
              drawOne(x, y, textW, textH, size);
            }
          }
        } else {
          let center;
          if (useCustom) {
            center = {
              cx: clamp(custom.cx, 0, 1) * width,
              cy: clamp(custom.cy, 0, 1) * height
            };
          } else {
            center = presetCenter(position, width, height, textW, textH);
          }
          const bl = bottomLeftForCenter(center.cx, center.cy, textW, textH, angle);
          drawOne(bl.x, bl.y, textW, textH, size);
        }
      }
    }

    const bytes = await doc.save({ useObjectStreams: true });
    return {
      bytes,
      blob: new Blob([bytes], { type: "application/pdf" }),
      pageCount: doc.getPageCount(),
      stamped: indices.length
    };
  }

  return { apply, bottomLeftForCenter, presetCenter };
})();
