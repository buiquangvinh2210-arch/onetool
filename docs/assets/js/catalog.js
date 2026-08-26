window.OTCatalog = {
  categories: [
    {
      slug: "media",
      seo: "cong-cu-media",
      name: "Media & AI",
      desc: "TikTok, Audio → Text, Tóm tắt AI, nén & cắt video",
      icon: "🎙️",
      seoTitle: "Công cụ Media & AI online — Tải TikTok, Audio/Video sang văn bản, Tóm tắt AI | OneTool",
      seoDescription: "Tải video TikTok HD, Audio/Video → văn bản, tóm tắt AI, nén/cắt MP4. Nén & cắt chạy trên máy; TikTok và AI dùng cloud. Miễn phí.",
      seoKeywords: "tải video tiktok, audio to text, tóm tắt ai, tóm tắt văn bản, nén video online"
    },
    {
      slug: "pdf-tools",
      seo: "cong-cu-pdf",
      name: "Công cụ PDF",
      desc: "Gộp, tách, nén, watermark, PDF to Word",
      icon: "📄",
      seoTitle: "Công cụ PDF online miễn phí — Gộp, tách, nén PDF | OneTool",
      seoDescription: "Gộp PDF, tách trang, nén dung lượng, xoay và convert PDF sang TXT/ảnh — xử lý 100% trên trình duyệt, không cần đăng ký.",
      seoKeywords: "gộp pdf online, tách pdf, nén pdf, xoay pdf, convert pdf, công cụ pdf miễn phí"
    },
    {
      slug: "images",
      seo: "cong-cu-anh",
      name: "Công cụ Ảnh",
      desc: "Convert, HEIC, resize, xóa nền AI, batch",
      icon: "🖼️",
      seoTitle: "Công cụ ảnh online — Convert, resize, xóa nền AI | OneTool",
      seoDescription: "Đổi định dạng JPG PNG WebP, resize ảnh, xóa nền AI, xử lý batch — miễn phí, chạy trên trình duyệt, bảo mật file.",
      seoKeywords: "convert ảnh online, đổi jpg png webp, resize ảnh, xóa nền ảnh, xóa background miễn phí"
    },
    {
      slug: "file-converter",
      seo: "cong-cu-chuyen-doi",
      name: "File & dữ liệu",
      desc: "Excel ↔ CSV/JSON, OCR bảng → Excel, CSV ↔ JSON",
      icon: "📊",
      seoTitle: "Chuyển đổi file & dữ liệu online — Excel CSV JSON | OneTool",
      seoDescription: "Excel sang CSV/JSON, CSV/JSON sang Excel, convert document — công cụ chuyển đổi dữ liệu nhanh trên trình duyệt.",
      seoKeywords: "excel sang csv, excel sang json, csv sang excel, json sang excel, chuyển đổi file online"
    },
    {
      slug: "developer",
      seo: "cong-cu-lap-trinh",
      name: "Lập trình",
      desc: "JSON, Base64, UUID, Hash, slugify",
      icon: "🛠️",
      seoTitle: "Công cụ lập trình online — JSON, Base64, UUID, Hash | OneTool",
      seoDescription: "Format JSON, encode Base64, tạo UUID, hash SHA, slugify tiếng Việt — miễn phí trên trình duyệt.",
      seoKeywords: "json formatter, base64 encode, uuid v4, hash sha256, slugify tiếng việt"
    },
    {
      slug: "utilities",
      seo: "cong-cu-tien-ich",
      name: "Tiện ích",
      desc: "Đếm từ, QR Code, mật khẩu, chuyển đổi chữ",
      icon: "🔧",
      seoTitle: "Tiện ích online — QR Code, mật khẩu, chuyển đổi chữ | OneTool",
      seoDescription: "Tạo mã QR, password generator, chuyển đổi chữ hoa/thường bỏ dấu — tiện ích miễn phí.",
      seoKeywords: "tạo qr code, password generator, chuyển đổi chữ, bỏ dấu tiếng việt"
    },
    {
      slug: "units",
      seo: "cong-cu-don-vi",
      name: "Đơn vị",
      desc: "Khối lượng, chiều dài, nhiệt độ, dung lượng…",
      icon: "⚖️",
      seoTitle: "Chuyển đổi đơn vị online — kg, mét, °C, MB | OneTool",
      seoDescription: "Đổi khối lượng, chiều dài, diện tích, thể tích, nhiệt độ, tốc độ, dung lượng — hệ số SI chuẩn, miễn phí.",
      seoKeywords: "chuyển đổi đơn vị, đổi kg sang lb, đổi mét sang feet, đổi độ c sang f, đổi mb sang gib"
    }
  ],
  tools: [
    /* Media — nổi bật trước */
    { slug: "tiktok-download", name: "Tải TikTok không logo", desc: "Dán link → tải MP4 HD không dính logo / watermark TikTok.", icon: "🎵", cat: "media", featured: true, rank: 1 },
    { slug: "audio-to-text", name: "Audio to Text tiếng Việt", desc: "Chuyển giọng nói thành văn bản tiếng Việt từ MP3, WAV, MP4 — xuất TXT và phụ đề SRT.", icon: "🎙️", cat: "media", featured: true, rank: 2 },
    { slug: "ai-summarize", name: "Tóm tắt AI", desc: "Rút gọn bài viết, biên bản, email bằng AI — đoạn văn, gạch đầu dòng hoặc TL;DR.", icon: "✨", cat: "media", featured: true, rank: 3 },
    { slug: "video-convert", name: "Nén video online", desc: "Nén MP4, đổi WebM hoặc tách MP3 — chạy trên trình duyệt.", icon: "🎬", cat: "media", featured: true, rank: 4 },
    { slug: "video-trim", name: "Cắt video online", desc: "Chọn đoạn start–end, xem trước rồi cắt — nhanh trên máy bạn.", icon: "✂️", cat: "media", featured: true, rank: 5 },

    /* PDF */
    { slug: "pdf-to-word", name: "PDF sang Word", desc: "Chuyển PDF thành Word (DOCX) để chỉnh sửa — kể cả bản scan.", icon: "📄", cat: "pdf-tools", featured: true, rank: 1 },
    { slug: "pdf-merge", name: "Gộp PDF online", desc: "Ghép nhiều file PDF thành một tài liệu, sắp xếp thứ tự rồi tải về — miễn phí.", icon: "📎", cat: "pdf-tools", featured: true, rank: 2 },
    { slug: "image-pdf", name: "Ảnh ↔ PDF", desc: "Hai hướng rõ ràng: ghép ảnh thành PDF, hoặc xuất PDF ra ảnh.", icon: "🔄", cat: "pdf-tools", featured: true, rank: 3 },
    { slug: "image-to-pdf", name: "Ảnh sang PDF", desc: "Ghép một hoặc nhiều ảnh thành PDF — sắp xếp thứ tự, chọn khổ trang.", icon: "🖼️", cat: "pdf-tools", featured: true, rank: 4 },
    { slug: "pdf-to-image", name: "PDF sang ảnh", desc: "Xuất từng trang PDF ra PNG / JPG / WebP — xem trước hoặc tải ZIP.", icon: "🌄", cat: "pdf-tools", featured: true, rank: 5 },
    { slug: "pdf-watermark", name: "Watermark PDF", desc: "Thêm chữ hoặc logo watermark lên PDF — chỉnh độ trong suốt, góc, vị trí.", icon: "💧", cat: "pdf-tools", featured: true, rank: 6 },
    { slug: "pdf-compress", name: "Nén PDF online", desc: "Giảm dung lượng PDF để gửi email, Zalo hoặc nộp hồ sơ — xem % tiết kiệm rồi tải về.", icon: "🗜️", cat: "pdf-tools", featured: true, rank: 7 },
    { slug: "office-to-pdf", name: "Word/Excel sang PDF", desc: "Convert DOCX hoặc XLSX thành PDF sạch để gửi, in hoặc nộp hồ sơ.", icon: "📑", cat: "pdf-tools", rank: 8 },
    { slug: "pdf-split", name: "Tách PDF online", desc: "Tách PDF theo trang hoặc khoảng — tải đúng phần cần dùng.", icon: "✂️", cat: "pdf-tools", rank: 9 },
    { slug: "pdf-pages", name: "Xoay xóa trang PDF", desc: "Xoay trang bị ngược hoặc xóa trang trắng / trang nhầm trước khi gửi.", icon: "🔄", cat: "pdf-tools", rank: 10 },
    { slug: "pdf-convert", name: "PDF sang TXT", desc: "Trích chữ từ PDF (text layer + OCR bản scan) ra TXT.", icon: "📤", cat: "pdf-tools", rank: 11 },

    /* Ảnh */
    { slug: "remove-background", name: "Xóa nền ảnh", desc: "Tách nền ảnh bằng AI, xem preview, xuất PNG trong suốt — miễn phí.", icon: "✂️", cat: "images", featured: true, rank: 1 },
    { slug: "heic-convert", name: "HEIC sang JPG", desc: "Chuyển HEIC / HEIF (và JPG PNG) sang JPG · PNG · WebP — nhiều ảnh, tải ZIP.", icon: "📱", cat: "images", featured: true, rank: 2 },
    { slug: "image-compress", name: "Nén ảnh online", desc: "Giảm dung lượng JPG / PNG / WebP — xem % tiết kiệm, so sánh trước/sau.", icon: "🗜️", cat: "images", featured: true, rank: 3 },
    { slug: "image-convert", name: "Convert ảnh", desc: "Đổi JPG ↔ PNG ↔ WebP và các định dạng phổ biến — kéo thả, chọn format, tải về.", icon: "🖼️", cat: "images", featured: true, rank: 4 },
    { slug: "image-resize", name: "Resize ảnh", desc: "Đổi kích thước ảnh theo pixel hoặc preset — giữ tỉ lệ, xuất JPG/PNG/WebP.", icon: "📐", cat: "images", featured: true, rank: 5 },
    { slug: "image-batch", name: "Xử lý hàng loạt ảnh", desc: "Convert, resize hoặc nén nhiều ảnh cùng lúc — phù hợp catalog sản phẩm.", icon: "📦", cat: "images", rank: 6 },

    /* File & dữ liệu */
    { slug: "excel-convert", name: "Excel sang CSV JSON", desc: "Convert XLSX/XLS sang CSV hoặc JSON — và ngược lại. Chọn sheet, xem trước, tải file.", icon: "📗", cat: "file-converter", featured: true, rank: 1 },
    { slug: "ocr-table", name: "OCR bảng sang Excel", desc: "Chụp bảng / biên lai → OCR tiếng Việt → chỉnh sửa → tải XLSX/CSV.", icon: "📋", cat: "file-converter", featured: true, rank: 2 },
    { slug: "convert-data", name: "CSV to JSON", desc: "Dán dữ liệu hoặc mở file — đổi CSV ↔ JSON ngay trên trình duyệt.", icon: "📊", cat: "file-converter", featured: true, rank: 3 },
    { slug: "convert-document", name: "Convert Document · PDF sang TXT", desc: "Lối tắt mở Convert PDF (TXT + OCR).", icon: "📝", cat: "file-converter", hub: "pdf-convert", rank: 4 },
    { slug: "convert-image", name: "Convert Image · Đổi ảnh nhanh", desc: "Lối tắt mở công cụ Convert Ảnh.", icon: "🖼️", cat: "file-converter", hub: "image-convert", rank: 9 },

    /* Đơn vị — hub + tool nổi bật trước */
    { slug: "unit-convert", name: "Chuyển đổi đơn vị", desc: "Chọn nhóm cần đổi — mỗi tool riêng, hệ số SI/NIST chuẩn.", icon: "⚖️", cat: "units", featured: true, rank: 1 },
    { slug: "unit-mass", name: "Đổi khối lượng", desc: "Đổi khối lượng: kg · lb · g. Hệ số chuẩn, kết quả tức thì.", icon: "⚖️", cat: "units", featured: true, rank: 2 },
    { slug: "unit-length", name: "Đổi chiều dài", desc: "Đổi chiều dài: m · ft · inch. Hệ số chuẩn, kết quả tức thì.", icon: "📏", cat: "units", featured: true, rank: 3 },
    { slug: "unit-temp", name: "Đổi nhiệt độ", desc: "Đổi nhiệt độ: °C · °F · K. Hệ số chuẩn, kết quả tức thì.", icon: "🌡️", cat: "units", featured: true, rank: 4 },
    { slug: "unit-data", name: "Đổi dung lượng", desc: "Đổi dung lượng: MB · GiB. Hệ số chuẩn, kết quả tức thì.", icon: "💾", cat: "units", featured: true, rank: 5 },
    { slug: "unit-volume", name: "Đổi thể tích", desc: "Đổi thể tích: L · mL · gallon. Hệ số chuẩn, kết quả tức thì.", icon: "🧪", cat: "units", rank: 6 },
    { slug: "unit-area", name: "Đổi diện tích", desc: "Đổi diện tích: m² · ha · acre. Hệ số chuẩn, kết quả tức thì.", icon: "🗺️", cat: "units", rank: 7 },
    { slug: "unit-speed", name: "Đổi tốc độ", desc: "Đổi tốc độ: km/h · mph. Hệ số chuẩn, kết quả tức thì.", icon: "🚀", cat: "units", rank: 8 },
    { slug: "unit-time", name: "Đổi thời gian", desc: "Đổi thời gian: giờ · phút · giây. Hệ số chuẩn, kết quả tức thì.", icon: "⏱️", cat: "units", rank: 9 },
    { slug: "unit-energy", name: "Đổi năng lượng", desc: "Đổi năng lượng: J · kWh · cal. Hệ số chuẩn, kết quả tức thì.", icon: "⚡", cat: "units", rank: 10 },
    { slug: "unit-pressure", name: "Đổi áp suất", desc: "Đổi áp suất: Pa · bar · atm. Hệ số chuẩn, kết quả tức thì.", icon: "🔘", cat: "units", rank: 11 },
    { slug: "unit-power", name: "Đổi công suất", desc: "Đổi công suất: W · kW · HP. Hệ số chuẩn, kết quả tức thì.", icon: "🔌", cat: "units", rank: 12 },
    { slug: "unit-angle", name: "Đổi góc", desc: "Đổi góc: độ · radian. Hệ số chuẩn, kết quả tức thì.", icon: "📐", cat: "units", rank: 13 },
    { slug: "unit-fuel", name: "Đổi tiêu hao nhiên liệu", desc: "Đổi tiêu hao nhiên liệu: L/100km · mpg. Hệ số chuẩn, kết quả tức thì.", icon: "⛽", cat: "units", rank: 14 },

    /* Lập trình */
    { slug: "json-tools", name: "Format JSON", desc: "Làm đẹp, minify và kiểm tra JSON hợp lệ — tiện debug API.", icon: "{ }", cat: "developer", featured: true, rank: 1 },
    { slug: "base64-tools", name: "Base64 encode decode", desc: "Encode/decode Base64 — tiếng Việt, URL-safe, file và ảnh có preview.", icon: "🔤", cat: "developer", featured: true, rank: 2 },
    { slug: "developer-tools", name: "UUID Hash Slugify", desc: "UUID, SHA hash, slugify tiếng Việt, Unix timestamp — công cụ dev nhanh.", icon: "🛠️", cat: "developer", featured: true, rank: 3 },

    /* Tiện ích (gọn) */
    { slug: "word-counter", name: "Đếm từ online", desc: "Đếm từ, ký tự, câu, đoạn — thời gian đọc tiếng Việt, mật độ từ khóa.", icon: "🔢", cat: "utilities", featured: true, rank: 1 },
    { slug: "qr-generator", name: "Tạo mã QR", desc: "Tạo mã QR từ link hoặc chữ, xem trước và tải PNG.", icon: "📱", cat: "utilities", featured: true, rank: 2 },
    { slug: "password-generator", name: "Tạo mật khẩu", desc: "Tạo mật khẩu mạnh ngẫu nhiên — chữ, số, ký tự đặc biệt, đo độ mạnh.", icon: "🔐", cat: "utilities", featured: true, rank: 3 },
    { slug: "text-convert", name: "Chuyển đổi chữ", desc: "Viết hoa/thường, bỏ dấu tiếng Việt, slug URL, dọn dòng, encode — chạy trên máy bạn.", icon: "Aa", cat: "utilities", featured: true, rank: 4 }
  ],

  origin: "https://onetool.vn",

  pageMeta: {
    "remove-background": {
      title: "Xóa nền ảnh online miễn phí — PNG trong suốt | OneTool",
      desc: "Xóa nền ảnh online bằng AI: tách người, sản phẩm khỏi phông, xem preview, tải PNG trong suốt. Miễn phí."
    },
    "image-compress": {
      title: "Nén ảnh online miễn phí — JPG PNG WebP | OneTool",
      desc: "Nén ảnh online giảm dung lượng JPG PNG WebP. Xem % tiết kiệm, so sánh trước/sau — miễn phí trên trình duyệt."
    },
    "image-convert": {
      title: "Convert ảnh online miễn phí — JPG PNG WebP | OneTool",
      desc: "Convert ảnh online: đổi JPG ↔ PNG ↔ WebP và định dạng phổ biến. Kéo thả, chọn format, tải về — miễn phí."
    },
    "image-resize": {
      title: "Resize ảnh online miễn phí — đổi kích thước pixel | OneTool",
      desc: "Resize ảnh online theo pixel hoặc preset. Giữ tỉ lệ, xuất JPG/PNG/WebP — miễn phí trên trình duyệt."
    },
    "image-batch": {
      title: "Xử lý hàng loạt ảnh online — convert, resize, nén | OneTool",
      desc: "Batch ảnh online: convert, resize hoặc nén nhiều ảnh cùng lúc. Phù hợp catalog sản phẩm — miễn phí."
    },
    "tiktok-download": {
      title: "Tải TikTok không logo — MP4 HD online miễn phí | OneTool",
      desc: "Tải TikTok không logo, không watermark: dán link lấy MP4 HD hoặc MP3. Miễn phí — kể cả video app không cho lưu."
    },
    "audio-to-text": {
      title: "Audio to Text tiếng Việt — chuyển giọng nói thành văn bản | OneTool",
      desc: "Audio to Text tiếng Việt: chuyển giọng nói thành văn bản từ MP3, WAV, MP4. Xuất TXT và phụ đề SRT — miễn phí."
    },
    "ai-summarize": {
      title: "Tóm tắt AI online — rút gọn văn bản tiếng Việt miễn phí | OneTool",
      desc: "Tóm tắt AI tiếng Việt: rút gọn bài viết, biên bản, email thành đoạn văn, gạch đầu dòng hoặc TL;DR. Miễn phí."
    },
    "video-convert": {
      title: "Nén video online miễn phí — nén MP4, WebM, tách MP3 | OneTool",
      desc: "Nén video online: giảm dung lượng MP4, đổi WebM hoặc tách MP3 ngay trên trình duyệt. Miễn phí, không cần đăng nhập."
    },
    "video-trim": {
      title: "Cắt video online miễn phí — trim MP4 theo thời gian | OneTool",
      desc: "Cắt video online (trim): chọn đoạn start–end, xem trước rồi xuất clip mới. Miễn phí trên trình duyệt."
    },
    "heic-convert": {
      title: "HEIC sang JPG online miễn phí — đổi HEIC/HEIF | OneTool",
      desc: "Đổi ảnh HEIC/HEIF từ iPhone sang JPG, PNG, WebP online. Nhiều ảnh, tải ZIP — miễn phí trên trình duyệt."
    },
    "pdf-watermark": {
      title: "Watermark PDF online miễn phí — đóng dấu chữ / logo | OneTool",
      desc: "Watermark PDF online: thêm chữ hoặc logo, chỉnh độ mờ, góc xoay, vị trí, khoảng trang. Miễn phí trên trình duyệt."
    },
    "ocr-table": {
      title: "OCR bảng sang Excel online — ảnh thành XLSX CSV | OneTool",
      desc: "OCR bảng tiếng Việt: chụp bảng, biên lai, screenshot → chỉnh sửa → tải Excel/CSV. Miễn phí trên trình duyệt."
    },
    "word-counter": {
      title: "Đếm từ online miễn phí — Word Counter tiếng Việt | OneTool",
      desc: "Đếm từ online tiếng Việt: từ, ký tự, câu, đoạn, thời gian đọc, mật độ từ khóa. Dán text hoặc mở file TXT."
    },
    "pdf-merge": {
      title: "Gộp PDF online miễn phí — ghép nhiều file PDF | OneTool",
      desc: "Gộp PDF online: ghép nhiều file PDF thành một tài liệu, sắp xếp thứ tự rồi tải về. Miễn phí."
    },
    "pdf-split": {
      title: "Tách PDF online miễn phí — cắt theo trang hoặc khoảng | OneTool",
      desc: "Tách PDF online: cắt theo trang hoặc khoảng (ví dụ 1-3,5). Tải file mới ngay — miễn phí trên trình duyệt."
    },
    "pdf-compress": {
      title: "Nén PDF online miễn phí — giảm dung lượng PDF | OneTool",
      desc: "Nén PDF online để gửi email, Zalo hoặc nộp hồ sơ. Xem phần trăm tiết kiệm rồi tải file nhẹ hơn — miễn phí."
    },
    "pdf-pages": {
      title: "Xoay và xóa trang PDF online miễn phí | OneTool",
      desc: "Xoay trang PDF 90°/180°/270° hoặc xóa trang không cần. Thao tác trên trình duyệt — miễn phí."
    },
    "pdf-convert": {
      title: "PDF sang TXT online miễn phí — trích chữ + OCR | OneTool",
      desc: "PDF sang TXT online: trích chữ từ PDF, OCR bản scan tiếng Việt. Xuất văn bản để copy hoặc tìm kiếm — miễn phí."
    },
    "image-pdf": {
      title: "Ảnh ↔ PDF online — ảnh sang PDF và PDF sang ảnh | OneTool",
      desc: "Ảnh ↔ PDF online: ghép ảnh thành PDF hoặc xuất PDF ra PNG/JPG/WebP. Miễn phí trên trình duyệt."
    },
    "image-to-pdf": {
      title: "Ảnh sang PDF online miễn phí — JPG PNG WebP thành PDF | OneTool",
      desc: "Ảnh sang PDF online: ghép một hoặc nhiều ảnh JPG/PNG/WebP thành PDF. Chọn khổ trang, sắp xếp — miễn phí."
    },
    "pdf-to-image": {
      title: "PDF sang ảnh online — xuất PNG JPG WebP từng trang | OneTool",
      desc: "PDF sang ảnh online: xuất từng trang PDF ra PNG, JPG hoặc WebP. Xem trước, tải ZIP — miễn phí."
    },
    "pdf-to-word": {
      title: "PDF sang Word online miễn phí — chuyển PDF thành DOCX | OneTool",
      desc: "PDF sang Word online: convert PDF → DOCX chỉnh sửa được, hỗ trợ OCR bản scan tiếng Việt. Miễn phí."
    },
    "office-to-pdf": {
      title: "Word Excel sang PDF online miễn phí — DOCX XLSX → PDF | OneTool",
      desc: "Convert Word (DOCX) và Excel (XLSX) sang PDF online miễn phí. Nhanh, rõ nội dung — trên trình duyệt."
    },
    "convert-document": {
      title: "PDF sang TXT online — chuyển tới tool OCR | OneTool",
      desc: "Lối tắt mở PDF sang TXT (có OCR). Dùng tool PDF chuyên dụng trên OneTool."
    },
    "convert-data": {
      title: "CSV to JSON online miễn phí — JSON sang CSV | OneTool",
      desc: "CSV to JSON / JSON to CSV online. Dán dữ liệu hoặc mở file, tải kết quả — miễn phí trên trình duyệt."
    },
    "excel-convert": {
      title: "Excel sang CSV JSON online miễn phí — XLSX ↔ CSV ↔ JSON | OneTool",
      desc: "Đổi Excel (.xlsx/.xls) ↔ CSV ↔ JSON online. Chọn sheet, xem trước bảng, tải file — miễn phí."
    },
    "qr-generator": {
      title: "Tạo mã QR online miễn phí — URL, văn bản, tải PNG | OneTool",
      desc: "Tạo mã QR online từ link hoặc văn bản, xem trước và tải PNG để in. Miễn phí trên trình duyệt."
    },
    "password-generator": {
      title: "Tạo mật khẩu online miễn phí — Password Generator mạnh | OneTool",
      desc: "Tạo mật khẩu online mạnh ngẫu nhiên (crypto). Chữ hoa, số, ký tự đặc biệt, đo độ mạnh — miễn phí."
    },
    "text-convert": {
      title: "Chuyển đổi chữ online — hoa thường, bỏ dấu tiếng Việt | OneTool",
      desc: "Chuyển đổi chữ online: viết hoa/thường, Title Case, bỏ dấu tiếng Việt, slug URL, tìm thay — miễn phí."
    },
    "unit-convert": {
      title: "Chuyển đổi đơn vị online — kg, mét, °C, MB | OneTool",
      desc: "Bộ đổi đơn vị online: khối lượng, chiều dài, nhiệt độ, dung lượng và nhiều nhóm. Hệ số SI/NIST chuẩn — miễn phí."
    },
    "unit-mass": {
      title: "Đổi khối lượng online — kg · lb · g | OneTool",
      desc: "Đổi khối lượng online (kg · lb · g). Hệ số SI/NIST chuẩn — miễn phí trên trình duyệt."
    },
    "unit-length": {
      title: "Đổi chiều dài online — m · ft · inch | OneTool",
      desc: "Đổi chiều dài online (m · ft · inch). Hệ số SI/NIST chuẩn — miễn phí trên trình duyệt."
    },
    "unit-area": {
      title: "Đổi diện tích online — m² · ha · acre | OneTool",
      desc: "Đổi diện tích online (m² · ha · acre). Hệ số SI/NIST chuẩn — miễn phí trên trình duyệt."
    },
    "unit-volume": {
      title: "Đổi thể tích online — L · mL · gallon | OneTool",
      desc: "Đổi thể tích online (L · mL · gallon). Hệ số SI/NIST chuẩn — miễn phí trên trình duyệt."
    },
    "unit-temp": {
      title: "Đổi nhiệt độ online — °C · °F · K | OneTool",
      desc: "Đổi nhiệt độ online (°C · °F · K). Hệ số SI/NIST chuẩn — miễn phí trên trình duyệt."
    },
    "unit-speed": {
      title: "Đổi tốc độ online — km/h · mph | OneTool",
      desc: "Đổi tốc độ online (km/h · mph). Hệ số SI/NIST chuẩn — miễn phí trên trình duyệt."
    },
    "unit-time": {
      title: "Đổi thời gian online — giờ · phút · giây | OneTool",
      desc: "Đổi thời gian online (giờ · phút · giây). Hệ số SI/NIST chuẩn — miễn phí trên trình duyệt."
    },
    "unit-data": {
      title: "Đổi dung lượng online — MB · GiB | OneTool",
      desc: "Đổi dung lượng online (MB · GiB). Hệ số SI/NIST chuẩn — miễn phí trên trình duyệt."
    },
    "unit-energy": {
      title: "Đổi năng lượng online — J · kWh · cal | OneTool",
      desc: "Đổi năng lượng online (J · kWh · cal). Hệ số SI/NIST chuẩn — miễn phí trên trình duyệt."
    },
    "unit-pressure": {
      title: "Đổi áp suất online — Pa · bar · atm | OneTool",
      desc: "Đổi áp suất online (Pa · bar · atm). Hệ số SI/NIST chuẩn — miễn phí trên trình duyệt."
    },
    "unit-power": {
      title: "Đổi công suất online — W · kW · HP | OneTool",
      desc: "Đổi công suất online (W · kW · HP). Hệ số SI/NIST chuẩn — miễn phí trên trình duyệt."
    },
    "unit-angle": {
      title: "Đổi góc online — độ · radian | OneTool",
      desc: "Đổi góc online (độ · radian). Hệ số SI/NIST chuẩn — miễn phí trên trình duyệt."
    },
    "unit-fuel": {
      title: "Đổi tiêu hao nhiên liệu online — L/100km · mpg | OneTool",
      desc: "Đổi tiêu hao nhiên liệu online (L/100km · mpg). Hệ số SI/NIST chuẩn — miễn phí trên trình duyệt."
    },
    "json-tools": {
      title: "Format JSON online miễn phí — làm đẹp, minify, kiểm tra | OneTool",
      desc: "Format JSON online: làm đẹp, minify và kiểm tra JSON hợp lệ. Miễn phí trên trình duyệt."
    },
    "base64-tools": {
      title: "Encode Decode Base64 online — UTF-8 tiếng Việt, file, ảnh | OneTool",
      desc: "Encode/decode Base64 UTF-8 online: tiếng Việt có dấu, URL-safe, file và ảnh. Miễn phí trên trình duyệt."
    },
    "developer-tools": {
      title: "UUID Hash Slugify online — SHA-256, timestamp tiếng Việt | OneTool",
      desc: "Tạo UUID v4, hash SHA-256/384/512, slugify tiếng Việt, Unix timestamp online — miễn phí."
    }
  },

  seo: {
    "remove-background": {
      keywords: "xóa nền ảnh, xóa nền ảnh online, remove background, png trong suốt, tách nền ảnh miễn phí",
      howto: [
        "Tải ảnh chân dung hoặc sản phẩm (JPG, PNG, WebP).",
        "Bấm Xóa nền — AI tách chủ thể khỏi phông.",
        "Xem preview rồi tải PNG trong suốt về máy."
      ],
      sections: [
        {
          title: "Xóa nền ảnh online là gì?",
          paras: [
            "**Xóa nền ảnh** (remove background) tách người hoặc sản phẩm khỏi phông, giữ chủ thể trên nền trong suốt. Kết quả thường là **PNG**, dễ ghép banner, Shopee, Canva hay ảnh thẻ."
          ]
        },
        {
          title: "Cách xóa nền ảnh miễn phí trên OneTool",
          paras: [
            "Thả ảnh vào khung, bấm **Xóa nền**, xem preview rồi chọn **Tải PNG**. Hỗ trợ JPG, PNG, WebP. Ảnh sản phẩm nền sạch và chân dung tách phông rõ cho viền đẹp hơn."
          ]
        },
        {
          title: "Khi nào nên xóa nền ảnh",
          paras: ["Một số tình huống phổ biến:"],
          list: [
            { title: "Ảnh bán hàng", text: "đặt sản phẩm lên nền trắng hoặc banner khuyến mãi." },
            { title: "Ảnh thẻ / CV", text: "tách người khỏi phông rồi ghép nền đồng phục." },
            { title: "Thiết kế social", text: "xuất PNG trong suốt để chồng chữ lên Shorts hoặc Reels." }
          ]
        }
      ]
    },
    "image-convert": {
      keywords: "đổi ảnh jpg png webp, convert ảnh online, chuyển định dạng ảnh",
      howto: [
        "Kéo thả ảnh cần đổi định dạng.",
        "Chọn format đích (JPG, PNG, WebP…).",
        "Tải file mới về máy."
      ],
      sections: [
        {
          title: "Convert ảnh là gì?",
          paras: [
            "**Convert ảnh** là đổi định dạng file hình — ví dụ JPG sang PNG, PNG sang WebP — để phù hợp website, in ấn hoặc gửi email. Mỗi format có ưu điểm riêng về dung lượng và nền trong suốt."
          ]
        },
        {
          title: "Cách đổi định dạng ảnh online",
          paras: [
            "Thả ảnh vào OneTool, chọn định dạng đích rồi bấm chuyển đổi. Tool ẩn format trùng với file gốc để tránh thao tác thừa. Kết quả tải về ngay, không cần đăng nhập."
          ]
        },
        {
          title: "Nên chọn JPG, PNG hay WebP?",
          paras: ["Gợi ý nhanh:"],
          list: [
            { title: "JPG", text: "ảnh chụp, banner — dung lượng nhẹ." },
            { title: "PNG", text: "logo, icon — giữ nét và nền trong suốt." },
            { title: "WebP", text: "website hiện đại — cân bằng chất lượng và tốc độ tải." }
          ]
        }
      ]
    },
    "image-resize": {
      keywords: "resize ảnh, đổi kích thước ảnh, thu nhỏ ảnh theo pixel",
      howto: [
        "Tải ảnh gốc lên.",
        "Nhập chiều rộng/cao hoặc chọn preset.",
        "Xem trước và tải ảnh đã resize."
      ],
      sections: [
        {
          title: "Resize ảnh là gì?",
          paras: [
            "**Resize ảnh** là đổi số pixel theo chiều rộng và chiều cao — dùng cho avatar, ảnh bìa, banner web hoặc ảnh thẻ khi nền tảng yêu cầu kích thước cố định."
          ]
        },
        {
          title: "Cách đổi kích thước ảnh online",
          paras: [
            "Upload ảnh, nhập kích thước mới hoặc chọn preset, giữ tỉ lệ khung hình nếu không muốn ảnh bị méo, rồi tải kết quả."
          ]
        },
        {
          title: "Các kích thước hay dùng",
          list: [
            { title: "Avatar", text: "vuông 400×400 hoặc 512×512." },
            { title: "Banner web", text: "chiều rộng theo layout, ví dụ 1920 px." },
            { title: "Xuất WebP/JPG", text: "chọn định dạng nhẹ hơn khi tải về." }
          ]
        }
      ]
    },
    "image-compress": {
      keywords: "nén ảnh, compress image, giảm dung lượng ảnh, nén jpg webp",
      howto: [
        "Tải ảnh JPG, PNG hoặc WebP lên.",
        "Chọn mức nén (Cân bằng / Mạnh) hoặc tùy chỉnh chất lượng.",
        "Xem % tiết kiệm, so sánh trước/sau rồi tải ảnh đã nén."
      ],
      sections: [
        {
          title: "Nén ảnh là gì?",
          paras: [
            "**Nén ảnh (Compress Image)** giảm dung lượng file để gửi email, đăng web hoặc chat — vẫn giữ độ nét chấp nhận được bằng cách chọn chất lượng JPG/WebP và (tuỳ chọn) thu nhỏ cạnh dài."
          ]
        },
        {
          title: "Cách nén ảnh online miễn phí",
          paras: [
            "Upload ảnh, chọn mức **Cân bằng** (khuyến nghị) hoặc **Mạnh**, xem vòng % tiết kiệm và so sánh ảnh gốc với kết quả, rồi tải về. Toàn bộ xử lý trên trình duyệt — file không upload server."
          ]
        },
        {
          title: "Nên chọn mức nào?",
          list: [
            { title: "Nhẹ", text: "ảnh in ấn hoặc khi cần giữ chi tiết cao." },
            { title: "Cân bằng", text: "website, mạng xã hội, gửi Zalo/email." },
            { title: "Mạnh / Siêu nhỏ", text: "form upload giới hạn MB hoặc ảnh thumbnail." }
          ]
        }
      ]
    },
    "image-batch": {
      keywords: "xử lý nhiều ảnh, batch convert resize nén ảnh",
      howto: [
        "Chọn nhiều ảnh cùng lúc.",
        "Chọn thao tác convert, resize hoặc nén.",
        "Tải kết quả từng file hoặc cả bộ."
      ],
      sections: [
        {
          title: "Batch ảnh là gì?",
          paras: [
            "**Batch Processing** xử lý hàng loạt ảnh cùng một thao tác — đổi định dạng, resize hoặc nén — thay vì mở từng file."
          ]
        },
        {
          title: "Cách xử lý nhiều ảnh cùng lúc",
          paras: [
            "Chọn cả thư mục ảnh, chọn loại thao tác, chạy một lần rồi tải kết quả. Phù hợp catalog sản phẩm hoặc album sự kiện."
          ]
        },
        {
          title: "Ứng dụng thực tế",
          list: [
            { title: "Shop online", text: "đưa ảnh về cùng kích thước và WebP trước khi đăng." },
            { title: "Ảnh sự kiện", text: "nén hàng loạt để gửi khách nhanh." }
          ]
        }
      ]
    },
    "tiktok-download": {
      keywords: "tải tiktok không logo, tải video tiktok không watermark, tiktok download hd, tải mp4 tiktok miễn phí",
      howto: [
        "Mở TikTok → Chia sẻ → Sao chép liên kết.",
        "Dán link vào OneTool và bấm Lấy video.",
        "Chọn MP4 HD · Không logo để tải về máy."
      ],
      sections: [
        {
          title: "Tải TikTok không logo là gì?",
          paras: [
            "**Tải TikTok không logo** lấy file MP4 từ link công khai — **không dính watermark TikTok**, ưu tiên HD. Có thể tải MP3 hoặc ảnh slideshow."
          ]
        },
        {
          title: "Cách tải video TikTok không logo",
          paras: [
            "Sao chép liên kết video → dán vào ô Link → bấm **Lấy video** → chọn **MP4 HD · Không logo**. Hỗ trợ tiktok.com, vt.tiktok.com và vm.tiktok.com."
          ]
        },
        {
          title: "Lưu ý khi tải TikTok",
          list: [
            { title: "Quyền sử dụng", text: "chỉ tải nội dung bạn có quyền (video của bạn / được phép)." },
            { title: "Video riêng tư", text: "link private hoặc hết hạn có thể không lấy được." },
            { title: "Xử lý đám mây", text: "tool gửi link tới dịch vụ để lấy file — không lưu video lâu dài trên OneTool." }
          ]
        }
      ]
    },
    "audio-to-text": {
      keywords: "audio to text tiếng việt, chuyển giọng nói thành văn bản, phụ đề srt, speech to text",
      howto: [
        "Thả file MP3, WAV, M4A hoặc video MP4/MOV.",
        "Chọn tiếng Việt (hoặc tự nhận diện) rồi bấm Nhận dạng.",
        "Sao chép văn bản, tải TXT hoặc phụ đề SRT."
      ],
      sections: [
        {
          title: "Audio to Text tiếng Việt là gì?",
          paras: [
            "**Audio to Text** chuyển giọng nói thành văn bản từ file ghi âm hoặc video. OneTool nhận diện **tiếng Việt**, xuất **TXT** để sửa bài và **SRT** để gắn phụ đề."
          ]
        },
        {
          title: "Cách chuyển giọng nói thành văn bản",
          paras: [
            "Thả MP3, WAV, M4A hoặc MP4, chọn ngôn ngữ **Tiếng Việt**, bấm **Nhận dạng**. Khi xong, sao chép nội dung hoặc tải TXT / SRT. File được xử lý đám mây tạm thời để nhận diện giọng nói."
          ]
        },
        {
          title: "Dùng bản ghi để làm gì",
          list: [
            { title: "Phụ đề video", text: "gắn SRT vào CapCut, Premiere hoặc YouTube." },
            { title: "Biên bản họp", text: "sửa chính tả rồi gửi team." },
            { title: "Podcast / phỏng vấn", text: "lấy quote và viết bài từ bản ghi." }
          ]
        }
      ]
    },
    "ai-summarize": {
      keywords: "tóm tắt ai, tóm tắt văn bản, summarize text vietnamese, tldr online, rút gọn bài viết",
      howto: [
        "Dán văn bản hoặc mở file .txt/.md.",
        "Chọn độ dài, định dạng, ngôn ngữ và trọng tâm.",
        "Bấm Tóm tắt bằng AI — sao chép hoặc tải TXT/MD."
      ],
      sections: [
        {
          title: "Tóm tắt AI là gì?",
          paras: [
            "**Tóm tắt AI** giúp rút gọn bài viết, biên bản họp, email dài hoặc tài liệu học tập thành ý chính. OneTool hỗ trợ tiếng Việt, xuất dạng đoạn văn, gạch đầu dòng hoặc TL;DR + điểm chính."
          ]
        },
        {
          title: "Cách tóm tắt văn bản online",
          paras: [
            "Dán nội dung vào ô nguồn (hoặc mở file), chọn độ dài và định dạng, bấm **Tóm tắt bằng AI**. Khi xong, sao chép kết quả hoặc tải file TXT/Markdown."
          ]
        },
        {
          title: "Khi nào nên dùng",
          list: [
            { title: "Đọc nhanh", text: "bài báo / newsletter dài trước khi đọc kỹ." },
            { title: "Họp hành", text: "rút việc cần làm từ biên bản." },
            { title: "Học tập", text: "tóm khái niệm then chốt để ôn." }
          ]
        }
      ]
    },
    "video-convert": {
      keywords: "nén video online, convert video mp4, video sang mp3, nén mp4 miễn phí, đổi webm",
      howto: [
        "Thả file video (MP4, MOV, MKV, WebM…).",
        "Chọn chế độ: nén MP4, WebM hoặc tách MP3.",
        "Chọn độ phân giải tối đa nếu cần.",
        "Bấm xử lý và tải file kết quả."
      ],
      sections: [
        {
          title: "Nén / convert video là gì?",
          paras: [
            "Công cụ **nén và chuyển đổi video** giúp giảm dung lượng MP4, đổi sang WebM hoặc **tách audio MP3** từ clip. Toàn bộ xử lý chạy trên trình duyệt — file không upload lên server."
          ]
        },
        {
          title: "Cách nén video MP4 online",
          paras: [
            "Thả video vào khung, chọn **Nén MP4** hoặc **Nén mạnh**, tùy chọn giới hạn 720p/480p để giảm thêm dung lượng, bấm **Xử lý video** rồi tải file mới. So sánh dung lượng trước/sau ngay trên màn hình."
          ]
        },
        {
          title: "Video sang MP3 và WebM",
          paras: [
            "Chọn **Tách MP3** để lấy nhạc/nội dung audio từ video. Chọn **WebM** khi cần định dạng cho web. **MP4 cân bằng** phù hợp khi muốn giữ chất lượng tốt."
          ]
        },
        {
          title: "Lưu ý khi xử lý video",
          list: [
            { title: "Dung lượng", text: "nên dùng file dưới 100 MB để xử lý mượt trên máy yếu." },
            { title: "Lần đầu", text: "trình duyệt tải bộ xử lý (~25 MB) — chờ thêm vài chục giây." },
            { title: "Bảo mật", text: "video xử lý trên máy bạn, không gửi lên server." }
          ]
        }
      ]
    },
    "video-trim": {
      keywords: "cắt video online, trim video, crop thời gian video, cắt mp4, cắt đoạn video miễn phí",
      howto: [
        "Thả video (MP4, MOV, WebM, MKV).",
        "Kéo thanh start–end hoặc nhập giây / mm:ss.",
        "Chọn Copy nhanh hoặc Encode chính xác; tùy chọn tắt tiếng.",
        "Bấm Cắt video rồi tải file kết quả."
      ],
      sections: [
        {
          title: "Cắt video theo thời gian là gì?",
          paras: [
            "Công cụ **Video Trim** giúp bạn chọn đoạn start–end rồi xuất clip mới — không cần phần mềm cài đặt. Toàn bộ chạy trên trình duyệt, file không upload server."
          ]
        },
        {
          title: "Copy nhanh hay encode chính xác?",
          list: [
            { title: "Nhanh (stream copy)", text: "giữ codec gốc, rất nhanh; điểm cắt có thể lệch nhẹ theo keyframe." },
            { title: "Chính xác (re-encode)", text: "libx264 + AAC, cắt đúng khung hình hơn, mất thêm thời gian xử lý." }
          ]
        },
        {
          title: "Mẹo dùng",
          list: [
            { title: "Đặt mốc", text: "phát video rồi bấm Đặt start / Đặt end tại vị trí hiện tại." },
            { title: "Xem đoạn", text: "dùng Phát đoạn chọn để nghe/xem trước khi cắt." },
            { title: "Tắt tiếng", text: "tick Tắt tiếng nếu chỉ cần hình, bỏ audio." }
          ]
        }
      ]
    },
    "heic-convert": {
      keywords: "heic sang jpg, convert heic, heif to jpg, đổi ảnh iphone sang jpg, heic to png",
      howto: [
        "Thả một hoặc nhiều file HEIC/HEIF (ảnh iPhone).",
        "Chọn JPG, PNG hoặc WebP và chỉnh chất lượng.",
        "Bấm Convert — tải từng file hoặc ZIP cả bộ."
      ],
      sections: [
        {
          title: "HEIC là gì?",
          paras: [
            "**HEIC/HEIF** là định dạng ảnh mặc định trên iPhone — nhỏ hơn JPG nhưng nhiều máy Windows/web không mở được. OneTool đổi sang JPG/PNG/WebP ngay trên trình duyệt."
          ]
        },
        {
          title: "Khi nào nên dùng",
          list: [
            { title: "Gửi ảnh cho khách", text: "JPG mở được mọi nơi." },
            { title: "Đăng web / Zalo", text: "WebP hoặc JPG nhẹ hơn HEIC gốc khi chia sẻ." },
            { title: "Giữ trong suốt", text: "chọn PNG nếu cần nền trong suốt." }
          ]
        }
      ]
    },
    "pdf-watermark": {
      keywords: "watermark pdf, đóng dấu pdf, thêm logo pdf, watermark chữ pdf online",
      howto: [
        "Upload file PDF.",
        "Chọn watermark chữ hoặc ảnh logo.",
        "Chỉnh độ mờ, góc, vị trí / lặp ô, khoảng trang.",
        "Bấm Đóng dấu rồi tải PDF mới."
      ],
      sections: [
        {
          title: "Watermark PDF là gì?",
          paras: [
            "Thêm lớp chữ hoặc logo bán trong suốt lên từng trang PDF — dùng cho bản nháp, bảo mật nhẹ, branding hồ sơ."
          ]
        },
        {
          title: "Tùy chọn hữu ích",
          list: [
            { title: "Lặp ô (tile)", text: "phủ kín trang, khó crop mất dấu." },
            { title: "Khoảng trang", text: "ví dụ 1-3,5 chỉ đóng dấu một số trang." },
            { title: "Logo", text: "PNG trong suốt giữ cạnh mềm đẹp hơn JPG." }
          ]
        }
      ]
    },
    "ocr-table": {
      keywords: "ocr bảng excel, ảnh sang excel, chuyển bảng ảnh thành excel, ocr tiếng việt bảng",
      howto: [
        "Thả ảnh bảng / biên lai hoặc dán (Ctrl+V).",
        "Chọn ngôn ngữ OCR (vie+eng khuyến nghị).",
        "Chỉnh sửa ô trong bảng xem trước.",
        "Tải XLSX hoặc CSV."
      ],
      sections: [
        {
          title: "OCR bảng → Excel là gì?",
          paras: [
            "Công cụ nhận dạng chữ trong ảnh bảng, xếp thành hàng/cột, cho phép sửa rồi xuất **Excel (.xlsx)** hoặc **CSV** — phù hợp biên lai, bảng điểm, screenshot Google Sheets."
          ]
        },
        {
          title: "Mẹo độ chính xác",
          list: [
            { title: "Ảnh rõ", text: "chụp thẳng, đủ sáng, tránh bóng." },
            { title: "Cột đều", text: "bảng có đường kẻ hoặc khoảng cách đều sẽ OCR tốt hơn." },
            { title: "Sửa tay", text: "luôn xem lại vài ô số quan trọng trước khi xuất." }
          ]
        }
      ]
    },
    "word-counter": {
      keywords: "đếm từ online, word counter tiếng việt, đếm ký tự, thời gian đọc bài viết",
      howto: [
        "Dán văn bản hoặc mở file TXT.",
        "Xem ngay số từ, ký tự, câu, đoạn.",
        "Theo dõi thời gian đọc và mật độ từ khóa."
      ],
      sections: [
        {
          title: "Đếm từ tiếng Việt",
          paras: [
            "OneTool đếm theo token tách khoảng trắng — phù hợp tiếng Việt (mỗi tiếng một đơn vị). Có thêm thời gian đọc ước tính ~200 từ/phút."
          ]
        },
        {
          title: "Dùng để làm gì?",
          list: [
            { title: "SEO / content", text: "theo dõi độ dài bài và từ khóa." },
            { title: "Bài luận", text: "kiểm tra giới hạn từ." },
            { title: "Thuyết trình", text: "ước lượng thời gian nói." }
          ]
        }
      ]
    },
    "pdf-merge": {
      keywords: "gộp pdf online, ghép pdf, merge pdf, gộp nhiều file pdf miễn phí",
      howto: [
        "Chọn từ 2 file PDF trở lên (kéo thả hoặc chọn từ máy).",
        "Sắp xếp thứ tự file nếu cần.",
        "Bấm Gộp PDF rồi tải tài liệu đã ghép."
      ],
      sections: [
        {
          title: "Gộp PDF online là gì?",
          paras: [
            "**Gộp PDF online** (merge PDF) ghép nhiều file thành một — ví dụ CV kèm chứng chỉ, hợp đồng kèm phụ lục — để nộp hoặc gửi một lần."
          ]
        },
        {
          title: "Cách gộp nhiều PDF miễn phí",
          paras: [
            "Chọn ít nhất hai file PDF, kéo để sắp thứ tự, bấm **Gộp PDF** rồi tải kết quả. Xử lý trên trình duyệt — không cần cài phần mềm, không bắt buộc đăng nhập."
          ]
        },
        {
          title: "Khi nào nên gộp PDF",
          list: [
            { title: "Hồ sơ xin việc", text: "ghép CV, cover letter và bằng cấp." },
            { title: "Hợp đồng", text: "gộp bản chính với phụ lục bàn giao." },
            { title: "Bài tập / báo cáo", text: "gom nhiều PDF scan thành một file nộp." }
          ]
        }
      ]
    },
    "pdf-split": {
      keywords: "tách pdf, cắt pdf theo trang, split pdf online",
      howto: [
        "Tải file PDF lên.",
        "Nhập trang hoặc khoảng trang cần tách.",
        "Tải phần PDF đã cắt."
      ],
      sections: [
        {
          title: "Tách PDF là gì?",
          paras: [
            "**Tách PDF** lấy một hoặc vài trang ra file riêng — gửi đúng phần cần thiết, hoặc chia tài liệu dài thành chương nhỏ."
          ]
        },
        {
          title: "Cách cắt PDF theo trang",
          paras: [
            "Upload file, nhập khoảng trang (ví dụ **1-3, 8**), chạy tách rồi tải kết quả. Số trang tính từ trang đầu trong file."
          ]
        },
        {
          title: "Khi nào nên tách PDF",
          list: [
            { title: "Gửi đúng trang", text: "chỉ gửi điều khoản, không lộ cả hợp đồng." },
            { title: "Đọc trên điện thoại", text: "chia sách scan thành file nhẹ hơn." }
          ]
        }
      ]
    },
    "pdf-compress": {
      keywords: "nén pdf online, giảm dung lượng pdf, compress pdf miễn phí",
      howto: [
        "Tải file PDF cần giảm dung lượng.",
        "Chọn mức nén và chạy — xem phần trăm tiết kiệm.",
        "Tải bản PDF nhẹ hơn về máy."
      ],
      sections: [
        {
          title: "Nén PDF online là gì?",
          paras: [
            "**Nén PDF online** giảm dung lượng để gửi email, Zalo hoặc nộp cổng có giới hạn MB. File scan/ảnh thường nhẹ đi rõ hơn PDF toàn chữ."
          ]
        },
        {
          title: "Cách nén PDF miễn phí",
          paras: [
            "Thả file vào OneTool, chọn mức nén, xem % đã giảm rồi tải về. Giữ bản gốc nếu còn cần chất lượng in cao. Xử lý trên trình duyệt."
          ]
        },
        {
          title: "Khi nào nên nén PDF",
          list: [
            { title: "Nộp hồ sơ", text: "nhiều cổng giới hạn 5–10 MB." },
            { title: "Scan điện thoại", text: "PDF ảnh chụp thường nhẹ hơn rõ sau khi nén." },
            { title: "Gửi Zalo / email", text: "tránh file quá nặng bị chặn." }
          ]
        }
      ]
    },
    "pdf-pages": {
      keywords: "xoay trang pdf, xóa trang pdf online",
      howto: [
        "Mở file PDF.",
        "Chọn trang cần xoay hoặc xóa.",
        "Tải file đã chỉnh."
      ],
      sections: [
        {
          title: "Xoay và xóa trang PDF",
          paras: [
            "Công cụ giúp **xoay trang** 90°/180°/270° khi scan bị ngược, hoặc **xóa trang** trắng / trang nhầm trước khi gửi."
          ]
        },
        {
          title: "Cách chỉnh trang PDF online",
          paras: [
            "Upload PDF, chọn trang cần xoay hoặc xóa, xuất file mới. Nên giữ bản gốc trên máy nếu còn cần các trang đã xóa."
          ]
        }
      ]
    },
    "pdf-convert": {
      keywords: "pdf sang txt, ocr pdf, convert pdf text",
      howto: [
        "Tải PDF lên.",
        "Chọn xuất TXT (OCR nếu scan).",
        "Tải kết quả."
      ],
      sections: [
        {
          title: "Convert PDF sang TXT là gì?",
          paras: [
            "**Convert PDF → TXT** trích chữ để copy hoặc tìm kiếm. PDF scan dùng OCR. Muốn xuất **ảnh từng trang**, dùng tool **PDF → Ảnh**."
          ]
        },
        {
          title: "Cách chuyển PDF sang text",
          paras: [
            "Chọn file, chạy xuất TXT. PDF từ Word thường lấy chữ tốt; PDF scan ảnh sẽ OCR tự động."
          ]
        }
      ]
    },
    "image-pdf": {
      keywords: "ảnh sang pdf, pdf sang ảnh, image to pdf, pdf to image",
      howto: [
        "Chọn hướng: Ảnh → PDF hoặc PDF → Ảnh.",
        "Upload file và chỉnh tùy chọn.",
        "Tải kết quả."
      ],
      sections: [
        {
          title: "Ảnh ↔ PDF là gì?",
          paras: [
            "Hub gom hai nhu cầu phổ biến: **ghép ảnh thành PDF** (hồ sơ, scan điện thoại) và **xuất PDF ra ảnh** (PNG/JPG/WebP) để đăng web hoặc chỉnh sửa."
          ]
        },
        {
          title: "Chọn đúng hướng",
          list: [
            { title: "Ảnh → PDF", text: "nhiều JPG/PNG thành một file gửi email hoặc in." },
            { title: "PDF → Ảnh", text: "từng trang ra PNG/JPG/WebP hoặc ZIP." }
          ]
        }
      ]
    },
    "image-to-pdf": {
      keywords: "ảnh sang pdf, jpg to pdf, png to pdf, ghép ảnh thành pdf",
      howto: [
        "Thêm một hoặc nhiều ảnh.",
        "Sắp xếp thứ tự trang, chọn khổ Fit/A4/Letter.",
        "Tạo PDF và tải về."
      ],
      sections: [
        {
          title: "Ảnh sang PDF là gì?",
          paras: [
            "**Ảnh → PDF** ghép JPG, PNG, WebP (và định dạng phổ biến khác) thành một tài liệu PDF — mỗi ảnh một trang, có thể sắp xếp lại trước khi xuất."
          ]
        },
        {
          title: "Khổ trang nào nên chọn?",
          list: [
            { title: "Vừa ảnh (Fit)", text: "giữ đúng kích thước pixel — tốt cho scan điện thoại." },
            { title: "A4 / Letter", text: "căn giữa trong khổ chuẩn để in ấn." }
          ]
        }
      ]
    },
    "pdf-to-image": {
      keywords: "pdf sang ảnh, pdf to png, pdf to jpg, xuất trang pdf",
      howto: [
        "Upload PDF.",
        "Chọn PNG/JPG/WebP và độ nét.",
        "Xuất — tải từng trang hoặc ZIP."
      ],
      sections: [
        {
          title: "PDF sang ảnh là gì?",
          paras: [
            "**PDF → Ảnh** render từng trang thành PNG, JPG hoặc WebP. Phù hợp thumbnail, đăng social, hoặc chỉnh trong Photoshop/Canva."
          ]
        },
        {
          title: "Mẹo xuất đẹp",
          list: [
            { title: "PNG", text: "nét, chữ sắc — file lớn hơn." },
            { title: "JPG / WebP", text: "nhẹ hơn cho ảnh chụp / đăng web." },
            { title: "Độ nét 2×", text: "cân bằng rõ và dung lượng (khuyến nghị)." }
          ]
        }
      ]
    },
    "pdf-to-word": {
      keywords: "pdf to word, pdf sang word, convert pdf to word, pdf to docx, chuyển pdf thành word online miễn phí",
      howto: [
        "Thả hoặc chọn file PDF.",
        "Chọn chế độ OCR (tự động khuyến nghị).",
        "Bấm chuyển sang Word và tải file .docx."
      ],
      sections: [
        {
          title: "PDF sang Word là gì?",
          paras: [
            "**PDF → Word** chuyển tài liệu PDF thành file **DOCX** có thể chỉnh sửa trong Microsoft Word hoặc Google Docs. OneTool giữ cấu trúc đoạn văn và nhận diện tiêu đề theo cỡ chữ."
          ]
        },
        {
          title: "Cách chuyển PDF sang Word online",
          paras: [
            "Upload PDF, chọn OCR tự động nếu là bản scan, bấm chuyển đổi rồi tải DOCX. Toàn bộ xử lý chạy trên trình duyệt — file không gửi lên server."
          ]
        },
        {
          title: "Khi nào nên dùng OCR?",
          list: [
            { title: "PDF từ Word/Excel", text: "thường đủ lớp chữ — OCR tắt hoặc tự động là đủ." },
            { title: "PDF scan / ảnh chụp", text: "bật OCR (tiếng Việt + Anh) để đọc chữ trong ảnh." },
            { title: "Bảng phức tạp / layout thiết kế", text: "chữ vẫn lấy được nhưng bố cục có thể khác bản gốc." }
          ]
        }
      ]
    },
    "office-to-pdf": {
      keywords: "word to pdf, excel to pdf, convert docx to pdf, xlsx sang pdf, word sang pdf online miễn phí, excel sang pdf",
      howto: [
        "Thả file Word (.docx) hoặc Excel (.xlsx).",
        "Chọn khổ giấy A4 và hướng trang (hoặc để tự động).",
        "Bấm chuyển sang PDF và tải về."
      ],
      sections: [
        {
          title: "Word/Excel sang PDF là gì?",
          paras: [
            "**Word/Excel → PDF** giúp **convert DOCX hoặc XLSX sang PDF** để gửi email, nộp hồ sơ hoặc in ấn — nội dung cố định, mở được mọi máy."
          ]
        },
        {
          title: "Cách convert Word Excel to PDF online",
          paras: [
            "Chọn file .docx hoặc .xlsx, chọn khổ A4 (khuyến nghị), bấm chuyển đổi rồi tải PDF. Toàn bộ chạy trên trình duyệt — file không upload server."
          ]
        },
        {
          title: "Mẹo dùng nhanh",
          list: [
            { title: "Word (.docx)", text: "giữ tiêu đề, đoạn văn và bảng cơ bản tốt nhất." },
            { title: "Excel (.xlsx)", text: "mặc định xoay ngang (landscape) để bảng rộng dễ đọc." },
            { title: "File .doc cũ", text: "mở Word → Lưu thành .docx rồi convert." }
          ]
        }
      ]
    },
    "convert-document": {
      keywords: "pdf sang txt, convert document online",
      howto: [
        "Mở Convert PDF (TXT + OCR).",
        "Upload PDF và chạy chuyển đổi.",
        "Tải hoặc sao chép văn bản."
      ],
      sections: [
        {
          title: "Convert Document",
          paras: [
            "Trang này dẫn tới **Convert PDF · Sang TXT (OCR)** — trích chữ từ PDF chữ thường và bản scan trên trình duyệt."
          ]
        }
      ]
    },
    "convert-image": {
      keywords: "convert image, đổi định dạng ảnh",
      howto: [
        "Mở Convert ảnh.",
        "Thả ảnh và chọn định dạng đích.",
        "Tải file mới."
      ],
      sections: [
        {
          title: "Convert Image",
          paras: [
            "Trang này dẫn tới **Convert ảnh** — đổi JPG, PNG, WebP và các định dạng phổ biến trên trình duyệt. Cùng một tool với mục Công cụ Ảnh."
          ]
        },
        {
          title: "Tiếp theo sau khi đổi format",
          list: [
            { title: "Resize ảnh", text: "đưa về đúng kích thước layout." },
            { title: "Xóa nền ảnh", text: "tách chủ thể, xuất PNG trong suốt." }
          ]
        }
      ]
    },
    "convert-data": {
      keywords: "csv sang json, json sang csv, convert data",
      howto: [
        "Dán hoặc mở file CSV/JSON.",
        "Chọn chiều chuyển đổi.",
        "Sao chép hoặc tải kết quả."
      ],
      sections: [
        {
          title: "Convert Data là gì?",
          paras: [
            "Đổi **CSV ↔ JSON** khi làm việc với spreadsheet, API hoặc import dữ liệu vào ứng dụng."
          ]
        },
        {
          title: "Cách chuyển CSV sang JSON",
          paras: [
            "Dán nội dung hoặc mở file, chọn chiều chuyển, sao chép kết quả. Ô CSV có dấu phẩy nên được bọc dấu ngoặc kép theo chuẩn."
          ]
        },
        {
          title: "Ứng dụng",
          list: [
            { title: "Import API", text: "bảng Excel → CSV → JSON cho frontend." },
            { title: "Báo cáo", text: "JSON hệ thống → CSV để mở Excel." }
          ]
        }
      ]
    },
    "excel-convert": {
      keywords: "excel sang csv, excel sang json, xlsx to csv, csv sang excel, json sang excel, convert excel online",
      howto: [
        "Chọn chiều chuyển (Excel→CSV/JSON hoặc CSV/JSON→Excel).",
        "Tải file .xlsx/.xls/.csv/.json hoặc dán CSV/JSON.",
        "Chọn sheet (nếu Excel nhiều sheet) → Chuyển đổi → Tải file."
      ],
      sections: [
        {
          title: "Excel ↔ CSV/JSON là gì?",
          paras: [
            "Công cụ đổi **file Excel (.xlsx/.xls)** sang **CSV** hoặc **JSON**, và ngược lại — chạy hoàn toàn trên trình duyệt, không upload lên server. Phù hợp khi đưa bảng tính vào API, database hoặc mở dữ liệu JSON trong Excel."
          ]
        },
        {
          title: "Cách convert Excel sang CSV / JSON",
          paras: [
            "Chọn **Excel → CSV** hoặc **Excel → JSON**, kéo thả file XLSX, chọn đúng sheet nếu workbook có nhiều tab, bấm **Chuyển đổi**, rồi **Tải file**. CSV có tùy chọn BOM để Excel mở tiếng Việt không lỗi font."
          ]
        },
        {
          title: "CSV / JSON sang Excel",
          paras: [
            "Chọn **CSV → Excel** hoặc **JSON → Excel**, mở file hoặc dán nội dung. JSON cần là mảng object (mỗi phần tử một dòng). Kết quả là file **.xlsx** mở được trên Microsoft Excel, Google Sheets, LibreOffice."
          ]
        },
        {
          title: "Khi nào nên dùng",
          list: [
            { title: "Làm việc với API", text: "xuất sheet Excel → JSON cho frontend/backend." },
            { title: "Báo cáo", text: "JSON hệ thống → Excel để gửi sếp / kế toán." },
            { title: "Làm sạch dữ liệu", text: "CSV từ hệ thống khác → Excel chỉnh sửa rồi xuất lại." }
          ]
        }
      ]
    },
    "qr-generator": {
      keywords: "tạo mã qr, qr code url, tải qr png",
      howto: [
        "Nhập URL hoặc văn bản.",
        "Bấm tạo mã QR.",
        "Tải PNG để in hoặc chèn vào thiết kế."
      ],
      sections: [
        {
          title: "Mã QR là gì?",
          paras: [
            "**Mã QR** (Quick Response) là mã vạch hai chiều, smartphone quét bằng camera hoặc app như Zalo để mở link, lưu liên hệ hoặc kết nối Wi‑Fi nhanh."
          ]
        },
        {
          title: "Cách tạo mã QR online miễn phí",
          paras: [
            "Nhập nội dung (URL hoặc text), bấm tạo QR, rồi **Tải PNG**. In lên menu, poster, danh thiếp — giữ nền tương phản và không bóp méo mã."
          ]
        },
        {
          title: "Tạo mã QR cho link website",
          paras: [
            "Dán đường dẫn đầy đủ (có https://), tạo QR và kiểm tra bằng điện thoại trước khi in số lượng lớn. Đổi domain sau này sẽ làm link mở sai dù mã vẫn quét được."
          ]
        },
        {
          title: "Các loại nội dung QR phổ biến",
          paras: ["Bạn có thể mã hóa nhiều kiểu chuỗi:"],
          list: [
            { title: "QR link", text: "mở website, form đăng ký, Google Maps." },
            { title: "QR văn bản", text: "ghi chú ngắn, mã khuyến mãi." },
            { title: "QR danh thiếp", text: "dẫn tới LinkedIn, Zalo OA hoặc thông tin liên hệ." },
            { title: "QR sự kiện", text: "in trên poster dẫn tới trang đăng ký." }
          ]
        }
      ]
    },
    "password-generator": {
      keywords: "tạo mật khẩu, password generator, mật khẩu mạnh, random password",
      howto: [
        "Chọn preset hoặc tùy chỉnh độ dài và loại ký tự.",
        "Bấm Tạo mật khẩu mới — xem thanh độ mạnh.",
        "Sao chép và lưu vào trình quản lý mật khẩu."
      ],
      sections: [
        {
          title: "Password Generator là gì?",
          paras: [
            "**Password Generator** tạo mật khẩu ngẫu nhiên mạnh từ chữ hoa/thường, số và ký tự đặc biệt. OneTool dùng **crypto.getRandomValues** — entropy cao, không dùng Math.random()."
          ]
        },
        {
          title: "Mật khẩu mạnh nên có gì?",
          list: [
            { title: "Độ dài", text: "ít nhất 12–16 ký tự (24+ cho tài khoản quan trọng)." },
            { title: "Đa dạng", text: "trộn hoa, thường, số và ký tự đặc biệt." },
            { title: "Không tái sử dụng", text: "mỗi site một mật khẩu — dùng Bitwarden, 1Password…" }
          ]
        },
        {
          title: "An toàn & riêng tư",
          paras: [
            "Mật khẩu được tạo **100% trên trình duyệt** — không gửi server, không lưu log. Sau khi sao chép, đóng tab nếu dùng máy chung."
          ]
        }
      ]
    },
    "text-convert": {
      keywords: "chuyển đổi chữ, viết hoa viết thường, bỏ dấu tiếng việt, slug url, title case online",
      howto: [
        "Dán văn bản hoặc mở file .txt.",
        "Chọn thao tác: hoa/thường, bỏ dấu, slug, dọn dòng, encode…",
        "Sao chép hoặc tải TXT — có thể đưa kết quả xuống nguồn để chuyển tiếp."
      ],
      sections: [
        {
          title: "Chuyển đổi chữ online dùng để làm gì?",
          paras: [
            "**Chuyển đổi chữ** giúp đổi kiểu viết (HOA / thường / Title Case), **bỏ dấu tiếng Việt**, tạo **slug URL**, dọn khoảng trắng và dòng trống, encode URL/HTML hoặc tìm & thay — hữu ích khi làm nội dung web, SEO, CSV và mã nguồn."
          ]
        },
        {
          title: "Bỏ dấu tiếng Việt chính xác",
          paras: [
            "OneTool chuẩn hóa Unicode NFD rồi gỡ dấu kết hợp, xử lý riêng **đ/Đ**. Kết quả phù hợp đặt tên file, slug bài viết hoặc tìm kiếm không dấu."
          ]
        },
        {
          title: "Khi nào nên dùng",
          paras: ["Một số tình huống phổ biến:"],
          list: [
            { title: "SEO / URL", text: "slug tiêu đề tiếng Việt thành dang-thi-hong." },
            { title: "Dữ liệu", text: "đồng bộ hoa thường, xóa dòng trống trước khi import CSV." },
            { title: "Web / code", text: "HTML encode, URL encode hoặc Unicode escape nhanh." }
          ]
        }
      ]
    },
    "unit-convert": {
      keywords: "chuyển đổi đơn vị, đổi kg sang lb, đổi mét sang feet, đổi độ c sang f",
      howto: [
        "Mở hub Chuyển đổi đơn vị và chọn nhóm (khối lượng, chiều dài…).",
        "Hoặc vào thẳng tool: Đổi khối lượng, Đổi nhiệt độ…",
        "Nhập số, chọn đơn vị — kết quả hiện ngay."
      ],
      sections: [
        {
          title: "Chuyển đổi đơn vị là gì?",
          paras: [
            "**Chuyển đổi đơn vị** quy đổi giữa hệ mét (SI) và hệ Anh–Mỹ. OneTool tách từng nhóm thành tool riêng để dễ tìm và SEO rõ ràng."
          ]
        }
      ]
    },
    "unit-mass": {
      keywords: "đổi kg sang lb, đổi khối lượng, kilogram pound",
      howto: ["Nhập khối lượng.", "Chọn đơn vị nguồn và đích.", "Sao chép kết quả hoặc xem bảng tất cả đơn vị."],
      sections: [{ title: "Đổi khối lượng online", paras: ["Đổi **kg ↔ lb**, gram, ounce, tấn theo hệ số NIST: 1 lb = 0,45359237 kg."] }]
    },
    "unit-length": {
      keywords: "đổi mét sang feet, đổi inch sang cm, chiều dài online",
      howto: ["Nhập chiều dài.", "Chọn m, cm, inch, ft…", "Xem kết quả live."],
      sections: [{ title: "Đổi chiều dài online", paras: ["Chuẩn SI: **1 inch = 25,4 mm**. Hỗ trợ km, mile, hải lý."] }]
    },
    "unit-temp": {
      keywords: "đổi độ c sang f, celsius fahrenheit kelvin",
      howto: ["Nhập nhiệt độ.", "Chọn °C, °F hoặc K.", "Kết quả theo công thức chuẩn."],
      sections: [{ title: "Đổi nhiệt độ online", paras: ["Công thức qua Kelvin — chính xác °C ↔ °F ↔ K ↔ °R."] }]
    },
    "unit-data": {
      keywords: "đổi mb sang gib, kilobyte mebibyte",
      howto: ["Nhập dung lượng.", "Chọn KB/MB (SI) hoặc KiB/MiB (IEC).", "Sao chép kết quả."],
      sections: [{ title: "Đổi dung lượng online", paras: ["Phân biệt rõ **MB (10⁶)** và **MiB (2²⁰)** — đúng chuẩn máy tính."] }]
    },
    "unit-volume": {
      keywords: "đổi lít sang gallon, thể tích online",
      howto: ["Nhập giá trị thể tích.","Chọn đơn vị nguồn và đích.","Sao chép kết quả hoặc xem bảng quy đổi."],
      sections: [{"title":"Đổi thể tích online là gì?","paras":["Đổi lít, mL, mét khối, gallon Mỹ/Anh."]}]
    },
    "unit-area": {
      keywords: "đổi m2 sang hecta, diện tích online",
      howto: ["Nhập giá trị diện tích.","Chọn đơn vị nguồn và đích.","Sao chép kết quả hoặc xem bảng quy đổi."],
      sections: [{"title":"Đổi diện tích online là gì?","paras":["Đổi mét vuông, hecta, acre, feet vuông."]}]
    },
    "unit-speed": {
      keywords: "đổi km/h sang mph online",
      howto: ["Nhập giá trị tốc độ.","Chọn đơn vị nguồn và đích.","Sao chép kết quả hoặc xem bảng quy đổi."],
      sections: [{"title":"Đổi tốc độ online là gì?","paras":["Đổi km/h, m/s, mph, knot."]}]
    },
    "unit-time": {
      keywords: "đổi giờ phút giây online",
      howto: ["Nhập giá trị thời gian.","Chọn đơn vị nguồn và đích.","Sao chép kết quả hoặc xem bảng quy đổi."],
      sections: [{"title":"Đổi thời gian online là gì?","paras":["Đổi giây, phút, giờ, ngày, tuần."]}]
    },
    "unit-energy": {
      keywords: "đổi joule kWh calo online",
      howto: ["Nhập giá trị năng lượng.","Chọn đơn vị nguồn và đích.","Sao chép kết quả hoặc xem bảng quy đổi."],
      sections: [{"title":"Đổi năng lượng online là gì?","paras":["Đổi joule, kWh, calo, BTU."]}]
    },
    "unit-pressure": {
      keywords: "đổi pa bar atm psi online",
      howto: ["Nhập giá trị áp suất.","Chọn đơn vị nguồn và đích.","Sao chép kết quả hoặc xem bảng quy đổi."],
      sections: [{"title":"Đổi áp suất online là gì?","paras":["Đổi Pa, bar, atm, psi."]}]
    },
    "unit-power": {
      keywords: "đổi watt sang mã lực HP",
      howto: ["Nhập giá trị công suất.","Chọn đơn vị nguồn và đích.","Sao chép kết quả hoặc xem bảng quy đổi."],
      sections: [{"title":"Đổi công suất online là gì?","paras":["Đổi W, kW, mã lực (HP)."]}]
    },
    "unit-angle": {
      keywords: "đổi độ sang radian online",
      howto: ["Nhập giá trị góc.","Chọn đơn vị nguồn và đích.","Sao chép kết quả hoặc xem bảng quy đổi."],
      sections: [{"title":"Đổi góc online là gì?","paras":["Đổi độ ↔ radian và đơn vị góc liên quan."]}]
    },
    "unit-fuel": {
      keywords: "đổi L/100km sang mpg",
      howto: ["Nhập giá trị tiêu hao.","Chọn đơn vị nguồn và đích.","Sao chép kết quả hoặc xem bảng quy đổi."],
      sections: [{"title":"Đổi tiêu hao nhiên liệu online là gì?","paras":["Đổi L/100km ↔ mpg (Mỹ/Anh)."]}]
    },
    "json-tools": {
      keywords: "format json, minify json, validate json online",
      howto: [
        "Dán JSON vào ô.",
        "Bấm format hoặc minify.",
        "Sao chép kết quả đã chỉnh."
      ],
      sections: [
        {
          title: "JSON Tools dùng để làm gì?",
          paras: [
            "Bộ công cụ **format, minify và kiểm tra JSON** — hữu ích khi debug API, đọc response dài hoặc gọn config trước khi đưa lên môi trường."
          ]
        },
        {
          title: "Cách format JSON online",
          paras: [
            "Dán chuỗi JSON, bấm làm đẹp để xuống dòng và thụt lề. Minify gom thành một dòng. JSON chuẩn không chứa comment — hãy xóa // trước khi validate."
          ]
        }
      ]
    },
    "base64-tools": {
      keywords: "encode decode base64 utf-8, base64 tiếng việt, url-safe base64",
      howto: [
        "Dán văn bản UTF-8 (tiếng Việt OK) hoặc chuỗi Base64.",
        "Chọn Encode hoặc Decode, bật URL-safe / Data URL nếu cần.",
        "Sao chép hoặc tải kết quả — ảnh decode sẽ có preview."
      ],
      sections: [
        {
          title: "Base64 là gì?",
          paras: [
            "**Base64** mã hóa dữ liệu (text UTF-8, file, ảnh) thành chuỗi an toàn để nhúng trong JSON, HTML hoặc URL. OneTool dùng TextEncoder/TextDecoder chuẩn — hỗ trợ tiếng Việt có dấu, không giới hạn ASCII."
          ]
        },
        {
          title: "Cách encode / decode Base64",
          paras: [
            "Tab Encode: nhập text hoặc mở file, tùy chọn URL-safe và Data URL. Tab Decode: dán Base64 hoặc data:image/…;base64,… — text UTF-8 hiển thị trực tiếp, ảnh/file tải về hoặc xem preview."
          ]
        }
      ]
    },
    "developer-tools": {
      keywords: "tạo uuid v4, hash sha256 utf-8, slug tiếng việt, unix timestamp",
      howto: [
        "Chọn tab UUID, Hash, Slugify hoặc Timestamp.",
        "Nhập dữ liệu (nếu cần) và bấm chạy.",
        "Sao chép hoặc tải kết quả."
      ],
      sections: [
        {
          title: "Developer Tools gồm những gì?",
          paras: [
            "Bộ tiện ích cho lập trình viên: tạo **UUID v4**, băm **SHA-256/384/512/1** (UTF-8), **slugify** tiêu đề tiếng Việt và chuyển đổi **Unix timestamp**."
          ]
        },
        {
          title: "Hash và slug chuẩn",
          paras: [
            "Hash dùng Web Crypto API và TextEncoder UTF-8 — đúng chuẩn với Node.js/crypto. Slug bỏ dấu NFD, xử lý đ/Đ, gạch ngang hoặc gạch dưới."
          ]
        }
      ]
    }
  },

  categorySeo: {
    "cong-cu-media": {
      intro: "Bộ công cụ **Media & AI**: tải TikTok HD, chuyển audio/video thành văn bản, tóm tắt AI, nén/cắt MP4. Nén & cắt chạy trên máy; TikTok và AI dùng xử lý đám mây.",
      sections: [
        { title: "Tải TikTok & xử lý video", paras: ["**TikTok Download** lấy MP4 HD không watermark từ link (xử lý đám mây). **Compress Video** / **Video Trim** nén hoặc cắt MP4 trên trình duyệt."] },
        { title: "Audio/Video → Text & AI", paras: ["**Speech-to-text** và **Tóm tắt AI** dùng dịch vụ đám mây tạm thời để nhận diện/tóm tắt — xuất TXT, SRT hoặc bản rút gọn."] }
      ]
    },
    "cong-cu-pdf": {
      intro: "Tập hợp **công cụ PDF online miễn phí**: gộp, tách, nén, **Ảnh ↔ PDF**, xoay trang và trích TXT/OCR.",
      sections: [
        { title: "Ảnh ↔ PDF", paras: ["**Ảnh → PDF** ghép nhiều ảnh thành một file. **PDF → Ảnh** xuất PNG/JPG/WebP từng trang hoặc ZIP."] },
        { title: "Gộp · nén · Word", paras: ["**Gộp PDF**, **Nén PDF**, **PDF → Word**. File xử lý trên trình duyệt — không rời máy bạn."] }
      ]
    },
    "cong-cu-anh": {
      intro: "**Công cụ ảnh online** — nén dung lượng, convert định dạng, resize, xóa nền AI. Cần ghép ảnh thành PDF? Xem hub **Ảnh ↔ PDF**.",
      sections: [
        { title: "Nén & convert ảnh", paras: ["**Nén ảnh** giảm MB với % tiết kiệm rõ ràng. Đổi JPG, PNG, WebP. Resize banner, avatar, thumbnail."] },
        { title: "Xóa nền & PDF", paras: ["Tách nền AI xuất PNG trong suốt. Ghép nhiều ảnh thành PDF tại **Ảnh → PDF**."] }
      ]
    },
    "cong-cu-chuyen-doi": {
      intro: "Chuyển đổi **file và dữ liệu** — Excel ↔ CSV/JSON, CSV ↔ JSON, OCR bảng, PDF → TXT.",
      sections: [
        { title: "Excel & bảng tính", paras: ["**Excel ↔ CSV/JSON** — chọn sheet, xem trước, tải file. Phù hợp API, báo cáo, làm sạch dữ liệu."] },
        { title: "CSV ↔ JSON & PDF", paras: ["Đổi nhanh CSV/JSON. Cần PDF → TXT/OCR? Dùng **Convert PDF** trong mục Công cụ PDF."] }
      ]
    },
    "cong-cu-don-vi": {
      intro: "Bộ **đổi đơn vị** chuẩn SI/NIST: khối lượng, chiều dài, nhiệt độ, dung lượng và nhiều nhóm khác.",
      sections: [
        { title: "Nhóm phổ biến", paras: ["**Khối lượng** kg↔lb, **chiều dài** m↔ft, **nhiệt độ** °C↔°F, **dung lượng** MB↔GiB."] },
        { title: "Độ chính xác", paras: ["1 lb = 0,45359237 kg · 1 inch = 25,4 mm · phân biệt KB (SI) và KiB (IEC)."] }
      ]
    },
    "cong-cu-lap-trinh": {
      intro: "Công cụ **lập trình / developer**: JSON formatter, Base64, UUID, hash SHA, slugify tiếng Việt.",
      sections: [
        { title: "JSON & Base64", paras: ["Format/minify/validate JSON. Encode/decode Base64 UTF-8, URL-safe, Data URL."] },
        { title: "UUID & Hash", paras: ["Tạo UUID v4, hash SHA-256/384/512, slugify tiêu đề tiếng Việt."] }
      ]
    },
    "cong-cu-tien-ich": {
      intro: "Tiện ích văn phòng gọn: **QR Code**, **tạo mật khẩu** và **chuyển đổi chữ** (hoa/thường, bỏ dấu).",
      sections: [
        { title: "QR & mật khẩu", paras: ["**QR Code** từ link hoặc WiFi. **Password Generator** mật khẩu crypto ngẫu nhiên, đo độ mạnh."] },
        { title: "Chuyển đổi chữ", paras: ["Viết hoa/thường, Title Case, bỏ dấu tiếng Việt, slug URL, tìm & thay."] }
      ]
    }
  },

  catBySlug(slug) {
    return this.categories.find(c => c.slug === slug);
  },
  toolBySlug(slug) {
    return this.tools.find(t => t.slug === slug);
  },
  pathFor(tool) {
    const cat = this.catBySlug(tool.cat);
    return `${cat.seo}/${tool.slug}.html`;
  },
  catIndexUrl(seo) {
    return `${seo}.html`;
  },
  hubUrl() {
    return "cong-cu.html";
  },
  catBySeo(seo) {
    return this.categories.find(c => c.seo === seo);
  },
  relatedTools(slug, limit) {
    const n = limit || 6;
    const current = this.toolBySlug(slug);
    if (!current) return [];
    const same = this.tools.filter(t => t.cat === current.cat && t.slug !== slug);
    const rest = this.tools.filter(t => t.cat !== current.cat && t.slug !== slug && t.featured);
    const out = [];
    const seen = new Set();
    same.concat(rest).forEach(t => {
      const key = t.hub || t.slug;
      if (seen.has(key) || out.length >= n) return;
      seen.add(key);
      out.push(t);
    });
    return out;
  }
};
