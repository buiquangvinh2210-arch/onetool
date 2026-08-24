# OneTool — GitHub Pages (static)

Site HTML/JS thuần, xử lý PDF / ảnh / tiện ích **trên trình duyệt**. Không cần server, không API key.

## Cấu trúc

```
docs/
  index.html              Trang chủ
  about.html
  cong-cu/                Danh mục + từng tool
  assets/css|js           CSS & JS
```

## Bật GitHub Pages

1. Push repo lên GitHub
2. **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: `main` (hoặc `master`), folder: **/docs**
5. Save → đợi 1–2 phút → mở `https://<user>.github.io/<repo>/`

File `.nojekyll` đã có sẵn để GitHub không chạy Jekyll.

## Chạy local

Mở `docs/index.html` trực tiếp, hoặc:

```bash
npx serve docs
```

## Công cụ đã port

| Danh mục | Tools |
|---|---|
| PDF | Gộp, Tách, Nén, Xoay/Xóa trang, Convert TXT/PNG |
| Ảnh | Convert, Resize, Nén, Xóa nền, Batch |
| Chuyển đổi | Document (PDF→TXT), Image hub, CSV↔JSON |
| Tiện ích | QR, JSON, Base64, UUID/Hash/Slugify |

## Thư viện CDN

- `pdf-lib`, `pdfjs-dist` — PDF
- Canvas API — ảnh
- `qrcode` — QR
- `@imgly/background-removal` — xóa nền (tải model lần đầu)

## Đã bỏ (cần server)

AI chat, Whisper, đăng nhập, credit, SQL, Admin — giữ trong project ASP.NET cũ (`src/`) nếu còn cần tham khảo; **site public dùng folder `docs/`**.
