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
    { slug: "tiktok-download", name: "TikTok Download · Tải không logo", desc: "Tải MP4 HD không dính logo TikTok từ link — kể cả video app không cho lưu.", icon: "🎵", cat: "media", featured: true, rank: 1 },
    { slug: "audio-to-text", name: "Audio to Text · Giọng nói thành chữ", desc: "Convert audio/video thành văn bản tiếng Việt + phụ đề SRT.", icon: "🎙️", cat: "media", featured: true, rank: 2 },
    { slug: "ai-summarize", name: "Tóm tắt AI · Rút gọn văn bản", desc: "Tóm tắt bài viết, biên bản, email bằng AI — đoạn văn, gạch đầu dòng, TL;DR.", icon: "✨", cat: "media", featured: true, rank: 3 },
    { slug: "video-convert", name: "Compress Video · Nén video", desc: "Nén MP4, convert WebM, tách MP3 — ngay trên máy bạn.", icon: "🎬", cat: "media", featured: true, rank: 4 },
    { slug: "video-trim", name: "Video Trim · Cắt video", desc: "Cắt video theo thời gian start–end — copy nhanh hoặc encode chính xác.", icon: "✂️", cat: "media", featured: true, rank: 5 },

    /* PDF */
    { slug: "pdf-to-word", name: "PDF to Word · Sang DOCX", desc: "Convert PDF sang Word chỉnh sửa được — kể cả bản scan.", icon: "📄", cat: "pdf-tools", featured: true, rank: 1 },
    { slug: "pdf-merge", name: "Merge PDF · Gộp file", desc: "Gộp nhiều PDF thành một tài liệu, sắp xếp thứ tự dễ dàng.", icon: "📎", cat: "pdf-tools", featured: true, rank: 2 },
    { slug: "image-pdf", name: "Ảnh ↔ PDF · Hub chuyển đổi", desc: "Hub rõ 2 hướng: Ảnh → PDF và PDF → Ảnh (PNG JPG WebP).", icon: "🔄", cat: "pdf-tools", featured: true, rank: 3 },
    { slug: "image-to-pdf", name: "Ảnh → PDF · Ghép thành PDF", desc: "Ghép nhiều JPG PNG WebP thành một PDF — Fit / A4 / Letter.", icon: "🖼️", cat: "pdf-tools", featured: true, rank: 4 },
    { slug: "pdf-to-image", name: "PDF → Ảnh · Xuất PNG JPG WebP", desc: "Xuất từng trang PDF ra ảnh — xem trước, tải ZIP.", icon: "🌄", cat: "pdf-tools", featured: true, rank: 5 },
    { slug: "pdf-watermark", name: "Watermark PDF · Đóng dấu", desc: "Thêm chữ hoặc logo watermark — độ mờ, góc xoay, vị trí, khoảng trang.", icon: "💧", cat: "pdf-tools", featured: true, rank: 6 },
    { slug: "pdf-compress", name: "Compress PDF · Nén PDF", desc: "Nén PDF giảm dung lượng — xem % tiết kiệm rồi tải về.", icon: "🗜️", cat: "pdf-tools", featured: true, rank: 7 },
    { slug: "office-to-pdf", name: "Word/Excel → PDF · Sang PDF", desc: "Convert DOCX & XLSX sang PDF nhanh, sạch để gửi hoặc in.", icon: "📑", cat: "pdf-tools", rank: 8 },
    { slug: "pdf-split", name: "Split PDF · Tách trang", desc: "Tách PDF theo từng trang hoặc khoảng trang bạn chọn.", icon: "✂️", cat: "pdf-tools", rank: 9 },
    { slug: "pdf-pages", name: "Rotate PDF · Xoay & xóa trang", desc: "Xoay trang bị lệch 90°/180°/270° hoặc xóa trang thừa.", icon: "🔄", cat: "pdf-tools", rank: 10 },
    { slug: "pdf-convert", name: "Convert PDF · Sang TXT (OCR)", desc: "Trích chữ từ PDF + OCR bản scan — xuất TXT.", icon: "📤", cat: "pdf-tools", rank: 11 },

    /* Ảnh */
    { slug: "remove-background", name: "Remove Background · Xóa nền AI", desc: "Xóa nền ảnh bằng AI, xuất PNG trong suốt.", icon: "✂️", cat: "images", featured: true, rank: 1 },
    { slug: "heic-convert", name: "HEIC Convert · HEIC sang JPG", desc: "Đổi HEIC/HEIF (iPhone) sang JPG PNG WebP — nhiều ảnh, tải ZIP.", icon: "📱", cat: "images", featured: true, rank: 2 },
    { slug: "image-compress", name: "Compress Ảnh · Nén ảnh", desc: "Nén JPG PNG WebP — xem % tiết kiệm, so sánh trước/sau.", icon: "🗜️", cat: "images", featured: true, rank: 3 },
    { slug: "image-convert", name: "Convert Ảnh · Đổi định dạng", desc: "Convert JPG, PNG, WebP, GIF, BMP nhanh chóng.", icon: "🖼️", cat: "images", featured: true, rank: 4 },
    { slug: "image-resize", name: "Resize Ảnh · Đổi kích thước", desc: "Resize theo pixel hoặc preset — giữ tỉ lệ ảnh.", icon: "📐", cat: "images", featured: true, rank: 5 },
    { slug: "image-batch", name: "Batch Ảnh · Xử lý hàng loạt", desc: "Convert, resize hoặc nén nhiều ảnh cùng lúc.", icon: "📦", cat: "images", rank: 6 },

    /* File & dữ liệu */
    { slug: "excel-convert", name: "Excel ↔ CSV/JSON · Đổi bảng tính", desc: "Convert XLSX/XLS ↔ CSV ↔ JSON — chọn sheet, xem trước, tải file.", icon: "📗", cat: "file-converter", featured: true, rank: 1 },
    { slug: "ocr-table", name: "OCR Bảng → Excel · Ảnh thành bảng", desc: "Chụp bảng / biên lai → OCR tiếng Việt → chỉnh sửa → tải XLSX/CSV.", icon: "📋", cat: "file-converter", featured: true, rank: 2 },
    { slug: "convert-data", name: "CSV to JSON · Đổi dữ liệu", desc: "Convert CSV sang JSON và JSON sang CSV trong vài giây.", icon: "📊", cat: "file-converter", featured: true, rank: 3 },
    { slug: "convert-document", name: "Convert Document · PDF sang TXT", desc: "Lối tắt mở Convert PDF (TXT + OCR).", icon: "📝", cat: "file-converter", hub: "pdf-convert", rank: 4 },
    { slug: "convert-image", name: "Convert Image · Đổi ảnh nhanh", desc: "Lối tắt mở công cụ Convert Ảnh.", icon: "🖼️", cat: "file-converter", hub: "image-convert", rank: 9 },

    /* Đơn vị — hub + tool nổi bật trước */
    { slug: "unit-convert", name: "Chuyển đổi đơn vị · Tất cả nhóm", desc: "Hub đổi đơn vị: khối lượng, chiều dài, nhiệt độ, dung lượng — chọn tool theo nhóm.", icon: "⚖️", cat: "units", featured: true, rank: 1 },
    { slug: "unit-mass", name: "Đổi khối lượng · kg · lb", desc: "Đổi kilogram, gram, pound, ounce, tấn — hệ số NIST/SI chuẩn.", icon: "⚖️", cat: "units", featured: true, rank: 2 },
    { slug: "unit-length", name: "Đổi chiều dài · m · ft", desc: "Đổi mét, centimet, inch, feet, mile, hải lý — 1 inch = 25,4 mm.", icon: "📏", cat: "units", featured: true, rank: 3 },
    { slug: "unit-temp", name: "Đổi nhiệt độ · °C · °F", desc: "Đổi độ C, độ F, Kelvin, Rankine theo công thức chuẩn.", icon: "🌡️", cat: "units", featured: true, rank: 4 },
    { slug: "unit-data", name: "Đổi dung lượng · MB · GiB", desc: "Đổi KB/MB/GB (SI) và KiB/MiB/GiB (IEC) chính xác.", icon: "💾", cat: "units", featured: true, rank: 5 },
    { slug: "unit-volume", name: "Đổi thể tích · L · gallon", desc: "Đổi lít, mililít, mét khối, gallon Mỹ/Anh, cup.", icon: "🧪", cat: "units", rank: 6 },
    { slug: "unit-area", name: "Đổi diện tích · m² · ha", desc: "Đổi mét vuông, hecta, acre, feet vuông.", icon: "🗺️", cat: "units", rank: 7 },
    { slug: "unit-speed", name: "Đổi tốc độ · km/h · mph", desc: "Đổi km/h, m/s, mph, knot, feet/giây.", icon: "🚀", cat: "units", rank: 8 },
    { slug: "unit-time", name: "Đổi thời gian · giờ · phút", desc: "Đổi giây, phút, giờ, ngày, tuần, năm.", icon: "⏱️", cat: "units", rank: 9 },
    { slug: "unit-energy", name: "Đổi năng lượng · J · kWh", desc: "Đổi joule, kilowatt-giờ, calo, BTU.", icon: "⚡", cat: "units", rank: 10 },
    { slug: "unit-pressure", name: "Đổi áp suất · Pa · bar", desc: "Đổi pascal, bar, atm, psi, torr.", icon: "🔘", cat: "units", rank: 11 },
    { slug: "unit-power", name: "Đổi công suất · W · HP", desc: "Đổi watt, kilowatt, mã lực HP/PS.", icon: "🔌", cat: "units", rank: 12 },
    { slug: "unit-angle", name: "Đổi góc · độ · radian", desc: "Đổi độ, radian, grad, phút/giây cung.", icon: "📐", cat: "units", rank: 13 },
    { slug: "unit-fuel", name: "Đổi tiêu hao · L/100km · mpg", desc: "Đổi L/100km, km/L, mpg Mỹ và mpg Anh.", icon: "⛽", cat: "units", rank: 14 },

    /* Lập trình */
    { slug: "json-tools", name: "JSON Formatter · Làm đẹp JSON", desc: "Format, minify và kiểm tra JSON hợp lệ.", icon: "{ }", cat: "developer", featured: true, rank: 1 },
    { slug: "base64-tools", name: "Base64 · Mã hóa / giải mã", desc: "Encode/decode Base64 — tiếng Việt, URL-safe, file.", icon: "🔤", cat: "developer", featured: true, rank: 2 },
    { slug: "developer-tools", name: "Dev Tools · UUID & Hash", desc: "UUID, SHA hash, slugify tiếng Việt, Unix timestamp.", icon: "🛠️", cat: "developer", featured: true, rank: 3 },

    /* Tiện ích (gọn) */
    { slug: "word-counter", name: "Đếm từ · Word Counter", desc: "Đếm từ, ký tự, câu, đoạn — thời gian đọc tiếng Việt, mật độ từ khóa.", icon: "🔢", cat: "utilities", featured: true, rank: 1 },
    { slug: "qr-generator", name: "QR Code · Tạo mã QR", desc: "Tạo mã QR từ link hoặc chữ, xem trước và tải PNG.", icon: "📱", cat: "utilities", featured: true, rank: 2 },
    { slug: "password-generator", name: "Password · Tạo mật khẩu", desc: "Tạo mật khẩu mạnh ngẫu nhiên — chữ, số, ký tự đặc biệt, đo độ mạnh.", icon: "🔐", cat: "utilities", featured: true, rank: 3 },
    { slug: "text-convert", name: "Chuyển đổi chữ · Hoa thường, bỏ dấu", desc: "Viết hoa/thường, Title Case, bỏ dấu tiếng Việt, slug URL, dọn dòng, encode, tìm thay.", icon: "Aa", cat: "utilities", featured: true, rank: 4 }
  ],

  origin: "https://onetool.vn",

  pageMeta: {
    "remove-background": {
      title: "Remove Background online — Xóa nền ảnh AI miễn phí | OneTool",
      desc: "Remove background / xóa nền ảnh AI trên trình duyệt. Tải PNG trong suốt, miễn phí, không cần đăng nhập."
    },
    "image-compress": {
      title: "Nén ảnh online — Compress Image JPG WebP miễn phí | OneTool",
      desc: "Nén ảnh giảm dung lượng JPG PNG WebP trên trình duyệt. Xem % tiết kiệm, so sánh trước/sau — miễn phí, không upload."
    },
    "image-convert": {
      title: "Convert Ảnh online — JPG PNG WebP miễn phí | OneTool",
      desc: "Convert ảnh JPG, PNG, WebP, GIF, BMP trên trình duyệt. Kéo thả, chọn format, tải về ngay — miễn phí."
    },
    "image-resize": {
      title: "Resize Ảnh online — Đổi kích thước pixel miễn phí | OneTool",
      desc: "Resize ảnh theo pixel hoặc preset. Giữ tỉ lệ, xuất JPG/PNG/WebP — xử lý trên trình duyệt, miễn phí."
    },
    "image-batch": {
      title: "Batch Convert Ảnh online — convert, resize, nén hàng loạt | OneTool",
      desc: "Batch convert / resize / nén nhiều ảnh cùng lúc trên trình duyệt. Phù hợp catalog sản phẩm — miễn phí."
    },
    "tiktok-download": {
      title: "Tải TikTok không logo — MP4 HD online miễn phí | OneTool",
      desc: "Dán link TikTok tải MP4 HD không dính logo, MP3 và slideshow. Miễn phí — kể cả video app không cho tải."
    },
    "audio-to-text": {
      title: "Audio to Text online — Convert giọng nói thành văn bản + SRT | OneTool",
      desc: "Audio to Text / video to text tiếng Việt. Convert MP3, WAV, MP4, MOV thành văn bản và phụ đề SRT — miễn phí (xử lý đám mây)."
    },
    "ai-summarize": {
      title: "Tóm tắt AI online — Tóm tắt văn bản tiếng Việt miễn phí | OneTool",
      desc: "Tóm tắt văn bản bằng AI: đoạn văn, gạch đầu dòng, TL;DR. Dán text hoặc mở file — miễn phí (xử lý đám mây)."
    },
    "video-convert": {
      title: "Compress Video online — Nén MP4, Convert WebM, tách MP3 | OneTool",
      desc: "Compress video / nén MP4 online, convert WebM hoặc tách MP3 ngay trên trình duyệt. Miễn phí, file không rời máy bạn."
    },
    "video-trim": {
      title: "Cắt video online — Trim / Crop thời gian MP4 miễn phí | OneTool",
      desc: "Cắt video theo thời gian (trim) ngay trên trình duyệt. Chọn đoạn start–end, copy nhanh hoặc encode chính xác — miễn phí, file không rời máy bạn."
    },
    "heic-convert": {
      title: "HEIC sang JPG online — Convert HEIC/HEIF miễn phí | OneTool",
      desc: "Đổi ảnh HEIC/HEIF từ iPhone sang JPG PNG WebP trên trình duyệt. Nhiều ảnh, tải ZIP — miễn phí, không upload."
    },
    "pdf-watermark": {
      title: "Watermark PDF online — Đóng dấu chữ / logo miễn phí | OneTool",
      desc: "Thêm watermark chữ hoặc logo vào PDF: độ mờ, góc xoay, vị trí, khoảng trang. Chạy trên trình duyệt — không upload server."
    },
    "ocr-table": {
      title: "OCR bảng sang Excel online — Ảnh thành XLSX miễn phí | OneTool",
      desc: "Chụp bảng, biên lai, screenshot → OCR tiếng Việt → chỉnh sửa bảng → tải Excel/CSV. Miễn phí trên trình duyệt."
    },
    "word-counter": {
      title: "Đếm từ online — Word Counter tiếng Việt miễn phí | OneTool",
      desc: "Đếm từ, ký tự, câu, đoạn văn. Thời gian đọc tiếng Việt, mật độ từ khóa — dán text hoặc mở file TXT."
    },
    "pdf-merge": {
      title: "Merge PDF online miễn phí — Gộp nhiều PDF thành một | OneTool",
      desc: "Merge PDF / gộp PDF online. Ghép nhiều file thành một tài liệu, sắp xếp thứ tự rồi tải về — miễn phí trên trình duyệt."
    },
    "pdf-split": {
      title: "Split PDF online — Tách PDF theo trang miễn phí | OneTool",
      desc: "Split PDF / tách PDF theo trang hoặc khoảng (ví dụ 1-3,5). Tải file mới ngay trên trình duyệt, miễn phí."
    },
    "pdf-compress": {
      title: "Compress PDF online — Nén PDF giảm dung lượng miễn phí | OneTool",
      desc: "Compress PDF / nén PDF online, xem % tiết kiệm rồi tải về. Xử lý trên trình duyệt, không upload server."
    },
    "pdf-pages": {
      title: "Rotate PDF online — Xoay và xóa trang PDF miễn phí | OneTool",
      desc: "Rotate PDF / xoay trang 90°, 180°, 270° hoặc xóa trang không cần. Thao tác trên trình duyệt, miễn phí."
    },
    "pdf-convert": {
      title: "Convert PDF sang TXT online — OCR miễn phí | OneTool",
      desc: "Xuất PDF thành văn bản TXT, OCR bản scan. Cần PDF → ảnh? Dùng tool PDF → Ảnh riêng."
    },
    "image-pdf": {
      title: "Ảnh ↔ PDF online — Ảnh sang PDF & PDF sang ảnh | OneTool",
      desc: "Hub chuyển đổi Ảnh → PDF và PDF → Ảnh (PNG JPG WebP). Miễn phí trên trình duyệt."
    },
    "image-to-pdf": {
      title: "Ảnh sang PDF online — JPG PNG WebP thành PDF | OneTool",
      desc: "Ghép nhiều ảnh thành một PDF. Khổ Fit/A4/Letter, sắp xếp trang — miễn phí, không upload server."
    },
    "pdf-to-image": {
      title: "PDF sang ảnh online — Xuất PNG JPG WebP | OneTool",
      desc: "Convert PDF sang ảnh PNG JPG WebP. Xuất từng trang hoặc ZIP, xem trước — miễn phí trên trình duyệt."
    },
    "pdf-to-word": {
      title: "PDF to Word online miễn phí — Convert PDF sang Word DOCX | OneTool",
      desc: "Convert PDF to Word (DOCX) online. Giữ đoạn văn, OCR PDF scan tiếng Việt — miễn phí, không upload server."
    },
    "office-to-pdf": {
      title: "Word/Excel to PDF online — Convert DOCX XLSX sang PDF | OneTool",
      desc: "Convert Word (DOCX) và Excel (XLSX) sang PDF online miễn phí. Nhanh, rõ nội dung — xử lý trên trình duyệt, không upload server."
    },
    "convert-document": {
      title: "Convert Document — chuyển tới PDF → TXT/OCR | OneTool",
      desc: "Lối tắt mở Convert PDF sang TXT (có OCR). Dùng tool PDF chuyên dụng trên OneTool."
    },
    "convert-data": {
      title: "CSV to JSON online — Convert JSON sang CSV miễn phí | OneTool",
      desc: "CSV to JSON / JSON to CSV ngay trên trình duyệt. Dán dữ liệu hoặc mở file, tải kết quả — miễn phí."
    },
    "excel-convert": {
      title: "Excel sang CSV JSON online — Convert XLSX miễn phí | OneTool",
      desc: "Đổi Excel (.xlsx/.xls) ↔ CSV ↔ JSON trên trình duyệt. Chọn sheet, xem trước bảng, tải file — miễn phí."
    },
    "qr-generator": {
      title: "QR Code Generator online miễn phí — tạo mã QR tải PNG | OneTool",
      desc: "QR Code Generator từ link hoặc văn bản, xem trước và tải PNG để in. Miễn phí trên trình duyệt."
    },
    "password-generator": {
      title: "Tạo mật khẩu online — Password Generator miễn phí | OneTool",
      desc: "Password Generator tạo mật khẩu mạnh ngẫu nhiên (crypto). Chữ hoa, số, ký tự đặc biệt, đo độ mạnh — miễn phí."
    },
    "text-convert": {
      title: "Chuyển đổi chữ online — Hoa thường, bỏ dấu tiếng Việt | OneTool",
      desc: "Chuyển đổi chữ: viết hoa/thường, Title Case, bỏ dấu tiếng Việt, slug URL, dọn khoảng trắng, URL/HTML encode, tìm thay — miễn phí."
    },
    "unit-convert": {
      title: "Chuyển đổi đơn vị online — Khối lượng, chiều dài, nhiệt độ | OneTool",
      desc: "Bộ đổi đơn vị: khối lượng, chiều dài, diện tích, thể tích, nhiệt độ, tốc độ, dung lượng. Hệ số SI chuẩn, miễn phí."
    },
    "unit-mass": {
      title: "Đổi khối lượng online — kg sang lb, g, tấn | OneTool",
      desc: "Đổi khối lượng: kilogram, gram, pound, ounce, tấn. Hệ số NIST/SI chuẩn — miễn phí."
    },
    "unit-length": {
      title: "Đổi chiều dài online — m sang ft, inch, km | OneTool",
      desc: "Đổi chiều dài: mét, centimet, inch, feet, mile, hải lý — miễn phí."
    },
    "unit-area": {
      title: "Đổi diện tích online — m², hecta, acre | OneTool",
      desc: "Đổi diện tích: mét vuông, hecta, acre, feet vuông — miễn phí."
    },
    "unit-volume": {
      title: "Đổi thể tích online — lít, mL, gallon | OneTool",
      desc: "Đổi thể tích: lít, mililít, mét khối, gallon Mỹ/Anh — miễn phí."
    },
    "unit-temp": {
      title: "Đổi nhiệt độ online — °C sang °F, Kelvin | OneTool",
      desc: "Đổi nhiệt độ: độ C, độ F, Kelvin, Rankine — miễn phí."
    },
    "unit-speed": {
      title: "Đổi tốc độ online — km/h sang mph | OneTool",
      desc: "Đổi tốc độ: km/h, m/s, mph, knot — miễn phí."
    },
    "unit-time": {
      title: "Đổi thời gian online — giờ, phút, giây | OneTool",
      desc: "Đổi thời gian: giây, phút, giờ, ngày, tuần — miễn phí."
    },
    "unit-data": {
      title: "Đổi dung lượng online — MB sang GiB | OneTool",
      desc: "Đổi dung lượng: KB/MB/GB (SI) và KiB/MiB/GiB (IEC) — miễn phí."
    },
    "unit-energy": {
      title: "Đổi năng lượng online — J, kWh, calo | OneTool",
      desc: "Đổi năng lượng: joule, kWh, calo, BTU — miễn phí."
    },
    "unit-pressure": {
      title: "Đổi áp suất online — Pa, bar, atm, psi | OneTool",
      desc: "Đổi áp suất: pascal, bar, atm, psi, torr — miễn phí."
    },
    "unit-power": {
      title: "Đổi công suất online — W, kW, HP | OneTool",
      desc: "Đổi công suất: watt, kilowatt, mã lực HP/PS — miễn phí."
    },
    "unit-angle": {
      title: "Đổi góc online — độ sang radian | OneTool",
      desc: "Đổi góc: độ, radian, grad — miễn phí."
    },
    "unit-fuel": {
      title: "Đổi tiêu hao nhiên liệu — L/100km sang mpg | OneTool",
      desc: "Đổi L/100km, km/L, mpg Mỹ/Anh — miễn phí."
    },
    "json-tools": {
      title: "JSON Formatter online — Format minify JSON miễn phí | OneTool",
      desc: "JSON Formatter: format, minify và kiểm tra JSON hợp lệ. Dán text hoặc mở file .json — miễn phí."
    },
    "base64-tools": {
      title: "Base64 Encode Decode online — UTF-8, file, ảnh | OneTool",
      desc: "Base64 Encode/Decode hỗ trợ tiếng Việt, URL-safe và Data URL. Mở file hoặc dán chuỗi — miễn phí."
    },
    "developer-tools": {
      title: "Developer Tools online — UUID, SHA hash, slugify | OneTool",
      desc: "Developer Tools: UUID v4, SHA-256/384/512, slugify tiếng Việt, Unix timestamp — miễn phí."
    }
  },

  seo: {
    "remove-background": {
      keywords: "xóa nền ảnh, remove background, png trong suốt, tách nền online miễn phí",
      howto: [
        "Thả ảnh chân dung hoặc sản phẩm (JPG, PNG, WebP).",
        "Bấm Xóa nền để AI tách chủ thể.",
        "Tải PNG trong suốt hoặc sao chép kết quả."
      ],
      sections: [
        {
          title: "Xóa nền ảnh là gì?",
          paras: [
            "**Xóa nền ảnh** (remove background) là thao tác tách người hoặc sản phẩm khỏi phông, giữ lại lớp chủ thể trên nền trong suốt. File kết quả thường là **PNG**, dễ ghép vào banner, website hay ảnh bán hàng."
          ]
        },
        {
          title: "Cách xóa nền ảnh online miễn phí",
          paras: [
            "Trên OneTool, bạn thả ảnh vào khung, bấm **Xóa nền**, xem preview rồi chọn **Tải PNG** hoặc **Sao chép**. Hỗ trợ JPG, PNG, WebP — xử lý ngay trên trình duyệt, không cần cài phần mềm."
          ]
        },
        {
          title: "Xóa nền ảnh sản phẩm và chân dung",
          paras: [
            "Ảnh sản phẩm nền trắng hoặc nền studio thường cho viền sạch. Ảnh chân dung nên để chủ thể rõ, tách khỏi phông rối. Kết quả PNG ghép được vào Canva, Shopee, Lazada hoặc thumbnail video."
          ]
        },
        {
          title: "Khi nào nên dùng xóa nền",
          paras: ["Một số tình huống phổ biến:"],
          list: [
            { title: "Ảnh bán hàng", text: "đặt sản phẩm lên nền trắng hoặc banner khuyến mãi." },
            { title: "Ảnh thẻ / CV", text: "tách người khỏi phông rồi ghép nền đồng phục." },
            { title: "Thiết kế social", text: "xuất PNG trong suốt để chồng chữ, sticker lên Shorts hoặc Reels." }
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
      keywords: "tải tiktok không logo, tải video tiktok không watermark, tiktok download hd, tải mp4 tiktok",
      howto: [
        "Mở TikTok → Chia sẻ → Sao chép liên kết.",
        "Dán link vào OneTool và bấm Lấy video.",
        "Chọn MP4 HD · Không logo TikTok để tải về."
      ],
      sections: [
        {
          title: "Tải TikTok không logo là gì?",
          paras: [
            "**TikTok Download** lấy file MP4 từ link công khai — **không dính logo TikTok**, ưu tiên HD. Hỗ trợ MP3 và ảnh slideshow."
          ]
        },
        {
          title: "Cách tải video TikTok không logo",
          paras: [
            "Sao chép liên kết → dán vào ô Link → bấm **Lấy video** → chọn **MP4 HD · Không logo**. Dùng được tiktok.com, vt.tiktok.com và vm.tiktok.com."
          ]
        },
        {
          title: "Lưu ý khi tải",
          list: [
            { title: "Quyền sử dụng", text: "chỉ tải nội dung bạn có quyền (video của bạn / được phép)." },
            { title: "Video riêng tư", text: "link private hoặc hết hạn có thể không lấy được." },
            { title: "Bản có logo", text: "nằm trong mục mở rộng — mặc định luôn ưu tiên không logo." }
          ]
        }
      ]
    },
    "audio-to-text": {
      keywords: "audio to text, chuyển giọng nói thành văn bản, phụ đề srt tiếng việt",
      howto: [
        "Thả file audio hoặc video (MP3, WAV, MP4, MOV…).",
        "Chọn ngôn ngữ nhận dạng.",
        "Sao chép văn bản, tải TXT hoặc phụ đề SRT."
      ],
      sections: [
        {
          title: "Audio/Video → Text là gì?",
          paras: [
            "Đây là công cụ **chuyển giọng nói thành văn bản** từ file ghi âm hoặc video. OneTool hỗ trợ tiếng Việt, xuất **TXT** để biên tập và **SRT** để gắn phụ đề."
          ]
        },
        {
          title: "Cách chuyển audio thành văn bản",
          paras: [
            "Thả file MP3, WAV, M4A hoặc MP4, chọn ngôn ngữ (tiếng Việt / English / tự nhận diện), bấm **Nhận dạng**. Khi xong, sao chép nội dung hoặc tải TXT và SRT."
          ]
        },
        {
          title: "Dùng transcript để làm gì",
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
      keywords: "gộp pdf, merge pdf online, ghép nhiều file pdf",
      howto: [
        "Chọn từ 2 file PDF trở lên.",
        "Sắp xếp thứ tự nếu cần.",
        "Bấm Gộp và tải file mới."
      ],
      sections: [
        {
          title: "Gộp PDF là gì?",
          paras: [
            "**Gộp PDF** (merge) ghép nhiều file thành một — ví dụ CV kèm chứng chỉ, hoặc hợp đồng kèm phụ lục — để nộp một lần."
          ]
        },
        {
          title: "Cách gộp nhiều PDF online",
          paras: [
            "Chọn ít nhất hai file PDF, sắp thứ tự trang theo ý muốn, bấm **Gộp** rồi tải file kết quả về máy."
          ]
        },
        {
          title: "Tình huống thường gặp",
          list: [
            { title: "Hồ sơ xin việc", text: "ghép CV, cover letter và bằng cấp." },
            { title: "Hợp đồng", text: "gộp bản chính với phụ lục bàn giao." }
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
      keywords: "nén pdf, giảm dung lượng pdf online",
      howto: [
        "Chọn file PDF cần giảm dung lượng.",
        "Chạy nén và xem phần trăm tiết kiệm.",
        "Tải bản nhẹ hơn."
      ],
      sections: [
        {
          title: "Nén PDF là gì?",
          paras: [
            "**Nén PDF** giảm dung lượng để gửi email, Zalo hoặc nộp lên cổng có giới hạn MB. File scan ảnh thường giảm rõ hơn PDF toàn chữ."
          ]
        },
        {
          title: "Cách nén PDF online",
          paras: [
            "Thả file vào OneTool, bấm nén, xem mức tiết kiệm rồi tải về. Giữ bản gốc nếu còn cần chất lượng in cao."
          ]
        },
        {
          title: "Ứng dụng",
          list: [
            { title: "Nộp hồ sơ", text: "nhiều cổng giới hạn 5–10 MB." },
            { title: "Scan điện thoại", text: "PDF ảnh chụp thường nhẹ hơn rõ sau khi nén." }
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
