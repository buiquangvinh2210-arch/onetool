window.OTCatalog = {
  categories: [
    {
      slug: "media",
      seo: "cong-cu-media",
      name: "Media & AI",
      desc: "Tải TikTok, Audio to Text, nén & convert video",
      icon: "🎙️",
      seoTitle: "Công cụ Media & AI online — Tải TikTok, Audio/Video sang văn bản | OneTool",
      seoDescription: "Tải video TikTok HD, chuyển audio/video thành văn bản, nén MP4, đổi WebM, tách MP3 — chạy trên trình duyệt, miễn phí.",
      seoKeywords: "tải video tiktok, audio to text, nén video online, convert video mp4, video sang mp3, webm online"
    },
    {
      slug: "pdf-tools",
      seo: "cong-cu-pdf",
      name: "Công cụ PDF",
      desc: "Gộp, tách, nén, PDF to Word, Word/Excel → PDF",
      icon: "📄",
      seoTitle: "Công cụ PDF online miễn phí — Gộp, tách, nén PDF | OneTool",
      seoDescription: "Gộp PDF, tách trang, nén dung lượng, xoay và convert PDF sang TXT/ảnh — xử lý 100% trên trình duyệt, không cần đăng ký.",
      seoKeywords: "gộp pdf online, tách pdf, nén pdf, xoay pdf, convert pdf, công cụ pdf miễn phí"
    },
    {
      slug: "images",
      seo: "cong-cu-anh",
      name: "Công cụ Ảnh",
      desc: "Convert ảnh, Resize, xóa nền AI, batch",
      icon: "🖼️",
      seoTitle: "Công cụ ảnh online — Convert, resize, xóa nền AI | OneTool",
      seoDescription: "Đổi định dạng JPG PNG WebP, resize ảnh, xóa nền AI, xử lý batch — miễn phí, chạy trên trình duyệt, bảo mật file.",
      seoKeywords: "convert ảnh online, đổi jpg png webp, resize ảnh, xóa nền ảnh, xóa background miễn phí"
    },
    {
      slug: "file-converter",
      seo: "cong-cu-chuyen-doi",
      name: "Chuyển đổi file",
      desc: "Convert Document, convert ảnh, CSV sang JSON",
      icon: "🔄",
      seoTitle: "Chuyển đổi file online — CSV JSON, Document | OneTool",
      seoDescription: "Chuyển CSV sang JSON và ngược lại, convert document — công cụ chuyển đổi dữ liệu nhanh trên trình duyệt.",
      seoKeywords: "csv sang json, json sang csv, convert document, chuyển đổi file online"
    },
    {
      slug: "utilities",
      seo: "cong-cu-tien-ich",
      name: "Tiện ích",
      desc: "Tạo QR Code, JSON Formatter, Base64, Dev Tools",
      icon: "🔧",
      seoTitle: "Công cụ tiện ích online — QR, JSON, Base64, Dev tools | OneTool",
      seoDescription: "Tạo mã QR, format JSON, encode Base64, UUID, hash SHA — bộ tiện ích developer và văn phòng miễn phí.",
      seoKeywords: "tạo qr code, json formatter, base64 encode, developer tools online"
    }
  ],
  tools: [
    { slug: "tiktok-download", name: "TikTok Download · Tải video TikTok", desc: "Tải MP4 HD không watermark từ link — kể cả video app không cho lưu.", icon: "🎵", cat: "media", featured: true },
    { slug: "audio-to-text", name: "Audio to Text · Giọng nói thành chữ", desc: "Convert audio/video thành văn bản tiếng Việt + phụ đề SRT.", icon: "🎙️", cat: "media", featured: true },
    { slug: "video-convert", name: "Compress Video · Nén video", desc: "Nén MP4, convert WebM, tách MP3 — ngay trên máy bạn.", icon: "🎬", cat: "media", featured: true },

    { slug: "pdf-merge", name: "Merge PDF · Gộp file", desc: "Gộp nhiều PDF thành một tài liệu, sắp xếp thứ tự dễ dàng.", icon: "📎", cat: "pdf-tools", featured: true },
    { slug: "pdf-split", name: "Split PDF · Tách trang", desc: "Tách PDF theo từng trang hoặc khoảng trang bạn chọn.", icon: "✂️", cat: "pdf-tools", featured: true },
    { slug: "pdf-compress", name: "Compress PDF · Nén PDF", desc: "Nén PDF giảm dung lượng — xem % tiết kiệm rồi tải về.", icon: "🗜️", cat: "pdf-tools", featured: true },
    { slug: "pdf-pages", name: "Rotate PDF · Xoay & xóa trang", desc: "Xoay trang bị lệch 90°/180°/270° hoặc xóa trang thừa.", icon: "🔄", cat: "pdf-tools" },
    { slug: "pdf-to-word", name: "PDF to Word · Sang DOCX", desc: "Convert PDF sang Word chỉnh sửa được — kể cả bản scan.", icon: "📄", cat: "pdf-tools", featured: true },
    { slug: "office-to-pdf", name: "Word/Excel → PDF · Sang PDF", desc: "Convert DOCX & XLSX sang PDF nhanh, sạch để gửi hoặc in.", icon: "📑", cat: "pdf-tools", featured: true },
    { slug: "pdf-convert", name: "Convert PDF · Sang TXT & ảnh", desc: "Convert PDF sang TXT (OCR) hoặc PNG từng trang / ZIP.", icon: "📤", cat: "pdf-tools" },

    { slug: "image-convert", name: "Convert Ảnh · Đổi định dạng", desc: "Convert JPG, PNG, WebP, GIF, BMP nhanh chóng.", icon: "🖼️", cat: "images", featured: true },
    { slug: "image-resize", name: "Resize Ảnh · Đổi kích thước", desc: "Resize theo pixel hoặc preset — giữ tỉ lệ ảnh.", icon: "📐", cat: "images", featured: true },
    { slug: "remove-background", name: "Remove Background · Xóa nền AI", desc: "Xóa nền ảnh bằng AI, xuất PNG trong suốt.", icon: "✂️", cat: "images", featured: true },
    { slug: "image-batch", name: "Batch Ảnh · Xử lý hàng loạt", desc: "Convert, resize hoặc nén nhiều ảnh cùng lúc.", icon: "📦", cat: "images" },

    { slug: "convert-document", name: "Convert Document · PDF sang TXT", desc: "Convert PDF thành văn bản TXT để copy hoặc tìm kiếm.", icon: "📝", cat: "file-converter" },
    { slug: "convert-image", name: "Convert Image · Đổi ảnh nhanh", desc: "Lối tắt mở công cụ Convert Ảnh.", icon: "🖼️", cat: "file-converter", hub: "image-convert" },
    { slug: "convert-data", name: "CSV to JSON · Đổi dữ liệu", desc: "Convert CSV sang JSON và JSON sang CSV trong vài giây.", icon: "📊", cat: "file-converter", featured: true },

    { slug: "qr-generator", name: "QR Code · Tạo mã QR", desc: "Tạo mã QR từ link hoặc chữ, xem trước và tải PNG.", icon: "📱", cat: "utilities", featured: true },
    { slug: "json-tools", name: "JSON Formatter · Làm đẹp JSON", desc: "Format, minify và kiểm tra JSON hợp lệ.", icon: "{ }", cat: "utilities", featured: true },
    { slug: "base64-tools", name: "Base64 · Mã hóa / giải mã", desc: "Encode/decode Base64 — tiếng Việt, URL-safe, file.", icon: "🔤", cat: "utilities" },
    { slug: "developer-tools", name: "Dev Tools · UUID & Hash", desc: "UUID, SHA hash, slugify tiếng Việt, Unix timestamp.", icon: "🛠️", cat: "utilities" }
  ],

  origin: "https://onetool.vn",

  pageMeta: {
    "remove-background": {
      title: "Remove Background online — Xóa nền ảnh AI miễn phí | OneTool",
      desc: "Remove background / xóa nền ảnh AI trên trình duyệt. Tải PNG trong suốt, miễn phí, không cần đăng nhập."
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
      title: "Tải video TikTok không watermark — HD online miễn phí | OneTool",
      desc: "Dán link TikTok để tải MP4 HD không watermark, MP3 và slideshow. Miễn phí — kể cả video app không cho tải."
    },
    "audio-to-text": {
      title: "Audio to Text online — Convert giọng nói thành văn bản + SRT | OneTool",
      desc: "Audio to Text / video to text tiếng Việt. Convert MP3, WAV, MP4, MOV thành văn bản và phụ đề SRT — miễn phí trên trình duyệt."
    },
    "video-convert": {
      title: "Compress Video online — Nén MP4, Convert WebM, tách MP3 | OneTool",
      desc: "Compress video / nén MP4 online, convert WebM hoặc tách MP3 ngay trên trình duyệt. Miễn phí, file không rời máy bạn."
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
      title: "Convert PDF online — PDF sang TXT hoặc PNG miễn phí | OneTool",
      desc: "Convert PDF sang TXT (OCR scan) hoặc PNG từng trang / ZIP. Chạy trên trình duyệt, miễn phí."
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
      title: "Convert Document online — PDF sang TXT miễn phí | OneTool",
      desc: "Convert Document / convert PDF sang TXT trên trình duyệt. Phù hợp trích nội dung tài liệu nhanh, miễn phí."
    },
    "convert-data": {
      title: "CSV to JSON online — Convert JSON sang CSV miễn phí | OneTool",
      desc: "CSV to JSON / JSON to CSV ngay trên trình duyệt. Dán dữ liệu hoặc mở file, tải kết quả — miễn phí."
    },
    "qr-generator": {
      title: "QR Code Generator online miễn phí — tạo mã QR tải PNG | OneTool",
      desc: "QR Code Generator từ link hoặc văn bản, xem trước và tải PNG để in. Miễn phí trên trình duyệt."
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
      keywords: "tải video tiktok, tiktok download, tải tiktok không watermark, tải mp4 tiktok hd",
      howto: [
        "Mở TikTok → Chia sẻ → Sao chép liên kết.",
        "Dán link vào OneTool và bấm Lấy video.",
        "Chọn MP4 HD (không watermark) hoặc MP3 để tải về."
      ],
      sections: [
        {
          title: "Tải video TikTok không watermark là gì?",
          paras: [
            "**TikTok Download** lấy file MP4 chất lượng cao từ link công khai — kể cả khi app tắt nút tải. Ưu tiên bản **HD không watermark**, hỗ trợ MP3 và ảnh slideshow."
          ]
        },
        {
          title: "Cách tải video TikTok online",
          paras: [
            "Sao chép liên kết video → dán vào ô Link TikTok → bấm **Lấy video** → chọn **MP4 HD** để tải. Dùng được link tiktok.com, vt.tiktok.com và vm.tiktok.com."
          ]
        },
        {
          title: "Lưu ý khi tải",
          list: [
            { title: "Quyền sử dụng", text: "chỉ tải nội dung bạn có quyền (video của bạn / được phép)." },
            { title: "Video riêng tư", text: "link private hoặc hết hạn có thể không lấy được." },
            { title: "Nén sau khi tải", text: "dùng Compress Video nếu cần giảm dung lượng." }
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
      keywords: "pdf sang txt, pdf sang ảnh png, convert pdf",
      howto: [
        "Tải PDF lên.",
        "Chọn xuất TXT hoặc PNG.",
        "Tải kết quả."
      ],
      sections: [
        {
          title: "Convert PDF là gì?",
          paras: [
            "**Convert PDF** đổi PDF sang **TXT** để copy nội dung, hoặc sang **PNG** (trang đầu) khi cần thumbnail xem nhanh."
          ]
        },
        {
          title: "Cách chuyển PDF sang text hoặc ảnh",
          paras: [
            "Chọn file, chọn kiểu xuất, tải kết quả. PDF tạo từ Word/máy tính thường lấy chữ tốt; PDF scan ảnh cần OCR riêng."
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
        "Chọn file PDF.",
        "Chạy chuyển sang TXT.",
        "Sao chép hoặc tải văn bản."
      ],
      sections: [
        {
          title: "Convert Document là gì?",
          paras: [
            "Công cụ rút **văn bản từ PDF** ra TXT ngay trên trình duyệt — tiện để tìm kiếm, dịch hoặc dán vào email."
          ]
        },
        {
          title: "Cách lấy text từ PDF",
          paras: [
            "Upload PDF, chạy chuyển đổi, sao chép hoặc tải TXT. Bảng biểu sẽ ra dạng chữ thẳng hàng; cần CSV thì dùng Convert Data."
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
      intro: "Bộ công cụ **Media & AI**: tải TikTok HD, chuyển audio/video thành văn bản, nén MP4, đổi WebM và tách MP3.",
      sections: [
        { title: "Tải TikTok & xử lý video", paras: ["**TikTok Download** lấy MP4 HD không watermark từ link. **Compress Video** nén MP4 / tách MP3 ngay trên trình duyệt."] },
        { title: "Audio/Video → Text", paras: ["**Speech-to-text** nhận diện giọng nói trong MP3, WAV, MP4… xuất TXT hoặc phụ đề SRT — phù hợp họp, podcast, phụ đề."] }
      ]
    },
    "cong-cu-pdf": {
      intro: "Tập hợp **công cụ PDF online miễn phí**: gộp nhiều file, tách trang, nén dung lượng, xoay trang và chuyển đổi sang TXT hoặc ảnh.",
      sections: [
        { title: "Công cụ PDF phổ biến", paras: ["**Gộp PDF** — nối nhiều file thành một. **Tách PDF** — lấy trang cần thiết. **Nén PDF** — giảm dung lượng trước khi gửi email."] },
        { title: "An toàn & riêng tư", paras: ["Mọi thao tác xử lý PDF diễn ra trên trình duyệt của bạn. File không rời khỏi thiết bị — phù hợp tài liệu nội bộ, hợp đồng."] }
      ]
    },
    "cong-cu-anh": {
      intro: "**Công cụ ảnh online** — convert định dạng, resize theo pixel hoặc preset, xóa nền AI và xử lý hàng loạt.",
      sections: [
        { title: "Convert & resize ảnh", paras: ["Đổi JPG, PNG, WebP, GIF, BMP. Resize cho banner 1920×1080, avatar, thumbnail social — giữ chất lượng tốt nhất có thể."] },
        { title: "Xóa nền AI", paras: ["Tách chủ thể khỏi phông, xuất **PNG trong suốt** — lý tưởng cho ảnh sản phẩm, chân dung, thiết kế Canva."] }
      ]
    },
    "cong-cu-chuyen-doi": {
      intro: "Chuyển đổi dữ liệu và tài liệu — **CSV ↔ JSON**, PDF sang text và các định dạng phổ biến khác.",
      sections: [
        { title: "CSV ↔ JSON", paras: ["Developer và analyst thường cần chuyển CSV sang JSON hoặc ngược lại. Tool hỗ trợ header, delimiter và preview trực tiếp."] },
        { title: "Convert document", paras: ["Trích xuất nội dung text từ PDF — nhanh, không cần cài phần mềm."] }
      ]
    },
    "cong-cu-tien-ich": {
      intro: "Bộ **tiện ích online** cho developer và văn phòng: QR code, JSON formatter, Base64, UUID, hash SHA.",
      sections: [
        { title: "Developer tools", paras: ["Format JSON, encode/decode Base64, tạo UUID v4, hash SHA-256 — tiện khi debug API hoặc xử lý dữ liệu nhanh."] },
        { title: "Tạo mã QR", paras: ["Nhập URL hoặc văn bản, tải ảnh PNG — dùng cho menu, WiFi, thanh toán, marketing."] }
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
    const rest = this.tools.filter(t => t.cat !== current.cat && t.slug !== slug && (t.featured || t.cat === "utilities"));
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
