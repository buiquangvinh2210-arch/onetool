# OneTool trên GitHub Pages + Cloudflare Worker

GitHub Pages **không chạy** `.ashx`. Audio → Text cần Worker Cloudflare (miễn phí).

## 1. GitHub Pages (site)

1. Settings → Pages → Deploy from branch `master`
2. Folder: **`/docs`** (không chọn `/(root)`)
3. Custom domain: `onetool.vn` → Save → đợi DNS → bật Enforce HTTPS

Push code vào GitHub là xong phần giao diện.

## 2. Cloudflare Worker (API Whisper) — làm 1 lần

GitHub Pages không chạy `.ashx`. Worker Cloudflare proxy sang Groq (miễn phí).

### Cách A — Dashboard (không cần cài Node)

1. Đăng ký / đăng nhập [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create** → **Create Worker**
3. Đặt tên: `onetool-whisper` → Deploy
4. **Edit code** → xóa hết → dán nội dung file `workers/groq-whisper-proxy.js` → **Deploy**
5. **Settings** → **Variables and Secrets** → Add  
   - Type: **Secret** (Encrypt)  
   - Name: `GROQ_API_KEY`  
   - Value: key Groq `gsk_...` → **Save**
6. **Edit code** → dán lại `workers/groq-whisper-proxy.js` → **Deploy** (bắt buộc sau khi thêm biến)
7. Mở URL Worker → phải thấy `"hasGroqKey":true`

> **Lỗi “Chưa cấu hình GROQ_API_KEY” dù đã thêm Text trên dashboard?**  
> Biến Text trên UI đôi khi không gắn vào runtime. Chạy `workers\deploy-worker.bat` → đăng nhập Cloudflare → `secret put GROQ_API_KEY` → deploy. Cách này chắc chắn hơn.

### Cách B — Wrangler CLI (nếu đã cài Node.js)

```bash
npm install -g wrangler
wrangler login
cd workers
wrangler deploy
wrangler secret put GROQ_API_KEY
```

### Dán URL vào site

Sửa `docs/assets/js/ot-config.js`:

```js
whisperCloud: "https://onetool-whisper.<account>.workers.dev",
```

Commit + push GitHub → Audio → Text chạy được.

## 3. Góp ý (không cần cấu hình)

Form trên `lien-he.html` gửi email qua FormSubmit tới `onetools27@gmail.com`. Không có bảng bình luận công khai (GitHub Pages không lưu được cho máy khác nếu không có dịch vụ ngoài).

Lần đầu: mở Gmail → mail FormSubmit → **Activate Form**.

## 4. Góp ý trên IIS local

Dùng `feedback.ashx` — lưu file `docs/App_Data/feedback.jsonl`, không cần Apps Script.

## Sơ đồ

```
Người dùng → onetool.vn (GitHub Pages: HTML/JS)
                │
                ├─ Audio → Text  → Cloudflare Worker → Groq
                └─ Góp ý        → FormSubmit → Gmail
```
