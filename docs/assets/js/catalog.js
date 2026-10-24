window.OTCatalog = {
  categories: [
    {
      slug: "ai",
      seo: "cong-cu-ai",
      name: "Công cụ AI",
      desc: "Video/audio → chữ, phụ đề SRT, TTS, Tóm tắt AI",
      icon: "✨",
      seoTitle: "Công cụ AI online — Audio to text, TTS, Tóm tắt AI | OneTool",
      seoDescription: "Chuyển giọng nói thành văn bản, văn bản thành giọng nói tiếng Việt, tóm tắt AI. Miễn phí, xử lý đám mây có kiểm soát.",
      seoKeywords: "audio to text, text to speech tiếng việt, tóm tắt ai, chuyển giọng nói thành văn bản"
    },
    {
      slug: "media",
      seo: "cong-cu-media",
      name: "Công cụ Media",
      desc: "TikTok, video sang MP3, nén / cắt video",
      icon: "🎬",
      seoTitle: "Công cụ Media online — Tải TikTok, nén cắt video, MP3 | OneTool",
      seoDescription: "Tải TikTok không logo, nén MP4, tách MP3, cắt video trên trình duyệt. Miễn phí.",
      seoKeywords: "tải video tiktok, nén video online, video sang mp3, cắt video"
    },
    {
      slug: "pdf-tools",
      seo: "cong-cu-pdf",
      name: "Công cụ PDF",
      desc: "Gộp, tách, nén, ký PDF, PDF → Word/Excel, khóa mật khẩu",
      icon: "📄",
      seoTitle: "Công cụ PDF online miễn phí — Gộp, tách, nén, khóa PDF | OneTool",
      seoDescription: "Gộp PDF, tách trang, nén dung lượng, PDF sang Word/Excel, khóa mật khẩu — xử lý 100% trên trình duyệt, không cần đăng ký.",
      seoKeywords: "gộp pdf online, tách pdf, nén pdf, ký pdf, pdf sang excel, khóa pdf, convert pdf, công cụ pdf miễn phí"
    },
    {
      slug: "images",
      seo: "cong-cu-anh",
      name: "Công cụ Ảnh",
      desc: "Xóa nền AI, nén, HEIC, OCR, crop MXH",
      icon: "🖼️",
      seoTitle: "Công cụ ảnh online — OCR, crop MXH, convert, blur, resize, xóa nền | OneTool",
      seoDescription: "OCR ảnh sang chữ tiếng Việt, crop preset Instagram TikTok Shopee, đổi JPG PNG WebP, làm mờ, resize, xóa nền AI — miễn phí trên trình duyệt.",
      seoKeywords: "ocr ảnh tiếng việt, crop ảnh online, crop instagram, convert ảnh, làm mờ ảnh, resize ảnh, xóa nền ảnh miễn phí"
    },
    {
      slug: "utilities",
      seo: "cong-cu-tien-ich",
      name: "Tiện ích",
      desc: "VietQR, tính lương Gross Net, số thành chữ, tiền tệ, lịch âm",
      icon: "🔧",
      seoTitle: "Tiện ích online miễn phí — Tính lương Gross Net, VietQR, lịch âm | OneTool",
      seoDescription: "Tính lương Gross ↔ Net 2026, tạo VietQR, đổi tiền tệ USD/EUR/VND, số thành chữ, đổi lịch âm dương, tạo mã QR — tiện ích online miễn phí.",
      seoKeywords: "tính lương gross net, thuế tncn 2026, đổi tiền tệ, usd sang vnd, tạo qr code, tạo mã vạch, đổi lịch âm dương, đếm từ online"
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
      desc: "JSON, Regex, Base64, URL encode, UUID",
      icon: "🛠️",
      seoTitle: "Công cụ lập trình online — JSON, Regex, Base64, URL | OneTool",
      seoDescription: "Format JSON, Regex tester, encode Base64, URL encode/decode, UUID, hash SHA — miễn phí trên trình duyệt.",
      seoKeywords: "json formatter, regex tester, base64 encode, url encode decode, uuid v4"
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
    /* Media — TikTok đầu hàng Media trên trang chủ */
    { slug: "tiktok-download", name: "Tải video TikTok không logo", desc: "Dán link → tải MP4 HD không dính logo / watermark TikTok.", icon: "🎵", cat: "media", featured: true, rank: 1 },
    { slug: "video-to-mp3", name: "Video sang MP3", desc: "Tách tiếng từ MP4, MOV, MKV thành MP3 192kbps — chạy trên trình duyệt.", icon: "🎧", cat: "media", featured: true, rank: 2 },
    { slug: "video-convert", name: "Nén video online", desc: "Nén MP4, đổi WebM hoặc tách MP3 — chạy trên trình duyệt.", icon: "🎬", cat: "media", featured: true, rank: 3 },
    { slug: "video-trim", name: "Cắt video online", desc: "Chọn đoạn start–end, xem trước rồi cắt — nhanh trên máy bạn.", icon: "✂️", cat: "media", rank: 4 },
    { slug: "video-to-gif", name: "Video sang GIF", desc: "Cắt đoạn MP4/WebM thành GIF — chọn FPS, độ rộng, chất lượng palette.", icon: "🎞️", cat: "media", rank: 5 },

    /* AI — file vẫn ở cong-cu-media/ (dir) để giữ URL cũ */
    { slug: "audio-to-text", name: "Chuyển giọng nói thành văn bản", desc: "Audio to text tiếng Việt từ MP3, WAV, MP4 — xuất TXT và phụ đề SRT.", icon: "🎙️", cat: "ai", dir: "cong-cu-media", featured: true, rank: 1 },
    { slug: "subtitle-srt", name: "Tạo phụ đề SRT", desc: "Video hoặc MP3 thành phụ đề SRT tiếng Việt — gắn CapCut, YouTube, Premiere.", icon: "💬", cat: "ai", dir: "cong-cu-media", featured: true, rank: 2 },
    { slug: "text-to-speech", name: "Văn bản thành giọng nói", desc: "Text to speech tiếng Việt: chọn giọng nam/nữ, nghe thử, tải WAV — miễn phí.", icon: "🔊", cat: "ai", dir: "cong-cu-media", featured: true, rank: 3 },
    { slug: "ai-summarize", name: "Tóm tắt AI", desc: "Rút gọn bài viết, biên bản, email bằng AI — đoạn văn, gạch đầu dòng hoặc TL;DR.", icon: "✨", cat: "ai", dir: "cong-cu-media", rank: 4 },

    /* PDF */
    { slug: "pdf-to-word", name: "PDF sang Word", desc: "Chuyển PDF thành Word (DOCX) để chỉnh sửa — kể cả bản scan.", icon: "📄", cat: "pdf-tools", featured: true, rank: 1 },
    { slug: "pdf-merge", name: "Gộp PDF online", desc: "Ghép nhiều file PDF thành một tài liệu, sắp xếp thứ tự rồi tải về — miễn phí.", icon: "📎", cat: "pdf-tools", featured: true, rank: 2 },
    { slug: "pdf-compress", name: "Nén PDF online", desc: "Giảm dung lượng PDF để gửi email, Zalo hoặc nộp hồ sơ — xem % tiết kiệm rồi tải về.", icon: "🗜️", cat: "pdf-tools", featured: true, rank: 3 },
    { slug: "pdf-to-excel", name: "PDF sang Excel", desc: "Trích bảng / báo cáo từ PDF thành Excel (XLSX) — OCR bản scan tiếng Việt.", icon: "📊", cat: "pdf-tools", featured: true, rank: 4 },
    { slug: "office-to-pdf", name: "Word sang PDF", desc: "Convert DOCX hoặc XLSX thành PDF sạch để gửi, in hoặc nộp hồ sơ.", icon: "📑", cat: "pdf-tools", featured: true, rank: 5 },
    { slug: "image-to-pdf", name: "Ảnh sang PDF", desc: "Ghép một hoặc nhiều ảnh thành PDF — sắp xếp thứ tự, chọn khổ trang.", icon: "🖼️", cat: "pdf-tools", featured: true, rank: 6 },
    { slug: "pdf-to-image", name: "PDF sang ảnh", desc: "Xuất từng trang PDF ra PNG / JPG / WebP — xem trước hoặc tải ZIP.", icon: "🌄", cat: "pdf-tools", featured: true, rank: 7 },
    { slug: "image-pdf", name: "Ảnh ↔ PDF", desc: "Hai hướng rõ ràng: ghép ảnh thành PDF, hoặc xuất PDF ra ảnh.", icon: "🔄", cat: "pdf-tools", rank: 8 },
    { slug: "pdf-lock", name: "Đặt mật khẩu PDF", desc: "Khóa PDF bằng mật khẩu mở file (AES-256) — bảo vệ hồ sơ trước khi gửi.", icon: "🔒", cat: "pdf-tools", rank: 9 },
    { slug: "pdf-sign", name: "Ký PDF online", desc: "Ký tên, đóng dấu ngày, chữ ký tay hoặc ảnh lên PDF — kéo thả, nhiều trang.", icon: "✍️", cat: "pdf-tools", rank: 10 },
    { slug: "pdf-watermark", name: "Đóng dấu PDF", desc: "Thêm chữ hoặc logo watermark lên PDF — chỉnh độ trong suốt, góc, vị trí.", icon: "💧", cat: "pdf-tools", rank: 11 },
    { slug: "pdf-split", name: "Tách PDF online", desc: "Tách PDF theo trang hoặc khoảng — tải đúng phần cần dùng.", icon: "✂️", cat: "pdf-tools", rank: 12 },
    { slug: "pdf-pages", name: "Xoay PDF / xóa trang", desc: "Xoay trang bị ngược hoặc xóa trang trắng / trang nhầm trước khi gửi.", icon: "🔄", cat: "pdf-tools", rank: 13 },
    { slug: "pdf-convert", name: "PDF sang TXT", desc: "Trích chữ từ PDF (text layer + OCR bản scan) ra TXT.", icon: "📤", cat: "pdf-tools", rank: 14 },

    /* Ảnh */
    { slug: "remove-background", name: "Xóa nền ảnh", desc: "Tách nền ảnh bằng AI, xem preview, xuất PNG trong suốt — miễn phí.", icon: "✂️", cat: "images", featured: true, rank: 1 },
    { slug: "image-compress", name: "Nén ảnh online", desc: "Giảm dung lượng JPG / PNG / WebP — xem % tiết kiệm, so sánh trước/sau.", icon: "🗜️", cat: "images", featured: true, rank: 2 },
    { slug: "heic-convert", name: "HEIC sang JPG", desc: "Chuyển HEIC / HEIF (và JPG PNG) sang JPG · PNG · WebP — nhiều ảnh, tải ZIP.", icon: "📱", cat: "images", featured: true, rank: 3 },
    { slug: "image-ocr", name: "OCR ảnh → chữ", desc: "Nhận dạng chữ Việt + Anh trong ảnh: hóa đơn, CCCD, sách, screenshot — copy hoặc tải TXT.", icon: "🔤", cat: "images", featured: true, rank: 4 },
    { slug: "image-crop", name: "Crop ảnh + preset MXH", desc: "Cắt ảnh theo preset Instagram, TikTok, YouTube, Facebook, Shopee, ảnh thẻ 3×4 — kéo khung, xuất JPG/PNG/WebP.", icon: "🔲", cat: "images", featured: true, rank: 5 },
    { slug: "image-convert", name: "Đổi định dạng ảnh", desc: "Đổi JPG ↔ PNG ↔ WebP online — kéo thả, chọn format, tải về.", icon: "🖼️", cat: "images", rank: 6 },
    { slug: "image-resize", name: "Đổi kích thước ảnh", desc: "Đổi kích thước ảnh theo pixel hoặc preset — giữ tỉ lệ, xuất JPG/PNG/WebP.", icon: "📐", cat: "images", rank: 7 },
    { slug: "image-blur", name: "Làm mờ ảnh", desc: "Làm mờ toàn ảnh hoặc vùng chọn — ẩn thông tin nhạy cảm, xuất JPG/PNG/WebP.", icon: "🌫️", cat: "images", rank: 8 },
    { slug: "image-batch", name: "Nén nhiều ảnh cùng lúc", desc: "Đổi định dạng, resize hoặc nén nhiều ảnh cùng lúc — phù hợp catalog sản phẩm.", icon: "📦", cat: "images", rank: 9 },

    /* File & dữ liệu */
    { slug: "excel-convert", name: "Excel sang CSV JSON", desc: "Convert XLSX/XLS sang CSV hoặc JSON — và ngược lại. Chọn sheet, xem trước, tải file.", icon: "📗", cat: "file-converter", featured: true, rank: 1 },
    { slug: "ocr-table", name: "OCR bảng sang Excel", desc: "Chụp bảng / biên lai → OCR tiếng Việt → chỉnh sửa → tải XLSX/CSV.", icon: "📋", cat: "file-converter", featured: true, rank: 2 },
    { slug: "convert-data", name: "CSV to JSON", desc: "Dán dữ liệu hoặc mở file — đổi CSV ↔ JSON ngay trên trình duyệt.", icon: "📊", cat: "file-converter", featured: true, rank: 3 },
    { slug: "convert-document", name: "Convert Document · PDF sang TXT", desc: "Lối tắt mở Convert PDF (TXT + OCR).", icon: "📝", cat: "file-converter", hub: "pdf-convert", rank: 4 },
    { slug: "convert-image", name: "Convert Image · Đổi ảnh nhanh", desc: "Lối tắt mở công cụ Convert Ảnh.", icon: "🖼️", cat: "file-converter", hub: "image-convert", rank: 9 },

    /* Đơn vị — hub + tool nổi bật trước */
    { slug: "unit-convert", name: "Chuyển đổi đơn vị", desc: "Chọn nhóm cần đổi — mỗi tool riêng, hệ số SI/NIST chuẩn.", icon: "⚖️", cat: "units", rank: 1 },
    { slug: "unit-mass", name: "Đổi khối lượng", desc: "Đổi khối lượng: kg · lb · g. Hệ số chuẩn, kết quả tức thì.", icon: "⚖️", cat: "units", rank: 2 },
    { slug: "unit-length", name: "Đổi chiều dài", desc: "Đổi chiều dài: m · ft · inch. Hệ số chuẩn, kết quả tức thì.", icon: "📏", cat: "units", rank: 3 },
    { slug: "unit-temp", name: "Đổi nhiệt độ", desc: "Đổi nhiệt độ: °C · °F · K. Hệ số chuẩn, kết quả tức thì.", icon: "🌡️", cat: "units", rank: 4 },
    { slug: "unit-data", name: "Đổi dung lượng", desc: "Đổi dung lượng: MB · GiB. Hệ số chuẩn, kết quả tức thì.", icon: "💾", cat: "units", rank: 5 },
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
    { slug: "regex-tester", name: "Regex tester", desc: "Thử regex realtime — highlight match, flags, replace, nhóm bắt.", icon: ".*", cat: "developer", featured: true, rank: 2 },
    { slug: "base64-tools", name: "Base64 encode decode", desc: "Encode/decode Base64 — tiếng Việt, URL-safe, file và ảnh có preview.", icon: "🔤", cat: "developer", featured: true, rank: 3 },
    { slug: "url-encode", name: "URL encode decode", desc: "Encode/decode URL — encodeURIComponent, encodeURI, form (+), UTF-8 tiếng Việt.", icon: "🔗", cat: "developer", rank: 4 },
    { slug: "developer-tools", name: "UUID Hash Slugify", desc: "UUID, SHA hash, slugify tiếng Việt, Unix timestamp — công cụ dev nhanh.", icon: "🛠️", cat: "developer", rank: 5 },

    /* Tiện ích (gọn) */
    { slug: "vietqr", name: "Tạo mã VietQR", desc: "Tạo QR chuyển khoản NAPAS: ngân hàng, STK, số tiền — tải PNG in/dán shop.", icon: "🏦", cat: "utilities", featured: true, rank: 1 },
    { slug: "salary-calculator", name: "Tính lương Gross Net", desc: "Đổi lương Gross ↔ Net 2026: BHXH, BHYT, BHTN, thuế TNCN 5 bậc, giảm trừ 15,5 triệu.", icon: "💰", cat: "utilities", featured: true, rank: 2 },
    { slug: "loan-calculator", name: "Tính lãi vay trả góp", desc: "Vay mua nhà, mua xe mỗi tháng trả bao nhiêu: dư nợ giảm dần, trả đều, lãi phẳng, lịch trả nợ.", icon: "🏠", cat: "utilities", featured: true, rank: 2.5 },
    { slug: "savings-calculator", name: "Tính lãi tiết kiệm", desc: "Gửi tiết kiệm lãi bao nhiêu: lĩnh lãi cuối kỳ, hàng tháng, tái tục, tích lũy mỗi tháng.", icon: "🐷", cat: "utilities", featured: true, rank: 2.6 },
    { slug: "bhxh-calculator", name: "Tính BHXH một lần", desc: "Ước tính tiền rút BHXH một lần theo số năm đóng và lương bình quân, có diễn giải từng bước.", icon: "🧾", cat: "utilities", rank: 3.5 },
    { slug: "number-to-words", name: "Số thành chữ", desc: "Đổi số tiền thành chữ tiếng Việt cho hóa đơn, hợp đồng — một triệu hai trăm nghìn đồng.", icon: "🔡", cat: "utilities", featured: true, rank: 3 },
    { slug: "currency-convert", name: "Đổi tiền tệ", desc: "Đổi USD · EUR · VND và 20+ loại tiền — tỷ giá realtime, đảo chiều nhanh.", icon: "💱", cat: "utilities", featured: true, rank: 4 },
    { slug: "lunar-calendar", name: "Lịch âm hôm nay", desc: "Lịch vạn niên, ngày hoàng đạo, giờ tốt, ngày lễ, đếm ngược Tết — đổi ngày âm dương.", icon: "🌙", cat: "utilities", featured: true, rank: 5 },
    { slug: "qr-generator", name: "Tạo mã QR", desc: "Tạo mã QR từ link hoặc chữ, xem trước và tải PNG.", icon: "📱", cat: "utilities", featured: true, rank: 6 },
    { slug: "word-counter", name: "Đếm từ online", desc: "Đếm từ, ký tự, câu, đoạn — thời gian đọc tiếng Việt, mật độ từ khóa.", icon: "🔢", cat: "utilities", rank: 6 },
    { slug: "barcode-generator", name: "Tạo mã vạch", desc: "Tạo Barcode CODE128, EAN-13, CODE39, UPC… xem trước và tải PNG.", icon: "🏷️", cat: "utilities", rank: 7 },
    { slug: "password-generator", name: "Tạo mật khẩu", desc: "Tạo mật khẩu mạnh ngẫu nhiên — chữ, số, ký tự đặc biệt, đo độ mạnh.", icon: "🔐", cat: "utilities", rank: 8 },
    { slug: "text-convert", name: "Bỏ dấu tiếng Việt", desc: "Bỏ dấu, viết hoa/thường, slug URL, dọn dòng — chạy trên máy bạn.", icon: "Aa", cat: "utilities", rank: 9 }
  ],

  origin: "https://onetool.vn",

  pageMeta: {
    "remove-background": {
      title: "Xóa nền ảnh online miễn phí — PNG trong suốt | OneTool",
      desc: "Xóa nền ảnh AI online: tách người, sản phẩm, logo → PNG trong suốt. Xử lý trên trình duyệt, không cần đăng ký."
    },
    "image-compress": {
      title: "Nén ảnh online miễn phí — giảm dung lượng JPG PNG | OneTool",
      desc: "Nén ảnh JPG/PNG/WebP online, xem % tiết kiệm trước/sau. Miễn phí, không upload server, không đăng ký."
    },
    "image-convert": {
      title: "Đổi định dạng ảnh online — JPG PNG WebP miễn phí | OneTool",
      desc: "Đổi JPG ↔ PNG ↔ WebP online miễn phí. Kéo thả, chọn format, tải về — chạy trên trình duyệt."
    },
    "image-crop": {
      title: "Crop ảnh online miễn phí — preset Instagram TikTok | OneTool",
      desc: "Cắt ảnh theo preset Instagram, TikTok, YouTube, Shopee, ảnh thẻ 3×4. Kéo khung, xuất JPG/PNG — miễn phí."
    },
    "image-ocr": {
      title: "OCR ảnh sang chữ online miễn phí — Việt & Anh | OneTool",
      desc: "OCR ảnh → chữ tiếng Việt/Anh: CCCD, hóa đơn, sách, screenshot. Copy hoặc tải TXT. Miễn phí, không đăng ký."
    },
    "image-resize": {
      title: "Đổi kích thước ảnh online miễn phí — resize pixel | OneTool",
      desc: "Resize ảnh theo pixel hoặc preset avatar/banner. Giữ tỉ lệ, xuất JPG PNG WebP — miễn phí trên trình duyệt."
    },
    "image-blur": {
      title: "Làm mờ ảnh online miễn phí — che CCCD biển số | OneTool",
      desc: "Blur ảnh toàn phần hoặc vùng chọn để che thông tin nhạy cảm. Xuất JPG/PNG — miễn phí, không đăng ký."
    },
    "image-batch": {
      title: "Nén resize nhiều ảnh cùng lúc — batch online | OneTool",
      desc: "Xử lý hàng loạt ảnh: convert, resize, nén nhiều file một lần. Miễn phí trên trình duyệt."
    },
    "tiktok-download": {
      title: "Tải video TikTok không logo miễn phí — MP4 HD | OneTool",
      desc: "Tải TikTok không watermark từ link → MP4 HD hoặc MP3. Nhanh, miễn phí. Chỉ dùng khi bạn có quyền nội dung."
    },
    "audio-to-text": {
      title: "Chuyển giọng nói thành văn bản tiếng Việt | OneTool",
      desc: "Audio to text tiếng Việt từ MP3/WAV/MP4 — xuất TXT và SRT. Miễn phí, không cần cài app."
    },
    "subtitle-srt": {
      title: "Tạo phụ đề SRT online miễn phí — video/MP3 | OneTool",
      desc: "Tạo phụ đề SRT tiếng Việt từ video hoặc MP3 cho CapCut, YouTube, Premiere. Miễn phí, không đăng ký."
    },
    "text-to-speech": {
      title: "Text to speech tiếng Việt — chữ thành giọng nói | OneTool",
      desc: "Chuyển văn bản thành giọng nói Việt: chọn nam/nữ, nghe thử, tải WAV. Miễn phí, không đăng ký."
    },
    "ai-summarize": {
      title: "Tóm tắt văn bản AI online miễn phí | OneTool",
      desc: "Tóm tắt AI tiếng Việt: bài viết, biên bản, email — đoạn văn, gạch đầu dòng hoặc TL;DR. Miễn phí."
    },
    "video-convert": {
      title: "Nén video online miễn phí — nén MP4 trên máy bạn | OneTool",
      desc: "Nén MP4, đổi WebM hoặc tách MP3 ngay trên trình duyệt — file không upload server. Miễn phí."
    },
    "video-to-mp3": {
      title: "Video sang MP3 online miễn phí — tách nhạc MP4 | OneTool",
      desc: "Tách MP3 từ MP4/MOV/MKV/WebM (192kbps) trên trình duyệt. Miễn phí, không đăng ký."
    },
    "video-to-gif": {
      title: "Chuyển video sang GIF online miễn phí | OneTool",
      desc: "Cắt đoạn MP4/WebM thành GIF — chọn FPS, độ rộng. Chạy trên máy bạn, miễn phí."
    },
    "video-trim": {
      title: "Cắt video online miễn phí — trim MP4 | OneTool",
      desc: "Cắt video theo start–end, xem trước, xuất clip MP4. Xử lý trên trình duyệt — miễn phí."
    },
    "heic-convert": {
      title: "HEIC sang JPG online miễn phí — ảnh iPhone | OneTool",
      desc: "Đổi HEIC/HEIF sang JPG PNG WebP, nhiều ảnh, tải ZIP. Miễn phí trên trình duyệt, không đăng ký."
    },
    "pdf-watermark": {
      title: "Đóng dấu PDF online miễn phí — watermark chữ/logo | OneTool",
      desc: "Thêm watermark chữ hoặc logo lên PDF: kéo vị trí, chỉnh độ mờ. Không upload server, không đăng ký."
    },
    "ocr-table": {
      title: "Ảnh sang Excel online — OCR bảng tiếng Việt | OneTool",
      desc: "OCR bảng ảnh → Excel/CSV: biên lai, bảng điểm. Hỗ trợ tiếng Việt. Miễn phí, không đăng ký."
    },
    "word-counter": {
      title: "Đếm từ online miễn phí — đếm ký tự tiếng Việt | OneTool",
      desc: "Đếm từ, ký tự, câu, đoạn và thời gian đọc tiếng Việt. Dán text hoặc mở TXT — miễn phí."
    },
    "pdf-merge": {
      title: "Ghép PDF online miễn phí — không upload, không đăng ký | OneTool",
      desc: "Gộp nhiều file PDF thành một ngay trên trình duyệt. Kéo sắp thứ tự, không tải lên server, không watermark."
    },
    "pdf-split": {
      title: "Tách PDF online miễn phí — cắt theo trang | OneTool",
      desc: "Tách PDF theo trang hoặc khoảng (1-3, 5). Chạy trên trình duyệt — miễn phí, không đăng ký."
    },
    "pdf-compress": {
      title: "Nén PDF online miễn phí — gửi Zalo/email gọn | OneTool",
      desc: "Giảm dung lượng PDF để gửi Zalo, email, nộp hồ sơ. Xem % tiết kiệm. Xử lý trên máy bạn — miễn phí."
    },
    "pdf-pages": {
      title: "Xoay PDF / xóa trang online miễn phí | OneTool",
      desc: "Xoay trang PDF 90°/180°/270° hoặc xóa trang trắng/nhầm. Trên trình duyệt — miễn phí, không đăng ký."
    },
    "pdf-convert": {
      title: "PDF sang TXT online — OCR tiếng Việt miễn phí | OneTool",
      desc: "Trích chữ từ PDF (kể cả scan) ra TXT bằng OCR tiếng Việt. Copy hoặc tải — miễn phí trên trình duyệt."
    },
    "image-pdf": {
      title: "Ảnh ↔ PDF online miễn phí — ghép & xuất ảnh | OneTool",
      desc: "Ghép JPG/PNG thành PDF hoặc xuất PDF ra ảnh. Không upload server — miễn phí, không đăng ký."
    },
    "image-to-pdf": {
      title: "Ảnh sang PDF online miễn phí — JPG PNG thành PDF | OneTool",
      desc: "Ghép một/nhiều ảnh thành PDF, chọn khổ trang, sắp thứ tự. Chạy trên trình duyệt — miễn phí."
    },
    "pdf-to-image": {
      title: "PDF sang JPG/PNG online miễn phí — xuất từng trang | OneTool",
      desc: "Xuất trang PDF ra PNG/JPG/WebP, xem trước hoặc tải ZIP. Miễn phí trên trình duyệt, không đăng ký."
    },
    "pdf-to-word": {
      title: "PDF sang Word online miễn phí — PDF to DOCX | OneTool",
      desc: "Chuyển PDF → Word (DOCX) chỉnh sửa được, OCR bản scan tiếng Việt. Miễn phí, không bắt buộc đăng ký."
    },
    "pdf-to-excel": {
      title: "PDF sang Excel online miễn phí — PDF to XLSX | OneTool",
      desc: "Trích bảng PDF → Excel/CSV, OCR tiếng Việt. Miễn phí trên trình duyệt — không cần đăng ký."
    },
    "pdf-lock": {
      title: "Đặt mật khẩu PDF online miễn phí — khóa AES-256 | OneTool",
      desc: "Khóa PDF bằng mật khẩu mở file (AES-256). Bảo vệ hồ sơ trước khi gửi — xử lý trên máy bạn."
    },
    "pdf-sign": {
      title: "Ký PDF online miễn phí — chữ ký tay, không upload | OneTool",
      desc: "Ký PDF: vẽ chữ ký, gõ tên, ảnh chữ ký, đóng dấu ngày. Kéo thả nhiều trang — không upload, không đăng ký."
    },
    "office-to-pdf": {
      title: "Word/Excel sang PDF online miễn phí | OneTool",
      desc: "Convert DOCX/XLSX → PDF sạch để gửi, in, nộp hồ sơ. Không cần cài Office — miễn phí trên trình duyệt."
    },
    "convert-document": {
      title: "PDF sang TXT online — chuyển tới tool OCR | OneTool",
      desc: "Lối tắt mở công cụ PDF sang TXT (OCR tiếng Việt) trên OneTool. Miễn phí."
    },
    "convert-data": {
      title: "CSV ↔ JSON online miễn phí | OneTool",
      desc: "Chuyển CSV sang JSON / JSON sang CSV online. Dán hoặc mở file, tải kết quả — miễn phí, không đăng ký."
    },
    "excel-convert": {
      title: "Excel ↔ CSV/JSON online miễn phí | OneTool",
      desc: "Excel sang CSV/JSON và ngược lại. Chọn sheet, xem trước, tải file — miễn phí trên trình duyệt."
    },
    "vietqr": {
      title: "Tạo mã VietQR online miễn phí — QR chuyển khoản | OneTool",
      desc: "Tạo VietQR NAPAS: ngân hàng, STK, số tiền, nội dung CK — tải PNG. Miễn phí, không đăng ký."
    },
    "salary-calculator": {
      title: "Tính lương Gross sang Net 2026 — thuế TNCN 5 bậc, BHXH mới | OneTool",
      desc: "Đổi lương Gross ↔ Net theo luật 2026: giảm trừ 15,5 triệu, người phụ thuộc 6,2 triệu, thuế TNCN 5 bậc, trần BHXH 50,6 triệu. Miễn phí, không đăng ký."
    },
    "loan-calculator": {
      title: "Tính lãi vay trả góp ngân hàng — lịch trả nợ | OneTool",
      desc: "Tính tiền trả góp hàng tháng khi vay mua nhà, mua xe: dư nợ giảm dần, trả đều, lãi phẳng, lãi suất ưu đãi rồi thả nổi. Có lịch trả nợ từng tháng. Miễn phí."
    },
    "savings-calculator": {
      title: "Tính lãi tiết kiệm ngân hàng online 2026 | OneTool",
      desc: "Tính tiền lãi gửi tiết kiệm theo số tiền, lãi suất, kỳ hạn: lĩnh lãi cuối kỳ, hàng tháng, tái tục gốc lãi hoặc gửi tích lũy mỗi tháng. Miễn phí, không đăng ký."
    },
    "bhxh-calculator": {
      title: "Tính BHXH một lần online — rút được bao nhiêu? | OneTool",
      desc: "Ước tính tiền rút bảo hiểm xã hội một lần theo số năm đóng và lương bình quân: 1,5 tháng lương cho năm trước 2014, 2 tháng từ 2014, làm tròn tháng lẻ. Miễn phí."
    },
    "number-to-words": {
      title: "Đổi số thành chữ online miễn phí — số tiền bằng chữ | OneTool",
      desc: "Nhập số → ra chữ ngay: 1.250.000 thành Một triệu hai trăm năm mươi nghìn đồng. Viết hóa đơn, hợp đồng — không đăng ký."
    },
    "qr-generator": {
      title: "Tạo mã QR online miễn phí — QR code từ link | OneTool",
      desc: "Tạo QR từ link hoặc văn bản, xem trước, tải PNG in/dán. Miễn phí, không cần đăng ký."
    },
    "lunar-calendar": {
      title: "Lịch âm hôm nay - Lịch vạn niên 2026 | OneTool",
      desc: "Xem lịch âm hôm nay, ngày hoàng đạo, giờ tốt, ngày lễ và đếm ngược Tết. Đổi ngày âm dương nhanh, lưu ngày giỗ hằng năm. Miễn phí."
    },
    "currency-convert": {
      title: "Đổi tiền tệ online — USD sang VND realtime | OneTool",
      desc: "Đổi USD/EUR/VND và 20+ loại tiền theo tỷ giá realtime. Đảo chiều nhanh — miễn phí."
    },
    "barcode-generator": {
      title: "Tạo mã vạch online miễn phí — EAN CODE128 | OneTool",
      desc: "Tạo barcode CODE128, EAN-13, CODE39, UPC. Xem trước, tải PNG — miễn phí, không đăng ký."
    },
    "password-generator": {
      title: "Tạo mật khẩu mạnh online miễn phí | OneTool",
      desc: "Sinh mật khẩu ngẫu nhiên: chữ hoa, số, ký tự đặc biệt, đo độ mạnh. Miễn phí ngay trên trình duyệt."
    },
    "text-convert": {
      title: "Bỏ dấu tiếng Việt online — hoa thường, slug | OneTool",
      desc: "Bỏ dấu tiếng Việt, viết hoa/thường, Title Case, slug URL. Miễn phí, không cần đăng ký."
    },
    "unit-convert": {
      title: "Đổi đơn vị online — kg, inch, độ C, MB, ha, psi | OneTool",
      desc: "Chuyển đổi 13 nhóm đơn vị: khối lượng, chiều dài, nhiệt độ, dung lượng, diện tích, áp suất… Hệ số chuẩn quốc tế, kết quả tức thì, miễn phí."
    },
    "unit-mass": {
      title: "Đổi kg sang lb, pound sang kg online | OneTool",
      desc: "1 kg = 2,2046 lb, 1 lb = 0,4536 kg. Đổi kg, pound, ounce, gram, tấn, carat tức thì, kèm bảng quy đổi thường dùng. Miễn phí."
    },
    "unit-length": {
      title: "Đổi inch sang cm, feet sang mét online | OneTool",
      desc: "1 inch = 2,54 cm, 1 ft = 30,48 cm. Đổi chiều cao feet sang cm, inch màn hình, dặm sang km tức thì, có bảng quy đổi."
    },
    "unit-area": {
      title: "Đổi m² sang hecta, acre online — sào, mẫu | OneTool",
      desc: "1 ha = 10.000 m², 1 acre ≈ 4.047 m², 1 sào Bắc Bộ = 360 m². Đổi diện tích m², ha, km², ft² tức thì."
    },
    "unit-volume": {
      title: "Đổi lít sang ml, gallon, m³ online | OneTool",
      desc: "1 m³ = 1.000 lít, 1 gallon Mỹ = 3,785 L, 1 cup = 236,6 mL. Đổi thể tích lít, mL, muỗng, fl oz tức thì."
    },
    "unit-temp": {
      title: "Đổi độ C sang độ F online — công thức °C ↔ °F | OneTool",
      desc: "°F = °C × 1,8 + 32. Đổi độ C, độ F, Kelvin tức thì: 37 °C = 98,6 °F, 350 °F ≈ 177 °C. Có bảng mốc nhiệt độ thường gặp."
    },
    "unit-speed": {
      title: "Đổi km/h sang m/s, mph, knot online | OneTool",
      desc: "1 m/s = 3,6 km/h, 1 mph = 1,609 km/h, 1 knot = 1,852 km/h. Đổi tốc độ tức thì, có bảng quy đổi."
    },
    "unit-time": {
      title: "Đổi giờ, phút, giây online — 1 ngày bao nhiêu giây | OneTool",
      desc: "Đổi giây, phút, giờ, ngày, tuần, mili giây tức thì. 1 ngày = 86.400 giây, 1,5 giờ = 90 phút."
    },
    "unit-data": {
      title: "Đổi MB sang GB, GB sang TB online — MB và MiB | OneTool",
      desc: "1 GB = 1.000 MB, 1 GiB = 1.024 MiB. Vì sao ổ 1 TB chỉ hiện 931 GB? Đổi byte, KB, MB, GB, TB tức thì."
    },
    "unit-energy": {
      title: "Đổi kWh sang kcal, joule, BTU online | OneTool",
      desc: "1 kWh = 3,6 MJ ≈ 860 kcal, 1 kcal = 4,184 kJ. Đổi năng lượng J, kWh, calo, BTU tức thì."
    },
    "unit-pressure": {
      title: "Đổi psi sang bar, atm, Pa online — áp suất lốp | OneTool",
      desc: "1 bar ≈ 14,5 psi, 1 atm = 101.325 Pa. Đổi áp suất psi, bar, atm, kPa, mmHg tức thì, có bảng áp suất lốp."
    },
    "unit-power": {
      title: "Đổi kW sang mã lực HP online — BTU/h | OneTool",
      desc: "1 HP = 745,7 W, 1 kW ≈ 1,341 HP. Đổi W, kW, mã lực, BTU/h tức thì; điều hòa 9.000 BTU là bao nhiêu kW."
    },
    "unit-angle": {
      title: "Đổi độ sang radian online — công thức độ ↔ rad | OneTool",
      desc: "rad = độ × π/180, 1 rad ≈ 57,3°. Đổi độ, radian, grad, phút giây cung tức thì."
    },
    "unit-fuel": {
      title: "Đổi L/100km sang mpg, km/lít online | OneTool",
      desc: "mpg (Mỹ) = 235,215 ÷ L/100km. Đổi lít/100 km, km/lít, mpg Mỹ và Anh tức thì, có ví dụ xe máy, ô tô."
    },
    "json-tools": {
      title: "Format JSON online miễn phí — làm đẹp, minify, kiểm tra | OneTool",
      desc: "Làm đẹp / minify / kiểm tra lỗi JSON online. Miễn phí, không cần đăng ký."
    },
    "regex-tester": {
      title: "Test regex online miễn phí — highlight match | OneTool",
      desc: "Regex tester: thử biểu thức, highlight match, flags, replace. Miễn phí ngay trên trình duyệt."
    },
    "base64-tools": {
      title: "Encode/Decode Base64 online miễn phí | OneTool",
      desc: "Encode decode Base64 UTF-8 tiếng Việt, URL-safe, file/ảnh. Miễn phí, không đăng ký."
    },
    "url-encode": {
      title: "URL encode/decode online miễn phí | OneTool",
      desc: "URL encode & decode: encodeURIComponent, form (+), UTF-8 tiếng Việt — miễn phí."
    },
    "developer-tools": {
      title: "Tạo UUID · hash SHA-256 · slugify online | OneTool",
      desc: "UUID v4, hash SHA-256, slugify tiếng Việt, Unix timestamp online — miễn phí, không đăng ký."
    },
    "blog-index": {
      title: "Blog OneTool — Hướng dẫn PDF, ảnh, TikTok, VietQR, tính lương",
      desc: "Hướng dẫn tính lương Net 2026, PDF sang Word, HEIC sang JPG, tải TikTok không logo, video sang MP3, VietQR, ký PDF, xóa nền — tool online miễn phí."
    }
  },

  seo: {
    "remove-background": {
      keywords: "xóa nền ảnh, xóa nền ảnh online, xóa nền ảnh miễn phí, xóa background ảnh, tách nền ảnh, remove background online, png trong suốt, xóa nền shopee",
      howto: [
        "Tải ảnh chân dung, sản phẩm hoặc logo (JPG, PNG, WebP).",
        "Bấm Xóa nền — hệ thống tự nhận diện và tách chủ thể khỏi phông.",
        "Xem preview trên nền caro rồi tải PNG trong suốt về máy."
      ],
      faqs: [
        {
          q: "Xóa nền ảnh online có miễn phí không?",
          a: "Có. OneTool cho phép **xóa nền ảnh miễn phí**, xem preview và tải **PNG trong suốt** mà không cần đăng ký."
        },
        {
          q: "Ảnh nào xóa nền đẹp nhất?",
          a: "Ảnh sản phẩm nền sạch, chân dung ánh sáng đều, hoặc logo/ chữ trên phông trơn cho viền sắc nét hơn. Ảnh đêm nhiều người vẫn có thể dùng nhưng chất lượng AI trên trình duyệt sẽ hạn chế hơn."
        },
        {
          q: "File xuất ra là gì?",
          a: "Kết quả là **PNG** có kênh alpha (nền trong suốt), sẵn sàng ghép Shopee, Canva, banner hoặc ảnh thẻ."
        },
        {
          q: "Ảnh có bị upload lên server không?",
          a: "Xử lý chạy trên trình duyệt của bạn (model AI tải về máy). Không cần tạo tài khoản để dùng tool."
        }
      ],
      sections: [
        {
          title: "Xóa nền ảnh online là gì?",
          paras: [
            "**Xóa nền ảnh** (remove background) tách người, sản phẩm hoặc logo khỏi phông, giữ chủ thể trên nền trong suốt. Kết quả thường là **PNG**, dễ ghép banner, đăng Shopee/Lazada, làm ảnh thẻ hoặc thiết kế social.",
            "Trên OneTool bạn chỉ cần thả ảnh và bấm **Xóa nền** — hệ thống tự nhận diện logo/chữ nền trơn hoặc ảnh người rồi xuất file PNG."
          ]
        },
        {
          title: "Cách xóa nền ảnh miễn phí trên OneTool",
          paras: [
            "Thả ảnh vào khung (JPG, PNG, WebP), bấm **Xóa nền**, xem preview trên nền caro / sáng / tối rồi chọn **Tải PNG**. Không cần cài app, không watermark.",
            "Lần đầu tải model AI có thể mất thêm vài chục giây; lần sau thường nhanh hơn nhờ bộ nhớ đệm trình duyệt."
          ]
        },
        {
          title: "Khi nào nên xóa nền ảnh",
          paras: ["Một số tình huống phổ biến:"],
          list: [
            { title: "Ảnh bán hàng", text: "đặt sản phẩm lên nền trắng hoặc banner khuyến mãi." },
            { title: "Ảnh thẻ / CV", text: "tách người khỏi phông rồi ghép nền đồng phục." },
            { title: "Logo / chữ", text: "tách logo khỏi phông trơn để dùng trên web hoặc ấn phẩm." },
            { title: "Thiết kế social", text: "xuất PNG trong suốt để chồng chữ lên Shorts hoặc Reels." }
          ]
        },
        {
          title: "Mẹo để viền đẹp hơn",
          paras: [
            "Chụp / crop chủ thể rõ, tránh nền rối hoặc ánh sáng quá tối. Sau khi xóa nền, có thể **nén ảnh** hoặc **resize** trước khi đăng web để trang tải nhanh hơn."
          ]
        }
      ]
    },
    "image-convert": {
      keywords: "đổi định dạng ảnh, đổi ảnh jpg sang png, png sang jpg, webp sang jpg, convert ảnh online, chuyển định dạng ảnh online miễn phí",
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
    "image-crop": {
      keywords: "crop ảnh, cắt ảnh online, crop ảnh instagram, crop tiktok, preset mạng xã hội, ảnh thẻ 3x4, crop 1:1 shopee, cắt ảnh facebook miễn phí",
      howto: [
        "Tải ảnh JPG / PNG / WebP lên (hoặc dán Ctrl+V).",
        "Chọn tỉ lệ hoặc preset MXH (Instagram, TikTok, Shopee, ảnh thẻ…).",
        "Kéo khung cắt, xoay/lật nếu cần, rồi bấm Tải ảnh đã crop."
      ],
      faqs: [
        {
          q: "Crop ảnh online có miễn phí không?",
          a: "Có. OneTool cho **crop / cắt ảnh miễn phí** theo tỉ lệ và preset mạng xã hội — không cần đăng ký."
        },
        {
          q: "Có preset Instagram, TikTok, Shopee không?",
          a: "Có. Chọn sẵn **Instagram vuông/dọc/Story**, **TikTok 9:16**, **YouTube thumbnail**, **ảnh bìa Facebook**, **Shopee 1:1**, **ảnh thẻ 3×4** và nhiều kích thước khác."
        },
        {
          q: "Ảnh có bị upload lên server không?",
          a: "Không. Toàn bộ cắt ảnh chạy **trên trình duyệt** — file không gửi lên server OneTool."
        },
        {
          q: "Crop tròn để làm avatar được không?",
          a: "Được. Chọn hình **Tròn** (khóa 1:1), xuất **PNG** hoặc **WebP** để giữ nền trong suốt; JPG sẽ nền trắng."
        }
      ],
      sections: [
        {
          title: "Crop ảnh online là gì?",
          paras: [
            "**Crop / cắt ảnh** là chọn một vùng trên ảnh gốc rồi xuất ra kích thước mới — dùng cho avatar, feed Instagram, video dọc TikTok/Reels, ảnh sản phẩm Shopee hoặc **ảnh thẻ 3×4**."
          ]
        },
        {
          title: "Preset mạng xã hội có sẵn",
          list: [
            { title: "Instagram & Reels", text: "vuông 1080×1080, dọc 4:5, Story/Reels 9:16." },
            { title: "TikTok & YouTube", text: "TikTok 1080×1920, thumbnail 1280×720, Shorts 9:16." },
            { title: "Facebook & Shopee", text: "bài viết 1200×630, ảnh bìa, sản phẩm 1:1, ảnh thẻ 3×4." }
          ]
        },
        {
          title: "Cách cắt ảnh chuẩn MXH",
          paras: [
            "Upload ảnh, chọn preset đúng nền tảng, kéo khung (có lưới 1/3), chọn xuất **đúng vùng cắt** hoặc **scale theo preset**, rồi tải JPG / PNG / WebP."
          ]
        }
      ]
    },
    "image-ocr": {
      keywords: "ocr ảnh, ocr tiếng việt, ocr tiếng anh, ảnh sang chữ, chuyển ảnh thành văn bản, ocr hóa đơn, ocr cccd, image to text miễn phí",
      howto: [
        "Tải hoặc dán ảnh có chữ (JPG / PNG / WebP).",
        "Chọn ngôn ngữ (Việt + Anh mặc định, đọc cả hai) rồi bấm Nhận dạng chữ.",
        "Sửa văn bản nếu cần, rồi sao chép hoặc tải file TXT."
      ],
      faqs: [
        {
          q: "OCR ảnh online có miễn phí không?",
          a: "Có. OneTool **OCR ảnh → chữ miễn phí**, đọc **tiếng Việt (có dấu)** và **tiếng Anh** (kể cả lẫn trong cùng ảnh), không cần đăng ký."
        },
        {
          q: "Ảnh có bị upload lên server không?",
          a: "Ảnh được gửi **tạm thời** tới dịch vụ AI (cùng hạ tầng Tóm tắt AI / Audio → Text) để đọc chữ cho chính xác — OneTool không lưu ảnh. Không cần đăng ký."
        },
        {
          q: "OCR được CCCD, hóa đơn, sách không?",
          a: "Được với ảnh rõ, thẳng, đủ sáng. AI đọc **cả tiếng Việt và tiếng Anh**, giữ dấu thanh. Có thể **kéo vùng chọn** nếu chỉ cần một phần. Số liệu quan trọng nên rà lại."
        },
        {
          q: "Muốn xuất bảng Excel thì sao?",
          a: "Dùng tool **OCR bảng → Excel** nếu ảnh là bảng / biên lai nhiều cột. Tool này xuất **văn bản thuần** (TXT)."
        }
      ],
      sections: [
        {
          title: "OCR ảnh sang chữ là gì?",
          paras: [
            "**OCR (Optical Character Recognition)** đọc chữ trong ảnh rồi biến thành văn bản có thể copy, tìm kiếm, chỉnh sửa — hóa đơn, CCCD, ghi chú, screenshot, trang sách. Hỗ trợ **tiếng Việt có dấu** và **tiếng Anh** trong cùng một ảnh."
          ]
        },
        {
          title: "Mẹo nhận dạng chính xác hơn",
          list: [
            { title: "Ảnh rõ", text: "chụp thẳng, đủ sáng, tránh bóng và nghiêng." },
            { title: "Vùng chọn", text: "chỉ OCR phần cần thiết nếu ảnh có nhiều nhiễu." },
            { title: "Xoay ảnh", text: "xoay đúng chiều trước khi nhận dạng." }
          ]
        }
      ]
    },
    "image-resize": {
      keywords: "đổi kích thước ảnh, đổi kích thước ảnh online, resize ảnh, thu nhỏ ảnh, phóng to ảnh theo pixel miễn phí",
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
    "image-blur": {
      keywords: "làm mờ ảnh, blur ảnh online, làm mờ vùng ảnh, che thông tin trên ảnh, gaussian blur miễn phí",
      howto: [
        "Tải ảnh JPG / PNG / WebP lên.",
        "Chọn làm mờ toàn ảnh hoặc kéo chọn vùng cần che.",
        "Chỉnh độ mờ, xem trước rồi tải kết quả."
      ],
      sections: [
        {
          title: "Làm mờ ảnh là gì?",
          paras: [
            "**Làm mờ / blur ảnh** dùng hiệu ứng Gaussian để làm nhòe toàn khung hoặc một vùng — thường để ẩn CCCD, biển số, mặt người, hoặc tạo nền bokeh."
          ]
        },
        {
          title: "Toàn ảnh hay vùng chọn?",
          list: [
            { title: "Toàn ảnh", text: "làm mờ cả bức — phù hợp nền slide, thumbnail mờ." },
            { title: "Vùng chọn", text: "kéo khung trên ảnh gốc để chỉ che phần nhạy cảm." },
            { title: "Viền mềm", text: "feather giúp mép vùng mờ tự nhiên hơn." }
          ]
        },
        {
          title: "Riêng tư",
          paras: [
            "Ảnh xử lý trên trình duyệt bằng Canvas — không upload lên server OneTool."
          ]
        }
      ]
    },
    "image-compress": {
      keywords: "nén ảnh, compress image, giảm dung lượng ảnh, nén jpg webp, nén ảnh online miễn phí",
      howto: [
        "Tải ảnh JPG, PNG hoặc WebP lên.",
        "Chọn mức nén (Cân bằng / Mạnh) hoặc tùy chỉnh chất lượng.",
        "Xem % tiết kiệm, so sánh trước/sau rồi tải ảnh đã nén."
      ],
      faqs: [
        {
          q: "Nén ảnh online có miễn phí không?",
          a: "Có. **Nén ảnh** JPG/PNG/WebP trên OneTool miễn phí, xem % tiết kiệm và so sánh trước/sau."
        },
        {
          q: "Nén ảnh có bị vỡ không?",
          a: "Mức **Cân bằng** thường đủ dùng web/Zalo. Chọn **Nhẹ** nếu cần giữ chi tiết; **Mạnh** khi form upload giới hạn MB."
        }
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
      faqs: [
        {
          q: "Tải TikTok không logo có miễn phí không?",
          a: "Có. Dán link công khai để lấy **MP4 HD không watermark** hoặc MP3 — chỉ dùng khi bạn có quyền với nội dung."
        },
        {
          q: "Video riêng tư tải được không?",
          a: "Không. Chỉ hỗ trợ link công khai còn hiệu lực (tiktok.com, vt.tiktok.com, vm.tiktok.com)."
        }
      ],
      sections: [
        {
          title: "Tải TikTok không logo là gì?",
          paras: [
            "**Tải TikTok không logo** lấy file MP4 từ link công khai cho nội dung bạn sở hữu hoặc được phép sử dụng. Có thể tải MP3 hoặc ảnh slideshow; hãy tôn trọng bản quyền và điều khoản của TikTok."
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
      keywords: "chuyển giọng nói thành văn bản, audio to text tiếng việt, speech to text, chuyển mp3 thành chữ, phụ đề srt miễn phí",
      howto: [
        "Thả file MP3, WAV, M4A hoặc video MP4/MOV.",
        "Chọn tiếng Việt (hoặc tự nhận diện) rồi bấm Nhận dạng.",
        "Sao chép văn bản, tải TXT hoặc phụ đề SRT."
      ],
      faqs: [
        {
          q: "Audio to Text tiếng Việt có miễn phí không?",
          a: "Có. Chuyển giọng nói thành văn bản từ MP3/WAV/MP4, xuất **TXT** và phụ đề **SRT**."
        },
        {
          q: "File có bị lưu trên server không?",
          a: "File được xử lý đám mây tạm thời để nhận diện giọng nói — không cần tạo tài khoản OneTool để dùng."
        }
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
    "subtitle-srt": {
      keywords: "tạo phụ đề srt, video sang srt, mp3 sang phụ đề, phụ đề tiếng việt, auto subtitle, speech to srt, phụ đề youtube capcut",
      howto: [
        "Thả video MP4/MOV hoặc file MP3/WAV.",
        "Chọn tiếng Việt (hoặc tự nhận diện) rồi bấm Tạo phụ đề SRT.",
        "Tải file .srt và gắn vào CapCut, YouTube hoặc Premiere."
      ],
      faqs: [
        {
          q: "Tạo phụ đề SRT online có miễn phí không?",
          a: "Có. OneTool nhận diện giọng nói từ **video hoặc MP3**, xuất file **SRT** có time-code — không cần đăng ký."
        },
        {
          q: "Gắn file SRT vào đâu?",
          a: "Kéo file `.srt` vào **CapCut**, **Premiere**, **VNVE**, hoặc tải lên **YouTube Studio → Phụ đề**. Một số trình phát video cũng nhận SRT cùng tên với file MP4."
        },
        {
          q: "File có bị lưu trên server không?",
          a: "File được xử lý đám mây tạm thời để nhận diện giọng nói — không cần tạo tài khoản OneTool để dùng."
        }
      ],
      sections: [
        {
          title: "Phụ đề SRT là gì?",
          paras: [
            "**SRT** là file phụ đề có số thứ tự, mốc thời gian và lời thoại. OneTool chuyển **video / MP3** thành SRT tiếng Việt để gắn vào video đăng YouTube, TikTok (CapCut) hoặc Premiere."
          ]
        },
        {
          title: "Cách tạo phụ đề SRT từ video",
          paras: [
            "Thả MP4, MOV hoặc MP3, chọn **Tiếng Việt**, bấm **Tạo phụ đề SRT**. Khi xong, tải `.srt` — có thể sao chép nội dung hoặc tải thêm bản TXT nếu cần sửa bài."
          ]
        },
        {
          title: "Dùng phụ đề SRT để làm gì",
          list: [
            { title: "YouTube / Shorts", text: "upload SRT trong YouTube Studio để bật CC." },
            { title: "CapCut / Premiere", text: "kéo file SRT vào timeline, chỉnh câu cho khớp miệng." },
            { title: "Học / họp", text: "xem lại lời thoại có time-code thay vì nghe cả clip." }
          ]
        }
      ]
    },
    "text-to-speech": {
      keywords: "text to speech tiếng việt, văn bản thành giọng nói, chuyển chữ thành giọng nói, đọc văn bản online, tts việt nam miễn phí",
      howto: [
        "Dán văn bản tiếng Việt (tối đa 8.000 ký tự) hoặc mở file .txt.",
        "Chọn giọng nam/nữ, phong cách và tốc độ.",
        "Bấm Nghe thử trên máy, hoặc Tạo file âm thanh rồi tải WAV."
      ],
      faqs: [
        {
          q: "Text to speech tiếng Việt có miễn phí không?",
          a: "Có. OneTool đọc văn bản thành **giọng nói tiếng Việt**, nghe thử ngay trên máy và **tải file WAV** — không cần đăng ký."
        },
        {
          q: "Văn bản có bị lưu không?",
          a: "Nghe thử chạy trên trình duyệt. Tạo file WAV gửi **tạm thời** tới dịch vụ đọc — OneTool không lưu văn bản hay file âm thanh."
        },
        {
          q: "Đọc được tiếng Anh không?",
          a: "Có. Dán đoạn tiếng Anh hoặc lẫn Việt–Anh. Giọng tối ưu cho **tiếng Việt**."
        }
      ],
      sections: [
        {
          title: "Text to speech tiếng Việt là gì?",
          paras: [
            "**Text to speech (TTS)** chuyển chữ thành giọng đọc. OneTool hỗ trợ **tiếng Việt**: chọn giọng nam/nữ, nghe thử, tải **WAV** để gắn video, học từ hoặc voice-over."
          ]
        },
        {
          title: "Cách chuyển văn bản thành giọng nói",
          paras: [
            "Dán đoạn cần đọc, chọn giọng, bấm **Nghe thử** (chạy trên máy) hoặc **Tạo file âm thanh** để tải file. Tối đa 8.000 ký tự mỗi lần."
          ]
        },
        {
          title: "Dùng giọng đọc để làm gì",
          list: [
            { title: "Học tập", text: "nghe lại bài, luyện phát âm, đọc cho người khiếm thị." },
            { title: "Nội dung", text: "voice-over TikTok, Reels, video hướng dẫn." },
            { title: "Công việc", text: "nghe email / biên bản khi đang di chuyển." }
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
    "video-to-mp3": {
      keywords: "video sang mp3, tách mp3 từ video, mp4 sang mp3, convert video to mp3, tách nhạc mp4 online miễn phí",
      howto: [
        "Thả file video (MP4, MOV, MKV, WebM…).",
        "Bấm Tách MP3 — trình duyệt lấy audio, bỏ hình.",
        "Nghe thử rồi tải file MP3 192kbps về máy."
      ],
      faqs: [
        {
          q: "Chuyển video sang MP3 có miễn phí không?",
          a: "Có. OneTool **tách MP3** từ MP4/MOV/MKV ngay trên trình duyệt — không cần đăng ký, không watermark."
        },
        {
          q: "Video có bị upload lên server không?",
          a: "Không. FFmpeg chạy trong trình duyệt — file video **không gửi lên server** OneTool."
        }
      ],
      sections: [
        {
          title: "Video sang MP3 là gì?",
          paras: [
            "**Video → MP3** tách phần âm thanh khỏi clip thành file **MP3 192kbps**. Dùng khi chỉ cần nhạc / lời thoại, không cần hình."
          ]
        },
        {
          title: "Cách tách MP3 từ video online",
          paras: [
            "Thả MP4, MOV, MKV hoặc WebM, bấm **Tách MP3**. Lần đầu trình duyệt tải bộ xử lý (~25 MB); lần sau cache sẵn. Nghe thử rồi tải file về máy."
          ]
        },
        {
          title: "Khi nào nên tách MP3",
          list: [
            { title: "Nhạc / podcast", text: "lấy audio từ video YouTube đã tải về máy (khi bạn có quyền)." },
            { title: "Học tập", text: "nghe lại bài giảng, bỏ phần hình để tiết kiệm dung lượng." },
            { title: "Nén video", text: "nếu cần giảm dung lượng cả hình, dùng công cụ **Nén video online**." }
          ]
        }
      ]
    },
    "video-to-gif": {
      keywords: "video sang gif, mp4 to gif, convert video to gif, tạo gif từ video online miễn phí, cắt video thành gif",
      howto: [
        "Thả video (MP4, MOV, WebM, MKV…).",
        "Chọn điểm bắt đầu và độ dài (tối đa 12 giây).",
        "Chọn FPS, độ rộng và chất lượng.",
        "Bấm Tạo GIF và tải file về máy."
      ],
      sections: [
        {
          title: "Video sang GIF là gì?",
          paras: [
            "**Video → GIF** cắt một đoạn clip ngắn thành ảnh động **GIF** để gửi chat, đăng mạng xã hội hoặc nhúng web — không cần phần mềm cài đặt."
          ]
        },
        {
          title: "Cách tạo GIF đẹp, nhẹ",
          list: [
            { title: "Đoạn ngắn", text: "≤ 3–6 giây thường đủ và file nhẹ hơn." },
            { title: "480px + 10 fps", text: "cân bằng nét và dung lượng (khuyến nghị)." },
            { title: "Palette đẹp", text: "chế độ 2 bước cho màu ổn định hơn." }
          ]
        },
        {
          title: "Riêng tư trên máy bạn",
          paras: [
            "Chuyển đổi chạy bằng FFmpeg trong trình duyệt — video không upload lên server OneTool."
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
      keywords: "heic sang jpg, heic sang jpg online, đổi heic sang jpg, ảnh iphone sang jpg, heif to jpg, convert heic miễn phí",
      howto: [
        "Thả một hoặc nhiều file HEIC/HEIF (ảnh iPhone).",
        "Chọn JPG, PNG hoặc WebP và chỉnh chất lượng.",
        "Bấm Convert — tải từng file hoặc ZIP cả bộ."
      ],
      faqs: [
        {
          q: "HEIC sang JPG có miễn phí không?",
          a: "Có. Đổi **HEIC/HEIF → JPG/PNG/WebP** trên OneTool miễn phí, hỗ trợ nhiều ảnh và tải ZIP."
        },
        {
          q: "Vì sao Windows không mở được ảnh iPhone?",
          a: "iPhone mặc định lưu **HEIC**. Nhiều máy Windows/web chưa hỗ trợ — đổi sang JPG là cách nhanh nhất để gửi và đăng bài."
        },
        {
          q: "Có mất chất lượng không?",
          a: "JPG là nén có mất mát — chỉnh chất lượng cao nếu cần in. PNG giữ nét hơn nhưng nặng hơn."
        }
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
      keywords: "đếm từ online, word counter tiếng việt, đếm ký tự, thời gian đọc bài viết, đếm từ seo",
      howto: [
        "Dán văn bản hoặc mở file TXT.",
        "Xem ngay số từ, ký tự, câu, đoạn.",
        "Theo dõi thời gian đọc và mật độ từ khóa."
      ],
      faqs: [
        {
          q: "Đếm từ online tiếng Việt có chính xác không?",
          a: "OneTool đếm theo token tách khoảng trắng — phù hợp tiếng Việt (mỗi tiếng một đơn vị), kèm thời gian đọc ước tính."
        },
        {
          q: "Có đếm ký tự không khoảng trắng không?",
          a: "Có — hiện số từ, ký tự (có/không khoảng trắng), câu và đoạn để viết bài SEO hoặc luận văn."
        }
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
      keywords: "ghép pdf, gộp pdf online, ghép pdf online, merge pdf miễn phí, nối file pdf, ghép pdf không upload, gộp nhiều file pdf",
      howto: [
        "Chọn từ 2 file PDF trở lên (kéo thả hoặc chọn từ máy).",
        "Sắp xếp thứ tự file nếu cần.",
        "Bấm Gộp PDF rồi tải tài liệu đã ghép."
      ],
      faqs: [
        {
          q: "Gộp PDF online có mất phí không?",
          a: "Không. OneTool cho **ghép PDF miễn phí**, không bắt buộc đăng ký và không gắn watermark."
        },
        {
          q: "File PDF có bị upload lên server không?",
          a: "Không. **Gộp PDF chạy trên trình duyệt** — nội dung không gửi lên server OneTool, phù hợp hợp đồng và hồ sơ cá nhân."
        },
        {
          q: "Ghép được bao nhiêu file?",
          a: "Bạn có thể chọn nhiều PDF cùng lúc, sắp xếp thứ tự rồi xuất một file. File quá lớn có thể chậm trên máy yếu."
        }
      ],
      sections: [
        {
          title: "Ghép PDF online miễn phí là gì?",
          paras: [
            "**Ghép PDF online** (gộp PDF / merge PDF) nối nhiều file thành một — ví dụ CV kèm chứng chỉ, hợp đồng kèm phụ lục — để nộp hoặc gửi một lần.",
            "OneTool xử lý **trên trình duyệt**: không upload server, không cần tài khoản, không giới hạn tác vụ ẩn."
          ]
        },
        {
          title: "Cách gộp nhiều PDF không cần tải lên",
          paras: [
            "Chọn ít nhất hai file PDF, kéo để sắp thứ tự, bấm **Gộp PDF** rồi tải kết quả. Không cần cài phần mềm, không bắt buộc đăng nhập."
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
      keywords: "nén pdf, nén pdf online, nén pdf miễn phí, giảm dung lượng pdf, compress pdf, nén pdf dưới 2mb, nén pdf gửi email, nén pdf zalo",
      howto: [
        "Tải file PDF cần giảm dung lượng.",
        "Chọn mức nén và chạy — xem phần trăm tiết kiệm.",
        "Tải bản PDF nhẹ hơn về máy."
      ],
      faqs: [
        {
          q: "Nén PDF online có miễn phí không?",
          a: "Có. **Nén PDF** trên OneTool miễn phí, xem % tiết kiệm rồi tải về ngay."
        },
        {
          q: "Nén PDF có mất chữ không?",
          a: "PDF toàn chữ thường giảm ít hơn. File scan/ảnh giảm mạnh hơn — chọn mức nén nhẹ nếu cần in sắc nét."
        },
        {
          q: "Làm sao để PDF dưới 2MB / 5MB?",
          a: "Chạy nén mức mạnh hơn, hoặc tách bớt trang rồi nén lại. Nhiều cổng nộp hồ sơ giới hạn 2–10 MB."
        }
      ],
      sections: [
        {
          title: "Nén PDF online là gì?",
          paras: [
            "**Nén PDF online** giảm dung lượng để gửi email, Zalo hoặc nộp cổng có giới hạn MB. File scan/ảnh thường nhẹ đi rõ hơn PDF toàn chữ.",
            "OneTool cho xem **% tiết kiệm** trước khi tải — dễ chọn mức nén phù hợp."
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
      keywords: "pdf sang word, pdf sang word online, chuyển pdf sang word, pdf to word, pdf to docx, convert pdf to word miễn phí",
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
    "pdf-to-excel": {
      keywords: "pdf sang excel, pdf sang excel online, chuyển pdf sang excel, pdf to excel, pdf to xlsx, trích bảng pdf miễn phí",
      howto: [
        "Thả hoặc chọn file PDF có bảng / báo cáo.",
        "Chọn mỗi trang một sheet hoặc gộp 1 sheet; OCR tự động nếu là bản scan.",
        "Bấm chuyển sang Excel và tải file .xlsx (hoặc CSV)."
      ],
      faqs: [
        {
          q: "PDF sang Excel có miễn phí không?",
          a: "Có. OneTool chuyển **PDF → Excel (XLSX)** miễn phí trên trình duyệt."
        },
        {
          q: "PDF scan có dùng được không?",
          a: "Được. Tool tự OCR tiếng Việt khi trang không có lớp chữ — kết quả nên kiểm tra lại cột số."
        },
        {
          q: "Bảng có chính xác 100% không?",
          a: "Bảng đơn giản thường ổn. Layout phức tạp / cột gộp có thể lệch — nên xem trước rồi chỉnh nhẹ trong Excel."
        }
      ],
      sections: [
        {
          title: "PDF sang Excel là gì?",
          paras: [
            "**PDF → Excel** trích bảng và số liệu từ PDF thành file **XLSX** để lọc, tính toán trong Microsoft Excel hoặc Google Sheets. OneTool gom cột/hàng theo vị trí chữ trên trang."
          ]
        },
        {
          title: "Khi nào dùng PDF sang Excel?",
          list: [
            { title: "Bảng biểu / báo cáo", text: "bảng lương, báo cáo bán hàng, danh sách từ PDF." },
            { title: "PDF có lớp chữ", text: "cho kết quả cột hàng chính xác nhất." },
            { title: "PDF scan", text: "bật OCR tiếng Việt để đọc chữ trong ảnh." }
          ]
        },
        {
          title: "Lưu ý độ chính xác",
          paras: [
            "Bảng phức tạp, nhiều cột gộp hoặc layout thiết kế có thể lệch cột. Bạn nên xem trước bảng trên trang rồi chỉnh nhẹ trong Excel nếu cần."
          ]
        }
      ]
    },
    "pdf-lock": {
      keywords: "khóa pdf, đặt mật khẩu pdf, bảo mật pdf, pdf password, encrypt pdf, khóa file pdf online miễn phí",
      howto: [
        "Thả hoặc chọn file PDF chưa khóa.",
        "Nhập mật khẩu mở file và xác nhận.",
        "Bấm khóa PDF rồi tải file đã mã hóa AES-256."
      ],
      sections: [
        {
          title: "Khóa PDF là gì?",
          paras: [
            "**Khóa PDF** (đặt mật khẩu mở file) mã hóa tài liệu bằng **AES-256** để người nhận phải nhập mật khẩu mới xem được nội dung — phù hợp gửi hồ sơ, hợp đồng, báo cáo tài chính."
          ]
        },
        {
          title: "Cách gửi file an toàn",
          list: [
            { title: "Mật khẩu riêng", text: "gửi mật khẩu qua Zalo/SMS, không ghi trong cùng email với file." },
            { title: "Độ mạnh", text: "nên ≥ 10 ký tự, có chữ hoa, thường và số." },
            { title: "PDF đã khóa", text: "tool này không mở / đổi mật khẩu file đã mã hóa sẵn." }
          ]
        },
        {
          title: "Riêng tư trên máy bạn",
          paras: [
            "Toàn bộ mã hóa chạy trong trình duyệt — file PDF không được upload lên server OneTool."
          ]
        }
      ]
    },
    "pdf-sign": {
      keywords: "ký pdf, ký pdf online, chữ ký pdf, sign pdf, đóng dấu chữ ký pdf, vẽ chữ ký pdf, chữ ký tay pdf miễn phí, ký hợp đồng pdf",
      howto: [
        "Thả file PDF cần ký.",
        "Tạo chữ ký: vẽ tay, gõ tên, tải ảnh hoặc chọn ngày.",
        "Bấm Đặt chữ ký lên PDF, rồi kéo đúng chỗ.",
        "Bấm Tải PDF đã ký."
      ],
      faqs: [
        {
          q: "Ký PDF online có miễn phí không?",
          a: "Có. OneTool cho **ký PDF miễn phí**: vẽ chữ ký tay, gõ tên font chữ ký, tải ảnh hoặc đóng dấu ngày — không cần đăng ký."
        },
        {
          q: "Chữ ký có phải chữ ký số (USB token) không?",
          a: "Đây là **chữ ký điện tử dạng ảnh** nhúng vào PDF (giống iLovePDF Sign): đủ dùng hợp đồng nội bộ, biên bản, phiếu giao. Không thay chứng thư số / USB token theo luật giao dịch điện tử."
        },
        {
          q: "File PDF có bị upload không?",
          a: "Không. Toàn bộ xử lý chạy **trên trình duyệt** — PDF và chữ ký không gửi lên server OneTool."
        },
        {
          q: "Ký được nhiều trang không?",
          a: "Được. Chọn chữ ký trên trang rồi bấm **Thêm mọi trang**."
        }
      ],
      sections: [
        {
          title: "Ký PDF online là gì?",
          paras: [
            "**Ký PDF** thêm chữ ký tay, họ tên, ngày ký hoặc dòng chữ ký lên tài liệu — hợp đồng, biên bản, phiếu giao, hồ sơ xin việc. Kết quả là PDF đã **flatten** chữ ký vào trang, mở được trên mọi máy."
          ]
        },
        {
          title: "Cách ký PDF miễn phí trên OneTool",
          paras: [
            "Thả PDF, chọn **Vẽ**, **Gõ tên**, **Ảnh** hoặc **Ngày**. Bấm **Đặt chữ ký lên PDF**, kéo đúng vị trí, rồi **Tải PDF đã ký**."
          ]
        },
        {
          title: "Nên ký kiểu nào?",
          list: [
            { title: "Vẽ tay", text: "nhanh trên điện thoại hoặc chuột — giống ký giấy." },
            { title: "Gõ tên", text: "chọn font Pacifico, Great Vibes… khi chưa có ảnh chữ ký." },
            { title: "Ảnh PNG", text: "chữ ký đã scan; nền trắng được tách gần trong suốt." },
            { title: "Ngày", text: "đóng dấu ngày ký theo định dạng tiếng Việt." }
          ]
        },
        {
          title: "Lưu chữ ký trên máy",
          paras: [
            "Chữ ký vừa đặt được lưu trên trình duyệt của bạn (không đưa lên server). Lần sau mở tool, bấm chữ ký đã lưu để đặt lại nhanh."
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
      keywords: "tạo mã qr, tạo qr code, tạo mã qr online, qr code từ link, tạo qr miễn phí, tải qr png",
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
            { title: "QR Wi‑Fi / SĐT / Email", text: "dùng preset sẵn trên tool." }
          ]
        }
      ]
    },
    "vietqr": {
      keywords: "tạo mã vietqr, vietqr ngân hàng, qr chuyển khoản, tạo qr mb bank, vietcombank qr, napas vietqr, qr thanh toán",
      howto: [
        "Chọn ngân hàng nhận tiền (mã BIN NAPAS).",
        "Nhập số tài khoản, tuỳ chọn số tiền và nội dung CK không dấu.",
        "Tạo mã, quét thử bằng app ngân hàng, rồi tải PNG."
      ],
      faqs: [
        {
          q: "VietQR khác mã QR thường thế nào?",
          a: "**VietQR** theo chuẩn NAPAS: app ngân hàng đọc BIN + STK + số tiền. QR text thường chỉ mở link web."
        },
        {
          q: "Có cần điền số tiền không?",
          a: "Không. Để trống thì người chuyển tự nhập số tiền trên app. Điền sẵn thì quét xong ra đúng số."
        }
      ],
      sections: [
        {
          title: "VietQR là gì?",
          paras: [
            "**VietQR** là mã QR chuyển khoản liên ngân hàng Việt Nam. Khách quét bằng app (MB, Vietcombank, MoMo ngân hàng…) là ra đúng STK, không gõ tay."
          ]
        },
        {
          title: "Cách tạo mã VietQR miễn phí",
          paras: [
            "Chọn ngân hàng, nhập STK, bấm **Tạo VietQR**, quét thử một lần rồi in hoặc gửi ảnh. Số tiền và nội dung CK là tuỳ chọn."
          ]
        }
      ]
    },
    "salary-calculator": {
      keywords: "tính lương gross sang net, tính lương net sang gross, tính thuế tncn 2026, cách tính lương net, bảo hiểm xã hội 2026, giảm trừ gia cảnh 15,5 triệu, biểu thuế 5 bậc",
      howto: [
        "Chọn chiều tính Gross → Net hoặc Net → Gross.",
        "Nhập mức lương, số người phụ thuộc và vùng nơi công ty hoạt động.",
        "Xem lương thực nhận, thuế TNCN từng bậc và tổng chi phí doanh nghiệp."
      ],
      faqs: [
        {
          q: "Lương Gross 20 triệu thì Net bao nhiêu năm 2026?",
          a: "Không có người phụ thuộc, đóng bảo hiểm trên đủ 20 triệu: bảo hiểm 2,1 triệu, thuế TNCN 120.000 đ — **lương Net khoảng 17.780.000 đ**."
        },
        {
          q: "Lương bao nhiêu thì phải đóng thuế TNCN?",
          a: "Không có người phụ thuộc và đóng bảo hiểm trên toàn bộ lương: từ khoảng **17,3 triệu/tháng** mới phát sinh thuế. Mỗi người phụ thuộc nâng ngưỡng thêm 6,2 triệu."
        },
        {
          q: "Kết quả có chính xác tuyệt đối không?",
          a: "Công cụ tính theo quy định chung cho người lao động cư trú. Phụ cấp miễn thuế hoặc chính sách riêng của công ty có thể làm số thực nhận khác đi."
        }
      ],
      sections: [
        {
          title: "Công thức tính lương Net 2026",
          paras: [
            "**Lương Net = Gross − Bảo hiểm (10,5%) − Thuế TNCN.** Giảm trừ bản thân 15,5 triệu, mỗi người phụ thuộc 6,2 triệu; thuế theo biểu 5 bậc 5% – 35%. Xem [hướng dẫn tính lương Net 2026 có ví dụ](blog/cach-tinh-luong-net-2026.html)."
          ]
        }
      ],
      related: ["loan-calculator", "bhxh-calculator", "number-to-words"]
    },
    "loan-calculator": {
      keywords: "tính lãi vay ngân hàng, tính lãi vay trả góp, vay mua nhà trả góp, vay mua xe trả góp, lãi suất dư nợ giảm dần, lãi phẳng, lịch trả nợ, vay 1 tỷ trả mỗi tháng bao nhiêu",
      howto: [
        "Chọn cách tính lãi: dư nợ giảm dần, trả đều hàng tháng hoặc lãi phẳng.",
        "Nhập số tiền vay, thời hạn và lãi suất; tick lãi suất ưu đãi nếu có.",
        "Xem tiền trả tháng đầu, tổng lãi, lịch trả nợ từng tháng và bảng so sánh ba cách tính."
      ],
      faqs: [
        {
          q: "Vay 1 tỷ trong 20 năm mỗi tháng trả bao nhiêu?",
          a: "Lãi suất 9%/năm theo dư nợ giảm dần: tháng đầu khoảng **11.666.667 đ** rồi giảm dần. Chọn trả đều thì mỗi tháng khoảng **8.997.000 đ**."
        },
        {
          q: "Nên chọn dư nợ giảm dần hay trả đều?",
          a: "Gốc chia đều có tổng lãi thấp hơn nhưng những tháng đầu trả nhiều. Trả đều nhẹ hơn lúc đầu nhưng tổng lãi cao hơn."
        },
        {
          q: "Lãi phẳng 1%/tháng tương đương bao nhiêu?",
          a: "Với khoản vay 12 tháng, lãi phẳng 12%/năm tương đương khoảng **21,5%/năm** tính theo dư nợ giảm dần."
        }
      ],
      sections: [
        {
          title: "Công thức tính lãi vay",
          paras: [
            "**Dư nợ giảm dần:** gốc mỗi tháng = Tiền vay ÷ Số tháng; lãi = Dư nợ còn lại × Lãi suất ÷ 12. **Trả đều:** mỗi tháng trả Tiền vay × r ÷ (1 − (1 + r)^−n)."
          ]
        }
      ],
      related: ["savings-calculator", "salary-calculator", "bhxh-calculator"]
    },
    "savings-calculator": {
      keywords: "tính lãi tiết kiệm, tính lãi gửi ngân hàng, gửi tiết kiệm 100 triệu lãi bao nhiêu, lãi suất tiết kiệm, lĩnh lãi hàng tháng, tái tục gốc và lãi, tiết kiệm tích lũy hàng tháng, lãi kép",
      howto: [
        "Chọn gửi một lần hoặc tích lũy hàng tháng, nhập số tiền và lãi suất %/năm.",
        "Chọn kỳ hạn và cách lĩnh lãi: cuối kỳ, hàng tháng hoặc tái tục.",
        "Xem tiền lãi, tổng nhận và bảng lãi theo tháng, theo kỳ hoặc theo năm."
      ],
      faqs: [
        {
          q: "Gửi 100 triệu lãi suất 5%/năm kỳ hạn 6 tháng được bao nhiêu?",
          a: "Tiền lãi là 100.000.000 × 5% × 6 ÷ 12 = **2.500.000 đ**, đáo hạn nhận 102.500.000 đ."
        },
        {
          q: "Gửi 1 tỷ mỗi tháng được bao nhiêu tiền lãi?",
          a: "Với lãi suất 5%/năm, mỗi tháng khoảng **4.166.667 đ** tiền lãi."
        },
        {
          q: "Tái tục gốc và lãi có lợi hơn rút lãi không?",
          a: "Có, nếu không cần tiêu tiền lãi: lãi kỳ trước được cộng vào gốc nên kỳ sau sinh lãi nhiều hơn."
        }
      ],
      sections: [
        {
          title: "Công thức tính lãi tiết kiệm",
          paras: [
            "**Tiền lãi = Số tiền gửi × Lãi suất (%/năm) × Số tháng gửi ÷ 12.** Ngân hàng thường tính theo số ngày thực gửi chia 365 nên có thể chênh vài nghìn đồng."
          ]
        }
      ],
      related: ["loan-calculator", "salary-calculator", "bhxh-calculator"]
    },
    "bhxh-calculator": {
      keywords: "tính bhxh một lần, rút bhxh một lần được bao nhiêu, cách tính bảo hiểm xã hội một lần, bhxh 1 lần 2026, đóng bhxh 5 năm rút được bao nhiêu, mức bình quân tiền lương đóng bhxh",
      howto: [
        "Nhập lương bình quân và thời gian đóng trước, từ năm 2014; hoặc nhập từng giai đoạn đóng.",
        "Điền hệ số trượt giá nếu biết để kết quả sát hơn.",
        "Xem số tiền BHXH một lần và diễn giải từng bước."
      ],
      faqs: [
        {
          q: "Đóng BHXH 5 năm rút một lần được bao nhiêu?",
          a: "Cả 5 năm đóng từ 2014 trở đi, lương bình quân 8 triệu: 2 × 8.000.000 × 5 = **80.000.000 đ**, chưa tính hệ số trượt giá."
        },
        {
          q: "Tháng lẻ được làm tròn thế nào?",
          a: "Từ 1 đến 6 tháng tính là nửa năm, từ 7 đến 11 tháng tính là một năm. Tháng lẻ trước 2014 được chuyển sang giai đoạn từ 2014."
        },
        {
          q: "Đóng chưa đủ 1 năm thì được bao nhiêu?",
          a: "Bằng số tiền đã đóng (22% tiền lương đóng BHXH × số tháng), tối đa 2 tháng lương bình quân."
        }
      ],
      sections: [
        {
          title: "Công thức tính BHXH một lần",
          paras: [
            "**1,5 tháng lương bình quân cho mỗi năm đóng trước 2014 và 2 tháng cho mỗi năm từ 2014.** Kết quả là ước tính; số chính thức do cơ quan BHXH tính khi giải quyết hồ sơ."
          ]
        }
      ],
      related: ["salary-calculator", "savings-calculator", "loan-calculator"]
    },
    "number-to-words": {
      keywords: "đọc số thành chữ, số thành chữ tiếng việt, số tiền bằng chữ, đổi số thành chữ, 1250000 bằng chữ, viết số tiền bằng chữ",
      howto: [
        "Nhập số (có thể dùng dấu chấm ngăn cách nghìn).",
        "Bật “đồng chẵn” nếu dùng cho hóa đơn.",
        "Sao chép câu chữ vào Word / PDF."
      ],
      faqs: [
        {
          q: "1.250.000 đọc thành chữ như thế nào?",
          a: "**Một triệu hai trăm năm mươi nghìn đồng chẵn** — đúng kiểu hóa đơn, hợp đồng tiếng Việt."
        }
      ],
      sections: [
        {
          title: "Đổi số thành chữ tiếng Việt là gì?",
          paras: [
            "Tool đọc số (kể cả số tiền) thành chữ: dùng trong **hóa đơn, hợp đồng, ủy nhiệm chi** để tránh sửa số."
          ]
        },
        {
          title: "Cách dùng",
          paras: [
            "Gõ hoặc dán số, tick **đồng chẵn** nếu cần, sao chép kết quả. Xử lý trên trình duyệt, không gửi số lên server."
          ]
        },
        {
          title: "Ghi lương bằng chữ trong hợp đồng",
          paras: [
            "Hợp đồng lao động thường ghi lương Gross cả bằng số và bằng chữ. Chưa rõ mức thực nhận? Dùng [máy tính lương Gross ↔ Net 2026](cong-cu-tien-ich/salary-calculator.html) để ra số Net sau bảo hiểm và thuế TNCN, rồi đổi sang chữ tại đây."
          ]
        }
      ],
      related: ["salary-calculator", "vietqr", "currency-convert"]
    },
    "lunar-calendar": {
      keywords: "lịch âm hôm nay, lịch vạn niên 2026, lịch âm 2026, xem ngày âm, ngày hoàng đạo, giờ hoàng đạo, xem ngày tốt xấu, xem ngày tốt khai trương, xem ngày cưới, đếm ngược tết, nhắc ngày giỗ âm lịch, đổi lịch âm dương, dương lịch sang âm lịch, can chi, tiết khí",
      howto: [
        "Mở tab Lịch tháng — hôm nay được tô màu, mỗi ô có cả ngày dương và ngày âm.",
        "Bấm vào một ngày để xem Can Chi, giờ hoàng đạo, trực ngày và việc nên làm / kiêng kỵ. Chọn việc ở dòng Tìm ngày tốt để lịch tô xanh các ngày hợp.",
        "Sang tab Đổi ngày để đổi Dương ↔ Âm cho ngày giỗ, sinh nhật âm — có tính tháng nhuận."
      ],
      sections: [
        {
          title: "Lịch âm hôm nay & lịch vạn niên",
          paras: [
            "Trang **lịch âm** hiển thị lịch tháng theo **âm lịch Việt Nam**: mỗi ô có ngày dương, ngày âm, mùng 1 và ngày rằm được đánh dấu, cùng các **ngày lễ** như Tết Nguyên đán, Giỗ Tổ Hùng Vương, Vu Lan, Trung thu, 30/4, 2/9.",
            "Bấm vào một ngày bất kỳ để xem **Can Chi** của ngày / tháng / năm, **tiết khí** và **giờ hoàng đạo**. Có thể chuyển nhanh sang tab **Đổi ngày** để đổi **Dương ↔ Âm** cho ngày giỗ, cưới hỏi, sinh nhật âm."
          ]
        },
        {
          title: "Lịch âm 2026 năm Bính Ngọ",
          paras: [
            "Năm âm lịch **Bính Ngọ** bắt đầu ngày **17/02/2026**, có 12 tháng, **không có tháng nhuận**. **Tết Đinh Mùi 2027** rơi vào Thứ Bảy **06/02/2027**; tháng Chạp thiếu nên giao thừa là đêm 29 tháng Chạp (05/02/2027)."
          ]
        },
        {
          title: "Xem ngày tốt theo việc",
          list: [
            { title: "Xem ngày tốt theo việc", text: "chọn cưới hỏi, khai trương, động thổ, về nhà mới, xuất hành, mua xe, ký hợp đồng — lịch lọc ngày hoàng đạo, trực hợp việc, tránh Tam nương, Nguyệt kỵ và ngày xung tuổi." },
            { title: "Việc nên làm / kiêng kỵ", text: "mỗi ngày có trực (Kiến, Trừ, Mãn…) kèm gợi ý nên làm và nên tránh." }
          ]
        },
        {
          title: "Âm lịch Việt Nam khác gì?",
          list: [
            { title: "Múi giờ +7", text: "tính theo Việt Nam (thuật toán Hồ Ngọc Đức)." },
            { title: "Tháng nhuận", text: "một số năm có thêm một tháng âm — nhớ tick đúng nếu đổi Âm → Dương." },
            { title: "Can Chi", text: "chu kỳ 60 năm / ngày — năm, tháng, ngày đều có tên Can Chi." }
          ]
        },
        {
          title: "Phạm vi năm",
          paras: [
            "Hỗ trợ khoảng **1800–2199**. Kết quả mang tính tham khảo; ngày lễ lớn nên đối chiếu thêm nguồn chính thức nếu cần chính xác tuyệt đối."
          ]
        }
      ],
      faqs: [
        {
          q: "Hôm nay là ngày bao nhiêu âm lịch?",
          a: "Mở trang là thấy ngay: ô **hôm nay** được tô màu trên lịch tháng, bảng bên cạnh ghi rõ ngày âm, tháng âm, năm Can Chi và còn bao nhiêu ngày đến mùng 1, rằm, Tết."
        },
        {
          q: "Tết Nguyên đán 2027 là ngày nào?",
          a: "Mùng 1 Tết Đinh Mùi là **Thứ Bảy 06/02/2027**. Năm Bính Ngọ có tháng Chạp thiếu nên không có ngày 30 Tết — giao thừa là đêm 29 tháng Chạp (05/02/2027). Trang có đồng hồ đếm ngược đến Tết."
        },
        {
          q: "Có lưu được ngày giỗ theo âm lịch không?",
          a: "Có. Ở mục **Ngày giỗ & sự kiện của tôi**, nhập tên và ngày âm (ví dụ giỗ 25/8 âm lịch) — lịch tự đánh dấu mỗi năm, đếm ngược số ngày còn lại và có nút thêm vào **Google Calendar**. Dữ liệu chỉ lưu trên trình duyệt của bạn."
        },
        {
          q: "Giờ hoàng đạo được tính thế nào?",
          a: "Theo cách tính truyền thống dựa trên **Chi của ngày**: mỗi ngày có 6 giờ hoàng đạo (mỗi giờ 2 tiếng). Thông tin mang tính tham khảo theo phong tục."
        },
        {
          q: "Đổi ngày âm sang dương có tính tháng nhuận không?",
          a: "Có. Ở tab **Đổi ngày**, chọn Âm → Dương và tick **tháng nhuận** nếu ngày cần đổi rơi vào tháng nhuận (ví dụ năm 2025 nhuận tháng 6)."
        },
        {
          q: "Lịch âm này có đúng múi giờ Việt Nam không?",
          a: "Có. Lịch tính theo **múi giờ +7** (thuật toán Hồ Ngọc Đức), nên ngày mùng 1 và Tết khớp với lịch Việt Nam, có thể lệch 1 ngày so với lịch Trung Quốc."
        },
        {
          q: "Làm sao xem ngày tốt để khai trương, cưới hỏi?",
          a: "Ở tab **Lịch tháng**, chọn việc ở dòng **Tìm ngày tốt** — các ngày hợp được tô xanh và liệt kê bên dưới kèm trực và sao hoàng đạo. Nội dung theo phong tục, chỉ mang tính tham khảo."
        }
      ]
    },
    "currency-convert": {
      keywords: "đổi tiền tệ, usd sang vnd, eur sang vnd, đổi đô sang việt nam đồng, tỷ giá hôm nay, currency converter online miễn phí",
      howto: [
        "Chọn tiền nguồn và tiền đích (mặc định USD → VND).",
        "Nhập số tiền — kết quả và tỷ giá hiện ngay.",
        "Bấm đảo chiều hoặc cặp nhanh; sao chép kết quả nếu cần."
      ],
      sections: [
        {
          title: "Đổi tiền tệ online là gì?",
          paras: [
            "**Đổi tiền tệ** quy đổi giữa các loại tiền (USD, EUR, VND…) theo tỷ giá tham khảo cập nhật theo ngày — tiện ước tính mua hàng quốc tế, du lịch, chuyển khoản."
          ]
        },
        {
          title: "Cặp phổ biến tại Việt Nam",
          list: [
            { title: "USD → VND", text: "ước tính giá hàng Mỹ / USD." },
            { title: "EUR → VND", text: "du lịch châu Âu, hàng EU." },
            { title: "JPY / CNY / KRW", text: "mua hàng Nhật · Trung · Hàn." }
          ]
        },
        {
          title: "Lưu ý tỷ giá",
          paras: [
            "Đây là tỷ giá **tham khảo** từ nguồn công khai, không phải tỷ giá mua/bán của ngân hàng hay tiệm vàng. Khi giao dịch thật hãy đối chiếu Vietcombank / Techcombank / BIDV."
          ]
        },
        {
          title: "Nhận lương bằng USD?",
          paras: [
            "Quy đổi lương USD sang VND ở đây, sau đó nhập số VND vào [máy tính lương Gross ↔ Net](cong-cu-tien-ich/salary-calculator.html) để biết thực nhận sau bảo hiểm và thuế TNCN năm 2026."
          ]
        }
      ],
      related: ["salary-calculator", "number-to-words", "vietqr"]
    },
    "barcode-generator": {
      keywords: "tạo mã vạch, barcode generator, code128, ean13, code39, tạo barcode online miễn phí, in tem mã vạch",
      howto: [
        "Chọn chuẩn mã vạch (CODE128, EAN-13…).",
        "Nhập nội dung hoặc bấm mẫu hợp lệ.",
        "Chỉnh độ dày, chiều cao, màu nếu cần.",
        "Bấm tạo và tải PNG."
      ],
      sections: [
        {
          title: "Mã vạch (Barcode) là gì?",
          paras: [
            "**Mã vạch** là dải vạch song song mã hóa số/chữ để máy quét đọc nhanh — dùng trên tem sản phẩm, hóa đơn, kho hàng, bao bì."
          ]
        },
        {
          title: "Nên chọn chuẩn nào?",
          list: [
            { title: "CODE128", text: "đa năng nhất cho SKU / mã nội bộ (chữ + số)." },
            { title: "EAN-13", text: "mã bán lẻ sản phẩm phổ biến tại Việt Nam / quốc tế." },
            { title: "CODE39", text: "phổ biến trong logistics, kho, công nghiệp." }
          ]
        },
        {
          title: "In tem đẹp, quét chuẩn",
          paras: [
            "Giữ nền trắng – vạch đen tương phản cao, không kéo méo ảnh, in thử và quét bằng app trước khi in số lượng lớn."
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
      keywords: "chuyển đổi đơn vị, đổi đơn vị online, đổi kg sang lb, đổi mét sang feet, đổi độ c sang f, đổi mb sang gb, bảng quy đổi đơn vị",
      howto: [
        "Chọn nhóm đơn vị: khối lượng, chiều dài, nhiệt độ, dung lượng…",
        "Nhập số và chọn đơn vị gốc — kết quả hiện ngay khi gõ.",
        "Đổi đơn vị đích hoặc xem bảng quy đổi sang mọi đơn vị trong nhóm."
      ],
      sections: [
        {
          title: "Chuyển đổi đơn vị là gì?",
          paras: [
            "**Chuyển đổi đơn vị** là quy đổi một đại lượng giữa hệ mét (SI) mà Việt Nam dùng và hệ Anh–Mỹ hay gặp trên hàng nhập khẩu, thông số máy móc, công thức nấu ăn. OneTool tách mỗi nhóm thành một trang riêng, dùng hệ số chuẩn quốc tế nên kết quả khớp với tài liệu kỹ thuật."
          ]
        },
        {
          title: "Các phép đổi hay dùng nhất",
          list: [
            { title: "Khối lượng:", text: "1 kg = 2,2046 lb · 1 lb = 453,59 g · 1 oz = 28,35 g — xem [Đổi khối lượng](cong-cu-don-vi/unit-mass.html)." },
            { title: "Chiều dài:", text: "1 inch = 2,54 cm · 1 ft = 30,48 cm · 1 dặm = 1,609 km — xem [Đổi chiều dài](cong-cu-don-vi/unit-length.html)." },
            { title: "Nhiệt độ:", text: "°F = °C × 1,8 + 32 · 37 °C = 98,6 °F — xem [Đổi nhiệt độ](cong-cu-don-vi/unit-temp.html)." },
            { title: "Dung lượng:", text: "1 GB = 1.000.000.000 byte, còn 1 GiB = 1.073.741.824 byte — xem [Đổi dung lượng](cong-cu-don-vi/unit-data.html)." },
            { title: "Diện tích:", text: "1 ha = 10.000 m² · 1 acre ≈ 4.047 m² — xem [Đổi diện tích](cong-cu-don-vi/unit-area.html)." },
            { title: "Áp suất:", text: "1 bar ≈ 14,5 psi · 1 atm = 101.325 Pa — xem [Đổi áp suất](cong-cu-don-vi/unit-pressure.html)." }
          ]
        },
        {
          title: "Hệ số dùng để tính",
          paras: [
            "Mỗi đơn vị được quy về một đơn vị gốc (kg, m, m², lít, giây, byte, joule, pascal, watt…) rồi đổi sang đơn vị đích, nên đổi qua lại nhiều lần vẫn không lệch. Hệ số lấy theo định nghĩa chính thức, ví dụ 1 lb = 0,45359237 kg và 1 inch = 0,0254 m là giá trị chính xác theo thỏa thuận quốc tế năm 1959."
          ]
        }
      ],
      faqs: [
        {
          q: "Có những nhóm đơn vị nào?",
          a: "13 nhóm: khối lượng, chiều dài, diện tích, thể tích, nhiệt độ, tốc độ, thời gian, dung lượng, năng lượng, áp suất, công suất, góc và tiêu hao nhiên liệu."
        },
        {
          q: "Kết quả có chính xác không?",
          a: "Tính bằng hệ số chuẩn SI/NIST với độ chính xác của số thực máy tính (khoảng 15 chữ số). Phần hiển thị được làm tròn cho dễ đọc; bấm sao chép để lấy đủ số."
        }
      ]
    },
    "unit-mass": {
      keywords: "đổi kg sang lb, 1 kg bằng bao nhiêu pound, đổi pound sang kg, 1 lb bằng bao nhiêu kg, đổi ounce sang gram, đổi khối lượng online",
      howto: ["Nhập khối lượng cần đổi.", "Chọn đơn vị gốc, ví dụ Kilogram hoặc Pound.", "Chọn đơn vị đích hoặc xem bảng quy đổi sang tất cả đơn vị."],
      sections: [
        {
          title: "1 kg bằng bao nhiêu pound?",
          paras: [
            "**1 kg = 2,20462 lb** và ngược lại **1 lb = 0,45359237 kg** (khoảng 453,6 g). Muốn nhẩm nhanh: kg × 2,2 ra pound, pound × 0,45 ra kg. Pound hay gặp trên cân sức khỏe, tạ tập gym, hành lý hàng không và hàng order từ Mỹ."
          ]
        },
        {
          title: "Bảng đổi kg ↔ lb thường dùng",
          list: [
            { title: "1 kg", text: "= 2,205 lb · 5 kg = 11,023 lb · 10 kg = 22,046 lb" },
            { title: "50 kg", text: "= 110,23 lb · 100 kg = 220,46 lb" },
            { title: "1 lb", text: "= 0,454 kg · 10 lb = 4,536 kg · 100 lb = 45,36 kg" },
            { title: "1 oz", text: "= 28,35 g · 16 oz = 1 lb" },
            { title: "1 stone", text: "= 14 lb = 6,35 kg (hay gặp ở Anh)" }
          ]
        },
        {
          title: "Các đơn vị khác có trong công cụ",
          paras: [
            "Tấn (1 t = 1.000 kg), gram, milligram, microgram cho thuốc và thực phẩm chức năng; **carat** cho đá quý (1 ct = 0,2 g); grain dùng trong dược và đạn; slug dùng trong cơ học hệ Anh. Đơn vị dân gian Việt Nam như **lạng** (100 g) hay **yến** (10 kg) có thể quy qua gram và kilogram."
          ]
        }
      ],
      faqs: [
        { q: "1 kg bằng bao nhiêu lb?", a: "1 kg = 2,20462 lb. Ví dụ 60 kg ≈ 132,3 lb." },
        { q: "1 pound bằng bao nhiêu kg?", a: "1 pound (lb) = 0,45359237 kg, tức khoảng 453,6 gram." },
        { q: "Ounce (oz) và fluid ounce (fl oz) có giống nhau không?", a: "Không. Ounce là khối lượng (28,35 g); fluid ounce là thể tích (khoảng 29,57 mL ở Mỹ). Muốn đổi fl oz hãy dùng công cụ [Đổi thể tích](cong-cu-don-vi/unit-volume.html)." }
      ]
    },
    "unit-length": {
      keywords: "đổi inch sang cm, 1 inch bằng bao nhiêu cm, đổi feet sang mét, đổi mét sang feet, đổi dặm sang km, đổi chiều cao feet sang cm",
      howto: ["Nhập chiều dài cần đổi.", "Chọn đơn vị gốc: m, cm, inch, ft, dặm…", "Chọn đơn vị đích hoặc xem bảng quy đổi."],
      sections: [
        {
          title: "1 inch bằng bao nhiêu cm?",
          paras: [
            "**1 inch = 2,54 cm** (chính xác). **1 foot = 12 inch = 30,48 cm**, **1 yard = 0,9144 m**, **1 dặm = 1,609344 km**, **1 hải lý = 1.852 m**. Chiều ngược lại: 1 m ≈ 3,281 ft ≈ 39,37 inch."
          ]
        },
        {
          title: "Bảng đổi hay dùng",
          list: [
            { title: "Chiều cao:", text: "5 ft = 152,4 cm · 5 ft 5 in = 165,1 cm · 5 ft 8 in = 172,7 cm · 6 ft = 182,9 cm" },
            { title: "Màn hình (đường chéo):", text: "15,6 inch = 39,6 cm · 27 inch = 68,6 cm · 55 inch = 139,7 cm" },
            { title: "Quãng đường:", text: "1 dặm = 1,609 km · 10 km = 6,214 dặm · marathon 42,195 km = 26,2 dặm" },
            { title: "Đi biển:", text: "1 hải lý = 1,852 km; tốc độ tàu đo bằng knot (hải lý/giờ)" }
          ]
        },
        {
          title: "Đổi chiều cao dạng feet và inch",
          paras: [
            "Chiều cao kiểu Mỹ ghi 5′7″ nghĩa là 5 feet 7 inch. Đổi hết ra inch (5 × 12 + 7 = 67 inch) rồi nhân 2,54 ra **170,2 cm**. Trong công cụ, có thể nhập 5,583 ft hoặc 67 inch đều ra cùng kết quả."
          ]
        }
      ],
      faqs: [
        { q: "1 inch bằng bao nhiêu cm?", a: "1 inch = 2,54 cm, đây là giá trị chính xác theo định nghĩa quốc tế." },
        { q: "1 feet bằng bao nhiêu mét?", a: "1 foot (ft) = 0,3048 m = 30,48 cm. Nhiều người viết feet cho cả số ít." },
        { q: "Tivi 55 inch là bao nhiêu cm?", a: "55 inch là đường chéo màn hình, bằng khoảng 139,7 cm." }
      ]
    },
    "unit-temp": {
      keywords: "đổi độ c sang độ f, đổi độ f sang độ c, công thức đổi độ c sang f, 37 độ c bằng bao nhiêu độ f, celsius fahrenheit kelvin",
      howto: ["Nhập nhiệt độ cần đổi (có thể là số âm).", "Chọn thang gốc: °C, °F, K hoặc °R.", "Xem kết quả ở thang đích và bảng các thang còn lại."],
      sections: [
        {
          title: "Công thức đổi độ C sang độ F",
          paras: [
            "**°F = °C × 9/5 + 32** và **°C = (°F − 32) × 5/9**. Kelvin dùng trong khoa học: **K = °C + 273,15**. Khác với các đơn vị khác, nhiệt độ có điểm 0 lệch nhau nên không thể nhân một hệ số duy nhất — công cụ tự áp dụng đúng công thức."
          ]
        },
        {
          title: "Các mốc nhiệt độ quen thuộc",
          list: [
            { title: "0 °C", text: "= 32 °F — nước đóng băng" },
            { title: "25 °C", text: "= 77 °F — nhiệt độ phòng" },
            { title: "37 °C", text: "= 98,6 °F — thân nhiệt bình thường; sốt 38,5 °C = 101,3 °F" },
            { title: "100 °C", text: "= 212 °F — nước sôi ở áp suất thường" },
            { title: "180 °C", text: "= 356 °F — nhiệt độ nướng bánh phổ biến; công thức Mỹ ghi 350 °F ≈ 177 °C" },
            { title: "−40 °C", text: "= −40 °F — điểm hai thang bằng nhau" }
          ]
        }
      ],
      faqs: [
        { q: "37 độ C bằng bao nhiêu độ F?", a: "37 °C = 37 × 1,8 + 32 = 98,6 °F." },
        { q: "350 độ F là bao nhiêu độ C?", a: "(350 − 32) × 5/9 ≈ 176,7 °C, thường làm tròn thành 175–180 °C khi chỉnh lò nướng." },
        { q: "Rankine là gì?", a: "Thang tuyệt đối dùng độ chia của °F: °R = °F + 459,67. Hiếm gặp, chủ yếu trong kỹ thuật nhiệt ở Mỹ." }
      ]
    },
    "unit-data": {
      keywords: "đổi mb sang gb, 1gb bằng bao nhiêu mb, đổi gb sang tb, ổ cứng 1tb còn bao nhiêu, mb và mib khác nhau, đổi byte bit",
      howto: ["Nhập dung lượng cần đổi.", "Chọn đơn vị gốc: KB/MB/GB (thập phân) hoặc KiB/MiB/GiB (nhị phân).", "Xem kết quả và bảng quy đổi."],
      sections: [
        {
          title: "1 GB bằng bao nhiêu MB?",
          paras: [
            "Theo chuẩn SI mà nhà sản xuất ổ cứng, nhà mạng dùng: **1 GB = 1.000 MB**, 1 MB = 1.000 KB. Theo chuẩn nhị phân mà Windows hiển thị: **1 GiB = 1.024 MiB**, 1 MiB = 1.024 KiB. Hai cách tính lệch nhau khoảng 7% ở mức GB và gần 10% ở mức TB."
          ]
        },
        {
          title: "Vì sao ổ 1 TB chỉ hiện 931 GB?",
          paras: [
            "Ổ 1 TB chứa 1.000.000.000.000 byte. Windows chia cho 1.024³ và ghi là GB (thực chất là GiB) nên ra **931,3 GB**. Dung lượng không bị mất — chỉ khác cách đếm."
          ],
          list: [
            { title: "128 GB", text: "= 119,2 GiB" },
            { title: "256 GB", text: "= 238,4 GiB" },
            { title: "500 GB", text: "= 465,7 GiB" },
            { title: "1 TB", text: "= 931,3 GiB" }
          ]
        },
        {
          title: "Bit và byte",
          paras: [
            "**1 byte = 8 bit.** Tốc độ mạng đo bằng bit/giây (Mbps), còn tốc độ tải file đo bằng byte/giây (MB/s). Gói mạng 100 Mbps tải tối đa khoảng 12,5 MB/s."
          ]
        }
      ],
      faqs: [
        { q: "1 GB bằng bao nhiêu MB?", a: "1 GB = 1.000 MB theo chuẩn SI; 1 GiB = 1.024 MiB theo chuẩn nhị phân." },
        { q: "MB và MiB khác nhau thế nào?", a: "MB = 10⁶ byte, MiB = 2²⁰ = 1.048.576 byte. Windows hiển thị MiB nhưng ghi là MB." },
        { q: "Mạng 100 Mbps tải được bao nhiêu MB mỗi giây?", a: "Chia cho 8: khoảng 12,5 MB/s, thực tế thấp hơn một chút do giao thức." }
      ]
    },
    "unit-volume": {
      keywords: "đổi lít sang ml, 1 khối bằng bao nhiêu lít, đổi gallon sang lít, 1 cup bằng bao nhiêu ml, đổi muỗng canh sang ml, đổi fl oz sang ml",
      howto: ["Nhập thể tích cần đổi.", "Chọn đơn vị gốc: lít, mL, m³, gallon, cup, muỗng…", "Chọn đơn vị đích hoặc xem bảng quy đổi."],
      sections: [
        {
          title: "Quy đổi lít, mL và mét khối",
          paras: [
            "**1 lít = 1.000 mL = 1 dm³**. **1 m³ (1 khối) = 1.000 lít** — đồng hồ nước tính theo khối, nên 1 khối nước đúng bằng 1.000 lít. 1 mL bằng 1 cm³ (cc), đơn vị hay ghi trên ống tiêm và dung tích xi-lanh xe máy."
          ]
        },
        {
          title: "Đơn vị nấu ăn và hàng nhập khẩu",
          list: [
            { title: "1 cup (Mỹ)", text: "= 236,6 mL" },
            { title: "1 muỗng canh (tbsp)", text: "= 14,8 mL · 1 muỗng cà phê (tsp) = 4,93 mL" },
            { title: "1 fl oz (Mỹ)", text: "= 29,57 mL — chai nước 16,9 fl oz ≈ 500 mL" },
            { title: "1 gallon Mỹ", text: "= 3,785 L · 1 gallon Anh = 4,546 L" },
            { title: "1 thùng dầu (bbl)", text: "= 158,99 L — đơn vị báo giá dầu thô" }
          ]
        }
      ],
      faqs: [
        { q: "1 khối nước bằng bao nhiêu lít?", a: "1 m³ = 1.000 lít." },
        { q: "1 gallon bằng bao nhiêu lít?", a: "Gallon Mỹ = 3,785 L, gallon Anh = 4,546 L. Công thức và giá xăng ở Mỹ dùng gallon Mỹ." },
        { q: "1 cup bằng bao nhiêu ml?", a: "Cup Mỹ = 236,6 mL; nhiều công thức làm tròn thành 240 mL. Cup hệ mét (Úc) là 250 mL." }
      ]
    },
    "unit-area": {
      keywords: "đổi m2 sang hecta, 1 ha bằng bao nhiêu m2, 1 sào bằng bao nhiêu m2, đổi acre sang m2, đổi feet vuông sang m2, đổi km2",
      howto: ["Nhập diện tích cần đổi.", "Chọn đơn vị gốc: m², ha, km², acre, ft²…", "Chọn đơn vị đích hoặc xem bảng quy đổi."],
      sections: [
        {
          title: "1 hecta bằng bao nhiêu m²?",
          paras: [
            "**1 ha = 10.000 m² = 100 a** (are, còn gọi là sào tây). **1 km² = 100 ha = 1.000.000 m²**. Diện tích đất nông nghiệp, rừng và dự án thường ghi bằng hecta; sổ đỏ ghi bằng m²."
          ]
        },
        {
          title: "Sào, mẫu và đơn vị nước ngoài",
          list: [
            { title: "1 sào Bắc Bộ", text: "= 360 m² · 1 mẫu Bắc Bộ = 10 sào = 3.600 m²" },
            { title: "1 sào Trung Bộ", text: "= 500 m² · 1 mẫu Trung Bộ = 5.000 m²" },
            { title: "1 acre", text: "= 4.046,86 m² ≈ 0,405 ha" },
            { title: "1 ft²", text: "= 0,0929 m² — 1 m² ≈ 10,76 ft² (căn hộ nước ngoài hay ghi sq ft)" }
          ]
        },
        {
          title: "Lưu ý khi đổi sào, mẫu",
          paras: [
            "Sào và mẫu là đơn vị truyền thống, khác nhau theo vùng nên công cụ không đưa vào danh sách. Hãy đổi về m² theo bảng trên rồi nhập m² để quy sang ha, acre hoặc ft²."
          ]
        }
      ],
      faqs: [
        { q: "1 ha bằng bao nhiêu m²?", a: "1 hecta = 10.000 m²." },
        { q: "1 sào bằng bao nhiêu m²?", a: "360 m² ở Bắc Bộ và 500 m² ở Trung Bộ. Miền Nam thường dùng công: 1 công = 1.000 m² (công tầm cấy có nơi tính 1.296 m²)." },
        { q: "1 acre bằng bao nhiêu hecta?", a: "1 acre ≈ 0,4047 ha, tức 4.046,86 m²." }
      ]
    },
    "unit-speed": {
      keywords: "đổi km/h sang m/s, đổi mph sang km/h, 1 knot bằng bao nhiêu km/h, đổi m/s sang km/h, 100 km/h bằng bao nhiêu mph",
      howto: ["Nhập tốc độ cần đổi.", "Chọn đơn vị gốc: km/h, m/s, mph, knot…", "Chọn đơn vị đích hoặc xem bảng quy đổi."],
      sections: [
        {
          title: "Đổi km/h, m/s và mph",
          paras: [
            "**1 m/s = 3,6 km/h** — muốn đổi km/h sang m/s thì chia 3,6. **1 mph = 1,609344 km/h**, **1 knot = 1,852 km/h**. Bài tập vật lý dùng m/s, biển báo Việt Nam dùng km/h, xe Mỹ và Anh dùng mph, tàu thuyền và máy bay dùng knot."
          ]
        },
        {
          title: "Bảng đổi hay dùng",
          list: [
            { title: "50 km/h", text: "= 13,89 m/s = 31,07 mph" },
            { title: "100 km/h", text: "= 27,78 m/s = 62,14 mph" },
            { title: "60 mph", text: "= 96,56 km/h" },
            { title: "10 knot", text: "= 18,52 km/h" }
          ]
        }
      ],
      faqs: [
        { q: "Đổi km/h sang m/s thế nào?", a: "Chia cho 3,6. Ví dụ 72 km/h = 20 m/s." },
        { q: "100 km/h bằng bao nhiêu mph?", a: "Khoảng 62,14 mph." },
        { q: "Knot là gì?", a: "Knot (nút) là hải lý/giờ, bằng 1,852 km/h, dùng cho tàu biển, máy bay và tốc độ gió." }
      ]
    },
    "unit-time": {
      keywords: "đổi giờ sang phút, đổi phút sang giây, 1 ngày bao nhiêu giây, đổi giây sang giờ phút, đổi ms sang giây",
      howto: ["Nhập khoảng thời gian cần đổi.", "Chọn đơn vị gốc: giây, phút, giờ, ngày, tuần…", "Chọn đơn vị đích hoặc xem bảng quy đổi."],
      sections: [
        {
          title: "Quy đổi thời gian cơ bản",
          list: [
            { title: "1 phút", text: "= 60 giây · 1 giờ = 60 phút = 3.600 giây" },
            { title: "1 ngày", text: "= 24 giờ = 1.440 phút = 86.400 giây" },
            { title: "1 tuần", text: "= 7 ngày = 168 giờ = 604.800 giây" },
            { title: "1 giây", text: "= 1.000 ms = 1.000.000 µs" }
          ]
        },
        {
          title: "Tháng và năm được tính thế nào?",
          paras: [
            "Tháng và năm có độ dài thay đổi, nên công cụ quy ước **1 tháng = 30 ngày** và **1 năm = 365 ngày** để đổi nhanh. Khi cần đếm chính xác số ngày giữa hai mốc lịch, hãy tính theo ngày thực tế."
          ]
        },
        {
          title: "Đổi số thập phân ra giờ phút",
          paras: [
            "1,5 giờ là 1 giờ 30 phút (0,5 × 60). 2,25 giờ là 2 giờ 15 phút. Ngược lại 45 phút = 0,75 giờ — cách tính hay dùng khi chấm công, tính lương theo giờ."
          ]
        }
      ],
      faqs: [
        { q: "1 ngày có bao nhiêu giây?", a: "86.400 giây (24 × 60 × 60)." },
        { q: "1,5 giờ là bao nhiêu phút?", a: "90 phút." },
        { q: "Tháng trong công cụ có bao nhiêu ngày?", a: "Quy ước 30 ngày; năm quy ước 365 ngày." }
      ]
    },
    "unit-energy": {
      keywords: "đổi kwh sang joule, đổi kcal sang kj, 1 kwh bằng bao nhiêu kcal, đổi calo sang joule, đổi btu sang kwh, 1 số điện là gì",
      howto: ["Nhập năng lượng cần đổi.", "Chọn đơn vị gốc: J, kJ, kWh, kcal, BTU…", "Chọn đơn vị đích hoặc xem bảng quy đổi."],
      sections: [
        {
          title: "kWh, joule và calo",
          paras: [
            "**1 kWh = 3,6 MJ = 3.600.000 J**. Hóa đơn điện tính theo kWh — **1 số điện = 1 kWh**, tức năng lượng một thiết bị 1.000 W chạy trong 1 giờ. **1 kcal = 4,184 kJ**; nhãn thực phẩm ghi Calo (viết hoa) chính là kcal."
          ]
        },
        {
          title: "Bảng đổi hay dùng",
          list: [
            { title: "1 kWh", text: "≈ 860 kcal ≈ 3.412 BTU" },
            { title: "1 kcal", text: "= 4.184 J = 4,184 kJ" },
            { title: "1 BTU", text: "≈ 1.055 J — đơn vị hay gặp ở điều hòa, lò sưởi" },
            { title: "1 eV", text: "= 1,602 × 10⁻¹⁹ J — dùng trong vật lý hạt nhân, bán dẫn" }
          ]
        },
        {
          title: "Tính điện năng tiêu thụ",
          paras: [
            "Điện năng (kWh) = công suất (kW) × số giờ dùng. Ví dụ bình nóng lạnh 2.500 W bật 1 giờ mỗi ngày dùng 2,5 kWh/ngày, khoảng 75 kWh/tháng. Đổi W sang kW bằng công cụ [Đổi công suất](cong-cu-don-vi/unit-power.html)."
          ]
        }
      ],
      faqs: [
        { q: "1 số điện bằng bao nhiêu?", a: "1 số điện = 1 kWh = 3.600.000 joule." },
        { q: "1 kcal bằng bao nhiêu kJ?", a: "1 kcal = 4,184 kJ." },
        { q: "Calo trên nhãn thực phẩm là cal hay kcal?", a: "Là kcal (kilocalo), thường viết Calo hoặc Cal. 1 kcal = 1.000 cal." }
      ]
    },
    "unit-pressure": {
      keywords: "đổi psi sang bar, đổi bar sang psi, đổi atm sang pa, đổi mmhg sang kpa, áp suất lốp xe psi bar, đổi mpa sang bar",
      howto: ["Nhập áp suất cần đổi.", "Chọn đơn vị gốc: Pa, kPa, bar, atm, psi, mmHg…", "Chọn đơn vị đích hoặc xem bảng quy đổi."],
      sections: [
        {
          title: "Đổi bar, psi, atm và Pa",
          paras: [
            "**1 bar = 100.000 Pa = 100 kPa ≈ 14,5 psi**. **1 atm = 101.325 Pa ≈ 1,013 bar ≈ 14,7 psi = 760 mmHg**. **1 psi ≈ 6.895 Pa ≈ 0,069 bar**. **1 MPa = 10 bar** — đơn vị hay ghi trên ống nước, bình gas, máy nén khí."
          ]
        },
        {
          title: "Áp suất lốp xe",
          paras: ["Đồng hồ bơm thường có cả psi và bar. Một số mức hay gặp:"],
          list: [
            { title: "29 psi", text: "≈ 2,0 bar" },
            { title: "32 psi", text: "≈ 2,2 bar" },
            { title: "35 psi", text: "≈ 2,4 bar" },
            { title: "2,5 bar", text: "≈ 36,3 psi" }
          ]
        },
        {
          title: "mmHg và Torr",
          paras: [
            "Huyết áp đo bằng **mmHg** (milimét thủy ngân); 1 mmHg ≈ 1 Torr ≈ 133,3 Pa. Huyết áp 120 mmHg ≈ 16 kPa."
          ]
        }
      ],
      faqs: [
        { q: "1 bar bằng bao nhiêu psi?", a: "1 bar ≈ 14,504 psi." },
        { q: "30 psi bằng bao nhiêu bar?", a: "Khoảng 2,07 bar." },
        { q: "1 atm bằng bao nhiêu Pa?", a: "1 atm = 101.325 Pa (giá trị chuẩn)." }
      ]
    },
    "unit-power": {
      keywords: "đổi kw sang hp, 1 mã lực bằng bao nhiêu kw, đổi hp sang kw, đổi w sang kw, đổi btu/h sang kw, điều hòa 1 ngựa bao nhiêu btu",
      howto: ["Nhập công suất cần đổi.", "Chọn đơn vị gốc: W, kW, HP, PS, BTU/giờ…", "Chọn đơn vị đích hoặc xem bảng quy đổi."],
      sections: [
        {
          title: "1 mã lực bằng bao nhiêu kW?",
          paras: [
            "Có hai loại mã lực: **mã lực cơ (HP) = 745,7 W** dùng ở Mỹ, Anh và **mã lực metric (PS, CV) = 735,5 W** dùng ở châu Âu, Nhật. Ngược lại **1 kW ≈ 1,341 HP ≈ 1,36 PS**. Thông số xe máy, ô tô, máy bơm có thể ghi một trong hai, nên cần xem kỹ ký hiệu."
          ]
        },
        {
          title: "Bảng đổi hay dùng",
          list: [
            { title: "1 kW", text: "= 1.000 W ≈ 1,341 HP" },
            { title: "100 HP", text: "≈ 74,6 kW" },
            { title: "100 PS", text: "≈ 73,5 kW" },
            { title: "1 kW", text: "≈ 3.412 BTU/giờ" }
          ]
        },
        {
          title: "Điều hòa \"1 ngựa\" là bao nhiêu?",
          paras: [
            "Ở Việt Nam, điều hòa 1 HP (1 ngựa) thường chỉ **công suất làm lạnh khoảng 9.000 BTU/h** (≈ 2,6 kW lạnh), 1,5 HP ≈ 12.000 BTU/h, 2 HP ≈ 18.000 BTU/h. Đây là quy ước của ngành điện lạnh, không phải mức điện tiêu thụ — điện năng thực tế ghi trên nhãn năng lượng."
          ]
        }
      ],
      faqs: [
        { q: "1 HP bằng bao nhiêu kW?", a: "1 HP (mã lực cơ) ≈ 0,7457 kW; 1 PS (mã lực metric) ≈ 0,7355 kW." },
        { q: "1 kW bằng bao nhiêu mã lực?", a: "Khoảng 1,341 HP hoặc 1,36 PS." },
        { q: "9000 BTU là bao nhiêu kW?", a: "9.000 BTU/h ≈ 2,64 kW (công suất làm lạnh)." }
      ]
    },
    "unit-angle": {
      keywords: "đổi độ sang radian, đổi radian sang độ, 1 radian bằng bao nhiêu độ, công thức đổi độ sang rad, đổi độ phút giây",
      howto: ["Nhập số đo góc.", "Chọn đơn vị gốc: độ, radian, grad, phút cung, giây cung, vòng.", "Xem kết quả và bảng quy đổi."],
      sections: [
        {
          title: "Công thức đổi độ sang radian",
          paras: [
            "**180° = π rad**, nên **rad = độ × π / 180** và **độ = rad × 180 / π**. 1 rad ≈ 57,2958°, 1° ≈ 0,0174533 rad. Máy tính khoa học và hàm sin, cos trong lập trình thường dùng radian."
          ]
        },
        {
          title: "Các góc thường gặp",
          list: [
            { title: "30°", text: "= π/6 ≈ 0,5236 rad" },
            { title: "45°", text: "= π/4 ≈ 0,7854 rad" },
            { title: "90°", text: "= π/2 ≈ 1,5708 rad" },
            { title: "180°", text: "= π ≈ 3,1416 rad · 360° = 2π = 1 vòng" }
          ]
        },
        {
          title: "Độ, phút, giây và grad",
          paras: [
            "1° = 60 phút cung (′) = 3.600 giây cung (″) — cách ghi tọa độ GPS dạng 21°01′42″. **Grad (gon)** chia vòng tròn thành 400 phần, 1 grad = 0,9°, dùng trong trắc địa."
          ]
        }
      ],
      faqs: [
        { q: "1 radian bằng bao nhiêu độ?", a: "1 rad ≈ 57,2958°." },
        { q: "90 độ bằng bao nhiêu radian?", a: "90° = π/2 ≈ 1,5708 rad." },
        { q: "Đổi độ thập phân sang độ phút giây thế nào?", a: "Phần lẻ × 60 ra phút, phần lẻ của phút × 60 ra giây. Ví dụ 21,0283° ≈ 21°01′42″." }
      ]
    },
    "unit-fuel": {
      keywords: "đổi l/100km sang mpg, đổi mpg sang l/100km, đổi km/l sang l/100km, mức tiêu hao nhiên liệu, xe tốn bao nhiêu lít 100km",
      howto: ["Nhập mức tiêu hao nhiên liệu.", "Chọn đơn vị gốc: L/100 km, km/L, mpg Mỹ hoặc mpg Anh.", "Xem kết quả ở các đơn vị còn lại."],
      sections: [
        {
          title: "L/100 km, km/L và mpg",
          paras: [
            "Việt Nam và châu Âu ghi **lít/100 km** (càng nhỏ càng tiết kiệm). Một số nơi dùng **km/lít** hoặc **mpg** — số dặm đi được với 1 gallon (càng lớn càng tiết kiệm). Vì hai cách ngược chiều nhau nên phép đổi là nghịch đảo, không phải nhân hệ số."
          ]
        },
        {
          title: "Công thức",
          list: [
            { title: "km/L", text: "= 100 ÷ (L/100 km)" },
            { title: "mpg (Mỹ)", text: "= 235,215 ÷ (L/100 km)" },
            { title: "mpg (Anh)", text: "= 282,481 ÷ (L/100 km)" }
          ]
        },
        {
          title: "Ví dụ",
          list: [
            { title: "Xe máy 2 L/100 km", text: "= 50 km/L ≈ 117,6 mpg Mỹ" },
            { title: "Ô tô 6 L/100 km", text: "≈ 16,7 km/L ≈ 39,2 mpg Mỹ ≈ 47,1 mpg Anh" },
            { title: "Ô tô 8 L/100 km", text: "= 12,5 km/L ≈ 29,4 mpg Mỹ" }
          ]
        }
      ],
      faqs: [
        { q: "30 mpg bằng bao nhiêu lít/100 km?", a: "Với mpg Mỹ: 235,215 ÷ 30 ≈ 7,84 L/100 km." },
        { q: "mpg Mỹ và mpg Anh khác gì?", a: "Gallon Anh lớn hơn gallon Mỹ (4,546 L so với 3,785 L), nên cùng một xe sẽ có mpg Anh cao hơn khoảng 20%." },
        { q: "Xe tốn 5 lít/100 km là bao nhiêu km/lít?", a: "100 ÷ 5 = 20 km/lít." }
      ]
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
    "regex-tester": {
      keywords: "regex tester, kiểm tra regex, biểu thức chính quy, regex online miễn phí, test regexp javascript",
      howto: [
        "Nhập pattern và chọn flags (g, i, m…).",
        "Dán chuỗi thử — xem highlight và danh sách match.",
        "Tùy chọn nhập replace để xem chuỗi sau thay thế."
      ],
      sections: [
        {
          title: "Regex tester là gì?",
          paras: [
            "**Regex tester** giúp thử **biểu thức chính quy** trên chuỗi mẫu: xem chỗ khớp, nhóm bắt (`$1`, `$2`…) và kết quả replace — hữu ích khi validate email, SĐT, parse log."
          ]
        },
        {
          title: "Flags thường dùng",
          list: [
            { title: "g", text: "tìm tất cả match (global)." },
            { title: "i", text: "không phân biệt hoa/thường." },
            { title: "m", text: "^ và $ theo từng dòng." },
            { title: "s / u", text: "dotAll (chấm khớp xuống dòng) / unicode." }
          ]
        },
        {
          title: "Chạy trên máy bạn",
          paras: [
            "Engine là **JavaScript RegExp** của trình duyệt — cú pháp giống Node.js. Không gửi chuỗi lên server."
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
    "url-encode": {
      keywords: "url encode, url decode, encodeuricomponent, percent encoding, mã hóa url online miễn phí, giải mã url",
      howto: [
        "Chọn Encode hoặc Decode.",
        "Chọn encodeURIComponent (query) hoặc encodeURI (cả URL).",
        "Dán chuỗi — kết quả hiện ngay, sao chép hoặc tải TXT."
      ],
      sections: [
        {
          title: "URL encode là gì?",
          paras: [
            "**URL encode** (percent-encoding) đổi ký tự đặc biệt và tiếng Việt thành dạng `%XX` để truyền an toàn trên URL, query string hoặc form."
          ]
        },
        {
          title: "encodeURIComponent vs encodeURI",
          list: [
            { title: "encodeURIComponent", text: "mã hóa cả ?, &, = — dùng cho từng giá trị query." },
            { title: "encodeURI", text: "giữ cấu trúc URL (: / ? #) — dùng khi mã hóa cả đường dẫn." },
            { title: "Space → +", text: "kiểu application/x-www-form-urlencoded phổ biến trong form HTML." }
          ]
        },
        {
          title: "Tiếng Việt UTF-8",
          paras: [
            "Tool dùng API trình duyệt chuẩn — dấu tiếng Việt encode đúng UTF-8, decode lại ra chữ gốc."
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
      intro: "Bộ **công cụ Media**: tải TikTok HD, nén/cắt MP4, video sang GIF. Nén & cắt chạy trên máy; TikTok dùng xử lý đám mây.",
      sections: [
        { title: "Tải TikTok", paras: ["**TikTok Download** lấy MP4 HD không watermark từ link (xử lý đám mây). Chỉ dùng khi bạn có quyền nội dung."] },
        { title: "Nén, cắt & GIF", paras: ["**Nén video** giảm dung lượng MP4 hoặc đổi WebM. **Cắt video** chọn đoạn start–end. **Video sang GIF** xuất đoạn ngắn."] }
      ]
    },
    "cong-cu-ai": {
      intro: "Bộ **công cụ AI**: chuyển giọng nói thành văn bản, **văn bản thành giọng nói**, tóm tắt bài viết. File gửi tạm lên đám mây để xử lý, không lưu lâu dài.",
      sections: [
        { title: "Giọng nói ↔ văn bản", paras: ["**Audio → Text** chép lời từ MP3/WAV/MP4, xuất TXT và SRT. **Text-to-speech** đọc tiếng Việt thành file WAV."] },
        { title: "Tóm tắt", paras: ["**Tóm tắt AI** rút gọn bài viết, biên bản, email thành đoạn văn, gạch đầu dòng hoặc TL;DR."] }
      ]
    },
    "cong-cu-pdf": {
      intro: "Tập hợp **công cụ PDF online miễn phí**: gộp, tách, nén, **ký PDF**, **Ảnh ↔ PDF**, xoay trang và trích TXT/OCR.",
      sections: [
        { title: "Ảnh ↔ PDF", paras: ["**Ảnh → PDF** ghép nhiều ảnh thành một file. **PDF → Ảnh** xuất PNG/JPG/WebP từng trang hoặc ZIP."] },
        { title: "Gộp · nén · ký · Word", paras: ["**Gộp PDF**, **Nén PDF**, **Ký PDF**, **PDF → Word**. File xử lý trên trình duyệt — không rời máy bạn."] }
      ]
    },
    "cong-cu-anh": {
      intro: "**Công cụ ảnh online** — nén, convert, **crop + preset MXH**, **OCR ảnh → chữ**, resize, **làm mờ / blur**, xóa nền AI. Cần ghép ảnh thành PDF? Xem hub **Ảnh ↔ PDF**.",
      sections: [
        { title: "Nén, convert, crop & OCR", paras: ["**Nén ảnh** giảm MB. Đổi JPG/PNG/WebP. **Crop** preset Instagram/TikTok/Shopee. **OCR ảnh** đọc chữ tiếng Việt ra TXT."] },
        { title: "Resize, blur, xóa nền & PDF", paras: ["Resize banner/avatar. **Làm mờ** che thông tin. Tách nền AI xuất PNG. Ghép ảnh thành PDF tại **Ảnh → PDF**."] }
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
      intro: "Công cụ **lập trình / developer**: JSON formatter, Regex tester, Base64, URL encode/decode, UUID, hash SHA, slugify tiếng Việt.",
      sections: [
        { title: "JSON, Regex & Base64", paras: ["Format/minify/validate JSON. **Regex tester** highlight match & replace. Encode/decode Base64 UTF-8."] },
        { title: "URL, UUID & Hash", paras: ["URL encode/decode (encodeURIComponent / encodeURI). Tạo UUID v4, hash SHA-256/384/512, slugify tiêu đề tiếng Việt."] }
      ]
    },
    "cong-cu-tien-ich": {
      intro: "Tiện ích văn phòng gọn: **tính lương Gross ↔ Net**, **đổi tiền tệ**, **QR Code**, **mã vạch**, **đổi lịch âm dương**, **tạo mật khẩu** và **chuyển đổi chữ**.",
      sections: [
        { title: "Lương & thuế", paras: ["**Tính lương Gross ↔ Net 2026** theo biểu thuế TNCN 5 bậc, giảm trừ 15,5 triệu và trần BHXH mới. **Số thành chữ** viết số tiền cho hợp đồng."] },
        { title: "Tiền tệ & lịch", paras: ["**Đổi tiền tệ** USD/EUR/VND tỷ giá tham khảo. **Lịch âm hôm nay** — lịch tháng, giờ hoàng đạo, đổi ngày âm dương."] },
        { title: "QR, mã vạch & mật khẩu", paras: ["**QR / Barcode** tải PNG. **Password Generator** mật khẩu crypto ngẫu nhiên."] }
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
    if (!tool) return "cong-cu.html";
    const cat = this.catBySlug(tool.cat);
    const folder = tool.dir || cat?.seo || "cong-cu";
    return `${folder}/${tool.slug}.html`;
  },
  hrefFor(tool) {
    if (!tool) return "cong-cu.html";
    if (tool.hub) {
      const hub = this.toolBySlug(tool.hub);
      if (hub) return this.pathFor(hub);
    }
    return this.pathFor(tool);
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
    const preferred = (this.seo[slug]?.related || []).map(s => this.toolBySlug(s)).filter(Boolean);
    const same = this.tools.filter(t => t.cat === current.cat && t.slug !== slug);
    const rest = this.tools.filter(t => t.cat !== current.cat && t.slug !== slug && t.featured);
    const out = [];
    const seen = new Set();
    preferred.concat(same, rest).forEach(t => {
      const key = t.hub || t.slug;
      if (seen.has(key) || out.length >= n) return;
      seen.add(key);
      out.push(t);
    });
    return out;
  }
};
