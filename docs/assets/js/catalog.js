window.OTCatalog = {
  categories: [
    {
      slug: "media",
      seo: "cong-cu-media",
      name: "Media & AI",
      desc: "Audio/Video → text, nén và convert video",
      icon: "🎙️",
      seoTitle: "Công cụ Media & AI online — Audio/Video sang văn bản, nén video | OneTool",
      seoDescription: "Chuyển audio/video thành văn bản, nén MP4, đổi WebM, tách MP3 — chạy trên trình duyệt, miễn phí.",
      seoKeywords: "audio to text, nén video online, convert video mp4, video sang mp3, webm online"
    },
    {
      slug: "pdf-tools",
      seo: "cong-cu-pdf",
      name: "Công cụ PDF",
      desc: "Gộp, tách, nén, xoay và chuyển đổi PDF",
      icon: "📄",
      seoTitle: "Công cụ PDF online miễn phí — Gộp, tách, nén PDF | OneTool",
      seoDescription: "Gộp PDF, tách trang, nén dung lượng, xoay và convert PDF sang TXT/ảnh — xử lý 100% trên trình duyệt, không cần đăng ký.",
      seoKeywords: "gộp pdf online, tách pdf, nén pdf, xoay pdf, convert pdf, công cụ pdf miễn phí"
    },
    {
      slug: "images",
      seo: "cong-cu-anh",
      name: "Công cụ Ảnh",
      desc: "Convert, resize, xóa nền, batch ảnh",
      icon: "🖼️",
      seoTitle: "Công cụ ảnh online — Convert, resize, xóa nền AI | OneTool",
      seoDescription: "Đổi định dạng JPG PNG WebP, resize ảnh, xóa nền AI, xử lý batch — miễn phí, chạy trên trình duyệt, bảo mật file.",
      seoKeywords: "convert ảnh online, đổi jpg png webp, resize ảnh, xóa nền ảnh, xóa background miễn phí"
    },
    {
      slug: "file-converter",
      seo: "cong-cu-chuyen-doi",
      name: "Chuyển đổi file",
      desc: "Document, image, data",
      icon: "🔄",
      seoTitle: "Chuyển đổi file online — CSV JSON, Document | OneTool",
      seoDescription: "Chuyển CSV sang JSON và ngược lại, convert document — công cụ chuyển đổi dữ liệu nhanh trên trình duyệt.",
      seoKeywords: "csv sang json, json sang csv, convert document, chuyển đổi file online"
    },
    {
      slug: "utilities",
      seo: "cong-cu-tien-ich",
      name: "Tiện ích",
      desc: "QR, JSON, Base64 và developer tools",
      icon: "🔧",
      seoTitle: "Công cụ tiện ích online — QR, JSON, Base64, Dev tools | OneTool",
      seoDescription: "Tạo mã QR, format JSON, encode Base64, UUID, hash SHA — bộ tiện ích developer và văn phòng miễn phí.",
      seoKeywords: "tạo qr code, json formatter, base64 encode, developer tools online"
    }
  ],
  tools: [
    { slug: "audio-to-text", name: "Audio/Video → Text", desc: "Chuyển audio hoặc video thành văn bản + SRT.", icon: "🎙️", cat: "media", featured: true },
    { slug: "video-convert", name: "Nén / Convert video", desc: "Nén MP4, đổi WebM, tách MP3 — xử lý ngay trên trình duyệt.", icon: "🎬", cat: "media", featured: true },

    { slug: "pdf-merge", name: "Gộp PDF", desc: "Gộp nhiều file PDF thành một file duy nhất.", icon: "📎", cat: "pdf-tools", featured: true },
    { slug: "pdf-split", name: "Tách PDF", desc: "Tách PDF theo trang hoặc khoảng trang.", icon: "✂️", cat: "pdf-tools", featured: true },
    { slug: "pdf-compress", name: "Nén PDF", desc: "Giảm dung lượng PDF — xem % tiết kiệm và tải về.", icon: "🗜️", cat: "pdf-tools", featured: true },
    { slug: "pdf-pages", name: "Xoay / Xóa trang PDF", desc: "Xoay trang 90°/180°/270° hoặc xóa trang.", icon: "🔄", cat: "pdf-tools" },
    { slug: "pdf-convert", name: "Convert PDF", desc: "PDF → TXT (OCR scan) hoặc PNG từng trang / ZIP.", icon: "📤", cat: "pdf-tools" },

    { slug: "image-convert", name: "Convert ảnh", desc: "Đổi định dạng JPG, PNG, WebP, GIF, BMP.", icon: "🖼️", cat: "images", featured: true },
    { slug: "image-resize", name: "Resize ảnh", desc: "Đổi kích thước theo pixel hoặc preset.", icon: "📐", cat: "images", featured: true },
    { slug: "remove-background", name: "Xóa nền ảnh", desc: "Xóa nền bằng AI trên trình duyệt, xuất PNG.", icon: "✂️", cat: "images", featured: true },
    { slug: "image-batch", name: "Batch Processing", desc: "Xử lý nhiều ảnh: convert / resize / nén.", icon: "📦", cat: "images" },

    { slug: "convert-document", name: "Convert Document", desc: "PDF → TXT trên trình duyệt.", icon: "📝", cat: "file-converter" },
    { slug: "convert-image", name: "Convert Image", desc: "Hub chuyển đổi ảnh — mở Convert ảnh.", icon: "🖼️", cat: "file-converter", hub: "image-convert" },
    { slug: "convert-data", name: "CSV ↔ JSON", desc: "Chuyển CSV sang JSON và ngược lại trên trình duyệt.", icon: "📊", cat: "file-converter", featured: true },

    { slug: "qr-generator", name: "Tạo mã QR", desc: "Tạo mã QR từ URL hoặc văn bản, tải PNG.", icon: "📱", cat: "utilities", featured: true },
    { slug: "json-tools", name: "Công cụ JSON", desc: "Format, minify và kiểm tra JSON trên trình duyệt.", icon: "{ }", cat: "utilities", featured: true },
    { slug: "base64-tools", name: "Base64", desc: "Encode/decode UTF-8, URL-safe, file ↔ Base64.", icon: "🔤", cat: "utilities" },
    { slug: "developer-tools", name: "Developer Tools", desc: "UUID v4, SHA-256/384/512, slugify VI, timestamp.", icon: "🛠️", cat: "utilities" }
  ],

  origin: "https://onetool.vn",

  pageMeta: {
    "remove-background": {
      title: "Xóa nền ảnh AI online miễn phí — xuất PNG trong suốt | OneTool",
      desc: "Xóa nền ảnh chân dung và sản phẩm ngay trên trình duyệt. Tải PNG trong suốt, miễn phí, không cần đăng nhập, file không rời máy bạn."
    },
    "image-convert": {
      title: "Convert ảnh JPG PNG WebP online miễn phí | OneTool",
      desc: "Đổi định dạng ảnh JPG, PNG, WebP, GIF, BMP trên trình duyệt. Kéo thả, chọn format, tải về ngay — miễn phí, không đăng nhập."
    },
    "image-resize": {
      title: "Resize ảnh online — đổi kích thước pixel miễn phí | OneTool",
      desc: "Thu nhỏ hoặc phóng to ảnh theo pixel hoặc preset. Giữ tỉ lệ, xuất JPG/PNG/WebP — xử lý trên trình duyệt, miễn phí."
    },
    "image-batch": {
      title: "Xử lý hàng loạt ảnh online — convert, resize, nén | OneTool",
      desc: "Convert, resize hoặc nén nhiều ảnh cùng lúc trên trình duyệt. Phù hợp catalog sản phẩm và album — miễn phí, file không upload server."
    },
    "audio-to-text": {
      title: "Chuyển audio/video thành văn bản tiếng Việt + SRT | OneTool",
      desc: "Nhận dạng giọng nói từ MP3, WAV, MP4 thành văn bản và phụ đề SRT. Hỗ trợ tiếng Việt, miễn phí trên trình duyệt."
    },
    "video-convert": {
      title: "Nén video MP4 online miễn phí — đổi WebM, tách MP3 | OneTool",
      desc: "Nén MP4, chuyển WebM hoặc tách MP3 ngay trên trình duyệt. So sánh dung lượng trước/sau, miễn phí, file không rời máy bạn."
    },
    "pdf-merge": {
      title: "Gộp PDF online miễn phí — ghép nhiều file thành một | OneTool",
      desc: "Gộp nhiều file PDF thành một tài liệu, sắp xếp thứ tự rồi tải về. Xử lý trên trình duyệt, không cần đăng ký."
    },
    "pdf-split": {
      title: "Tách PDF online miễn phí — cắt theo trang hoặc khoảng | OneTool",
      desc: "Tách PDF theo từng trang hoặc khoảng trang (ví dụ 1-3,5). Tải file mới ngay trên trình duyệt, miễn phí."
    },
    "pdf-compress": {
      title: "Nén PDF online miễn phí — giảm dung lượng file | OneTool",
      desc: "Giảm dung lượng PDF, xem phần trăm tiết kiệm rồi tải về. Xử lý trên trình duyệt, không upload server."
    },
    "pdf-pages": {
      title: "Xoay và xóa trang PDF online miễn phí | OneTool",
      desc: "Xoay trang PDF 90°, 180°, 270° hoặc xóa trang không cần. Thao tác trên trình duyệt, miễn phí."
    },
    "pdf-convert": {
      title: "Convert PDF sang TXT hoặc PNG online miễn phí | OneTool",
      desc: "Xuất PDF thành văn bản (OCR bản scan) hoặc ảnh PNG từng trang / ZIP. Chạy trên trình duyệt, miễn phí."
    },
    "convert-document": {
      title: "Convert PDF sang TXT online miễn phí | OneTool",
      desc: "Chuyển PDF thành văn bản trên trình duyệt. Phù hợp trích nội dung tài liệu nhanh, miễn phí."
    },
    "convert-data": {
      title: "Chuyển CSV sang JSON và JSON sang CSV online | OneTool",
      desc: "Đổi CSV ↔ JSON ngay trên trình duyệt. Dán dữ liệu hoặc mở file, tải kết quả — miễn phí, không đăng nhập."
    },
    "qr-generator": {
      title: "Tạo mã QR online miễn phí — URL và văn bản, tải PNG | OneTool",
      desc: "Tạo mã QR từ link website hoặc văn bản, xem trước và tải PNG để in. Miễn phí, chạy trên trình duyệt."
    },
    "json-tools": {
      title: "Format JSON online — làm đẹp, minify và kiểm tra | OneTool",
      desc: "Format, thu gọn và kiểm tra JSON hợp lệ. Dán text hoặc mở file .json, sao chép kết quả — miễn phí trên trình duyệt."
    },
    "base64-tools": {
      title: "Encode Decode Base64 UTF-8 online — tiếng Việt, file, ảnh | OneTool",
      desc: "Encode/decode Base64 hỗ trợ tiếng Việt, URL-safe và Data URL. Mở file hoặc dán chuỗi, xem preview ảnh — miễn phí."
    },
    "developer-tools": {
      title: "UUID, Hash SHA, Slugify tiếng Việt, Timestamp online | OneTool",
      desc: "Tạo UUID v4, hash SHA-256/384/512, slugify tiếng Việt và chuyển Unix timestamp. Công cụ developer miễn phí trên trình duyệt."
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
    "audio-to-text": {
      keywords: "audio to text, chuyển giọng nói thành văn bản, phụ đề srt tiếng việt",
      howto: [
        "Thả file audio hoặc video (MP3, WAV, MP4…).",
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
      intro: "Bộ công cụ **Media & AI**: chuyển audio/video thành văn bản, nén MP4, đổi WebM và tách MP3 — xử lý trên trình duyệt, file không rời máy bạn.",
      sections: [
        { title: "Audio/Video → Text là gì?", paras: ["Công nghệ **speech-to-text** nhận diện giọng nói trong file MP3, WAV, MP4… và xuất ra văn bản hoặc file phụ đề SRT. Phù hợp ghi chú cuộc họp, podcast, video YouTube."] },
        { title: "Vì sao xử lý trên trình duyệt?", paras: ["File không upload lên server — bảo mật hơn, không cần đăng ký. Bạn kiểm soát hoàn toàn dữ liệu trên máy mình."] }
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
