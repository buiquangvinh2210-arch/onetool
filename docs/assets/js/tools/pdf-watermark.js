/**
 * Watermark PDF — text / ảnh, opacity, góc xoay, vị trí, lặp ô.
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
    // Convert other formats via canvas
    const bmp = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    canvas.getContext("2d").drawImage(bmp, 0, 0);
    bmp.close?.();
    const blob = await OT.canvasToBlob(canvas, "image/png");
    return { bytes: new Uint8Array(await blob.arrayBuffer()), kind: "png" };
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
    const fontSize = clamp(Number(opts.fontSize ?? 48), 10, 200);
    const position = opts.position || "center"; // center | tile | tl | tr | bl | br
    const pagesSpec = opts.pages || "all";
    const colorHex = opts.color || "#7c3aed";
    const imageScale = clamp(Number(opts.imageScale ?? 0.35), 0.05, 1);

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

    for (const idx of indices) {
      const page = doc.getPage(idx);
      const { width, height } = page.getSize();

      const drawOne = (x, y, w, h) => {
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
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(angle)
          });
        }
      };

      if (mode === "image" && embedded) {
        const iw = embedded.width * imageScale;
        const ih = embedded.height * imageScale;

        if (position === "tile") {
          const gapX = iw * 1.6;
          const gapY = ih * 1.8;
          for (let y = ih * 0.3; y < height; y += gapY) {
            for (let x = iw * 0.2; x < width; x += gapX) {
              drawOne(x, y, iw, ih);
            }
          }
        } else {
          let x = (width - iw) / 2;
          let y = (height - ih) / 2;
          const pad = 36;
          if (position === "tl") {
            x = pad;
            y = height - ih - pad;
          } else if (position === "tr") {
            x = width - iw - pad;
            y = height - ih - pad;
          } else if (position === "bl") {
            x = pad;
            y = pad;
          } else if (position === "br") {
            x = width - iw - pad;
            y = pad;
          }
          drawOne(x, y, iw, ih);
        }
      } else {
        const textW = font.widthOfTextAtSize(text, fontSize);
        if (position === "tile") {
          const gapX = Math.max(textW * 1.4, 160);
          const gapY = fontSize * 3.2;
          for (let y = fontSize; y < height; y += gapY) {
            for (let x = 24; x < width; x += gapX) {
              drawOne(x, y);
            }
          }
        } else {
          let x = (width - textW) / 2;
          let y = height / 2;
          const pad = 40;
          if (position === "tl") {
            x = pad;
            y = height - pad;
          } else if (position === "tr") {
            x = width - textW - pad;
            y = height - pad;
          } else if (position === "bl") {
            x = pad;
            y = pad + fontSize;
          } else if (position === "br") {
            x = width - textW - pad;
            y = pad + fontSize;
          }
          drawOne(x, y);
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

  return { apply };
})();
