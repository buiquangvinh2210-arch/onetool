# Bản tiếng Anh của OneTool (`/en/`)

Bản tiếng Anh được **tạo tự động** từ bản tiếng Việt. Không sửa tay các file trong `docs/en/` hay các file `*.en.js`. Mỗi lần build, chúng sẽ bị ghi đè.

## Cách hoạt động

| Thành phần | Vai trò |
|---|---|
| `dict/*.json` | Từ điển **câu tiếng Việt → câu tiếng Anh**. Đây là nơi duy nhất cần sửa khi muốn đổi bản dịch. |
| `extract.mjs` | Quét toàn bộ web, tìm câu tiếng Việt **chưa có** trong từ điển, rồi ghi ra thư mục `todo/`. |
| `build-en.mjs` | Tạo `docs/en/**` (trang HTML tiếng Anh), các file `docs/assets/js/**/*.en.js` (JS đã dịch), gắn thẻ `hreflang` vào trang tiếng Việt và cập nhật `sitemap.xml`. |
| `serve.mjs` | Server xem thử trên máy: `node scripts/i18n/serve.mjs` → http://localhost:5600/ và http://localhost:5600/en/ |

- Trong từ điển, giá trị `"="` nghĩa là **giữ nguyên tiếng Việt**. Dùng cho tên riêng (Can Chi, văn khấn, tên giọng đọc) và các chuỗi mà code dùng làm dữ liệu.
- Các chỗ trong `<0>…</0>` là thẻ HTML (link, chữ đậm…). Bản dịch phải giữ đủ các số này.

## Khi sửa nội dung tiếng Việt

```bash
cd scripts/i18n
npm install            # chỉ cần lần đầu
node extract.mjs       # xem còn câu nào chưa dịch -> todo/*.json
# dịch các câu trong todo/*.json, chép sang một file mới trong dict/ (vd dict/050.json)
node build-en.mjs      # tạo lại toàn bộ bản tiếng Anh
```

Nếu còn câu chưa dịch, build vẫn chạy, nhưng câu đó sẽ hiện tiếng Việt trên bản EN. Danh sách các câu này nằm ở `missing.json`.

## SEO tiếng Anh đã có

- Mỗi trang có URL riêng: `onetool.vn/x.html` ↔ `onetool.vn/en/x.html`.
- `<html lang="en">`, `canonical` trỏ về chính trang `/en/`, `og:locale=en_US`.
- Thẻ `hreflang` (vi / en / x-default) gắn ở **cả hai** bản, và có trong `sitemap.xml`.
- Title, description, FAQ, JSON-LD (`inLanguage: "en"`) được viết lại theo từ khóa tiếng Anh, ví dụ "Merge PDF Online Free", "Remove Background".
- Nút **VI | EN** nằm trên header. Khách dùng trình duyệt tiếng Anh vào trang tiếng Việt sẽ thấy banner gợi ý chuyển sang bản EN. Web **không tự chuyển hướng**, vì Googlebot cũng đọc web bằng tiếng Anh; tự chuyển sẽ làm hỏng việc index bản tiếng Việt.
