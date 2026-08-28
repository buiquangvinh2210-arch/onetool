/**
 * Khóa PDF bằng mật khẩu trên trình duyệt.
 * Ưu tiên AES-256 (cần HTTPS / localhost). HTTP local → RC4 để test.
 */
window.OTPdfLock = (function () {
  "use strict";

  const MAX_BYTES = 80 * 1024 * 1024;
  const ENCRYPT_ESM = "https://cdn.jsdelivr.net/npm/pdf-lib-encrypt@1.0.3/+esm";

  let encryptMod = null;

  async function loadEncrypt() {
    if (encryptMod) return encryptMod;
    encryptMod = await import(ENCRYPT_ESM);
    return encryptMod;
  }

  function scorePassword(pw) {
    const s = String(pw || "");
    let score = 0;
    if (s.length >= 6) score += 1;
    if (s.length >= 10) score += 1;
    if (s.length >= 14) score += 1;
    if (/[a-z]/.test(s) && /[A-Z]/.test(s)) score += 1;
    if (/\d/.test(s)) score += 1;
    if (/[^A-Za-z0-9]/.test(s)) score += 1;
    if (score <= 2) return { level: "weak", label: "Yếu", pct: 28 };
    if (score <= 4) return { level: "medium", label: "Trung bình", pct: 62 };
    return { level: "strong", label: "Mạnh", pct: 100 };
  }

  function validatePasswords(password, confirm) {
    const pw = String(password || "");
    const cf = String(confirm || "");
    if (!pw) throw new Error("Nhập mật khẩu để mở PDF.");
    if (pw.length < 4) throw new Error("Mật khẩu cần ít nhất 4 ký tự.");
    if (pw.length > 64) throw new Error("Mật khẩu tối đa 64 ký tự.");
    if (pw !== cf) throw new Error("Mật khẩu xác nhận không khớp.");
    return pw;
  }

  function hasWebCrypto() {
    try {
      return !!(globalThis.crypto && globalThis.crypto.subtle);
    } catch (_) {
      return false;
    }
  }

  /** AES-256 khi có Web Crypto; HTTP local không có subtle → RC4 để test. */
  function pickAlgo() {
    if (hasWebCrypto()) {
      return { algo: "aes256", label: "AES-256", legacy: false };
    }
    return {
      algo: "rc4",
      label: "RC4 (HTTP local)",
      legacy: true
    };
  }

  function friendlyEncryptError(err) {
    const msg = String(err?.message || err || "");
    if (/secure context|crypto\.subtle|Web Crypto|HTTPS/i.test(msg)) {
      return new Error(
        "Không mã hóa được trên môi trường này. Thử lại hoặc mở qua localhost / HTTPS."
      );
    }
    return err instanceof Error ? err : new Error(msg || "Không khóa được PDF.");
  }

  async function protect(file, opts) {
    if (!file) throw new Error("Chọn file PDF trước.");
    if (file.size > MAX_BYTES) throw new Error("File quá lớn (tối đa 80 MB).");

    const password = validatePasswords(opts?.password, opts?.confirm);
    const cipher = pickAlgo();
    const onProgress = opts?.onProgress;
    onProgress?.({ phase: "load", pct: 8, message: "Đang đọc PDF…" });

    const PDFLib = await window.OTPdf.loadPdfLib();
    const { PDFDocument } = PDFLib;
    const EncryptedPDFError = PDFLib.EncryptedPDFError;
    const bytes = new Uint8Array(await file.arrayBuffer());

    let src;
    try {
      src = await PDFDocument.load(bytes);
    } catch (e) {
      const msg = String(e?.message || e);
      const isEnc =
        (EncryptedPDFError && e instanceof EncryptedPDFError) ||
        /encrypt|password|Encrypted/i.test(msg);
      if (isEnc) {
        throw new Error("PDF này đã được khóa mật khẩu. Hãy dùng bản chưa khóa.");
      }
      throw new Error(msg || "Không đọc được PDF.");
    }

    onProgress?.({ phase: "normalize", pct: 35, message: "Đang chuẩn hóa tài liệu…" });
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
    const pageCount = out.getPageCount();
    if (!pageCount) throw new Error("PDF không có trang nào.");

    // useObjectStreams:false giúp handler mã hóa tương thích nhiều trình đọc hơn
    const plain = await out.save({ useObjectStreams: false });

    onProgress?.({
      phase: "encrypt",
      pct: 70,
      message: cipher.legacy
        ? "HTTP local — đang khóa bằng RC4 (chỉ để test)…"
        : "Đang mã hóa AES-256…"
    });

    let encrypted;
    try {
      const { configure, lock } = await loadEncrypt();
      if (typeof configure === "function") configure(window.PDFLib);
      encrypted = await lock(plain, password, { algo: cipher.algo });
    } catch (e) {
      throw friendlyEncryptError(e);
    }

    onProgress?.({ phase: "done", pct: 100, message: "Hoàn tất" });
    const base = String(file.name || "document").replace(/\.pdf$/i, "");
    const fileName = base + "-locked.pdf";
    const blob = new Blob([encrypted], { type: "application/pdf" });

    return {
      blob,
      fileName,
      meta: {
        pageCount,
        beforeBytes: file.size,
        afterBytes: encrypted.byteLength,
        algo: cipher.label,
        legacy: cipher.legacy,
        strength: scorePassword(password)
      }
    };
  }

  function warmup() {
    if (window.OTPdf?.loadPdfLib) OTPdf.loadPdfLib().catch(() => {});
    loadEncrypt().catch(() => {});
  }

  return {
    MAX_BYTES,
    scorePassword,
    validatePasswords,
    pickAlgo,
    hasWebCrypto,
    protect,
    warmup
  };
})();
