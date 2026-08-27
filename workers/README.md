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
6. (Tuỳ chọn) thêm các Secret dự phòng:
   - `GEMINI_API_KEY`: API key từ Google AI Studio
   - `OPENROUTER_API_KEY`: API key từ OpenRouter
7. (Tuỳ chọn) thêm các biến model:
   - `GEMINI_MODEL`: mặc định `gemini-2.5-flash`
   - `GEMINI_AUDIO_MODEL`: mặc định dùng `GEMINI_MODEL`
   - `OPENROUTER_CHAT_MODEL`: model miễn phí có đuôi `:free` (mặc định `openai/gpt-oss-20b:free`)
   - `OPENROUTER_AUDIO_MODEL`: để trống nếu model OpenRouter không hỗ trợ audio
8. **Edit code** → dán lại `workers/groq-whisper-proxy.js` → **Deploy** (bắt buộc sau khi thêm biến)
9. Mở URL Worker → phải thấy `providers.groq`, `providers.gemini`, `providers.openrouter` đúng theo các Secret đã thêm

Worker này còn phục vụ **Tóm tắt AI** (`POST /summarize`) và sẽ tự chuyển sang nhà cung cấp tiếp theo khi nguồn trước hết quota. Trang: `cong-cu-media/ai-summarize.html`.

### Cơ chế fallback

- Tóm tắt: Groq → Gemini → OpenRouter.
- Audio → Text: Groq Whisper → Gemini audio; OpenRouter chỉ được thử khi đã cấu hình
  `OPENROUTER_AUDIO_MODEL` tương thích audio.
- Chỉ chuyển nguồn khi gặp quota/rate limit hoặc lỗi tạm thời. Key sai sẽ báo lỗi
  để không che giấu lỗi cấu hình.
- OpenRouter bị giới hạn chỉ gọi model có đuôi `:free`; model trả phí sẽ không được gọi.
- Không dùng nhiều tài khoản/key để né giới hạn miễn phí; mỗi nhà cung cấp vẫn áp dụng
  điều khoản và quota riêng.

> **Lỗi “Chưa cấu hình GROQ_API_KEY” dù đã thêm Text trên dashboard?**  
> Biến Text trên UI đôi khi không gắn vào runtime. Chạy `workers\deploy-worker.bat` → đăng nhập Cloudflare → `secret put GROQ_API_KEY` → deploy. Cách này chắc chắn hơn.

### Cách B — Wrangler CLI (nếu đã cài Node.js)

```bash
npm install -g wrangler
wrangler login
cd workers
wrangler deploy
wrangler secret put GROQ_API_KEY
wrangler secret put GEMINI_API_KEY
wrangler secret put OPENROUTER_API_KEY
```

### Dán URL vào site

Sửa `docs/assets/js/ot-config.js`:

```js
whisperCloud: "https://onetool-whisper.<account>.workers.dev",
```

Commit + push GitHub → Audio → Text chạy được.

## 2b. Cloudflare Worker (TikTok Download) — hướng dẫn chi tiết

GitHub Pages **không** gọi được API TikTok từ trình duyệt (bị CORS). Tool cần một **Cloudflare Worker** làm cầu nối.

Bạn đã có Worker Whisper (`onetool-whisper`) → làm tương tự, **không cần API key**.

Trang tool: `https://onetool.vn/cong-cu-media/tiktok-download.html`  
File Worker: `workers/tiktok-proxy.js`  
Config site: `docs/assets/js/ot-config.js` → `tiktokCloud`

---

### Cách A — Dashboard Cloudflare (khuyên dùng, ~5 phút)

#### Bước 1 — Đăng nhập
1. Mở [dash.cloudflare.com](https://dash.cloudflare.com) (cùng tài khoản đã deploy `onetool-whisper`).
2. Vào **Workers & Pages** (menu bên trái).

#### Bước 2 — Tạo Worker mới
1. Bấm **Create** → **Create Worker**.
2. Đặt tên đúng: **`onetool-tiktok`** (khớp với `ot-config.js`).
3. Bấm **Deploy** (lần đầu tạo skeleton mặc định — chưa sao).

#### Bước 3 — Dán code
1. Vào Worker `onetool-tiktok` → **Edit code** (hoặc **Quick edit**).
2. **Xóa hết** code mặc định trong editor.
3. Mở file trên máy: `E:\AITool\workers\tiktok-proxy.js`  
   (hoặc `docs\workers\tiktok-proxy.js` — cùng nội dung).
4. **Ctrl+A** → **Ctrl+C** toàn bộ file → dán vào editor Cloudflare.
5. Bấm **Deploy** (góc phải).
6. Đợi “Success”.

#### Bước 4 — Lấy URL Worker
1. Vào tab **Settings** → **Domains & Routes** (hoặc nhìn góc trên Worker).
2. Copy URL dạng:
   ```text
   https://onetool-tiktok.<tên-subdomain>.workers.dev
   ```
   Ví dụ tài khoản hiện tại trong config:
   ```text
   https://onetool-tiktok.buiquangvinh2210.workers.dev
   ```

#### Bước 5 — Kiểm tra Worker sống
1. Mở URL Worker trên trình duyệt (chỉ `/`).
2. Phải thấy JSON kiểu:
   ```json
   {"ok":true,"service":"onetool-tiktok-proxy","version":1}
   ```
3. Nếu lỗi 404 / trang trống → quay lại bước 3, Deploy lại.

#### Bước 6 — Gắn URL vào site
Mở `docs/assets/js/ot-config.js`, đảm bảo đúng:

```js
tiktokCloud: "https://onetool-tiktok.buiquangvinh2210.workers.dev",
```

Nếu subdomain Cloudflare **khác** `buiquangvinh2210`, sửa cho khớp URL bước 4.

#### Bước 7 — Đẩy code lên GitHub Pages
1. Commit + push các file tool (HTML/CSS/JS/catalog/sitemap/`ot-config.js`).
2. Đợi Pages build xong (~1 phút).
3. Mở: `https://onetool.vn/cong-cu-media/tiktok-download.html`
4. **Ctrl+Shift+R** (xóa cache).
5. Dán 1 link TikTok công khai → **Lấy video** → **Tải MP4 HD**.

---

### Cách B — Wrangler CLI (máy đã có Node)

```bash
npm install -g wrangler
wrangler login
cd E:\AITool\workers
wrangler deploy -c wrangler-tiktok.toml
```

Hoặc double-click `workers\deploy-tiktok.bat` (cần `wrangler` trong PATH).

Sau deploy, vẫn kiểm tra URL như **Bước 5** và khớp `tiktokCloud` như **Bước 6–7**.

---

### Cách dùng tool (người dùng cuối)

1. Mở TikTok (app hoặc web) → video cần tải.  
2. Bấm **Chia sẻ** → **Sao chép liên kết**.  
3. Vào OneTool → **TikTok Download**.  
4. Dán link (hoặc bấm **Dán từ clipboard**) → **Lấy video**.  
5. Xem trước → chọn **MP4 HD · Không watermark** (nút hồng/tím) → tải về máy.  
6. Tuỳ chọn: MP3 (âm thanh) hoặc ảnh slideshow nếu là bài ảnh.

Link hỗ trợ: `tiktok.com`, `vt.tiktok.com`, `vm.tiktok.com`, `m.tiktok.com`.

---

### Lỗi thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| “Chưa cấu hình dịch vụ tải TikTok” | Chưa có / sai `tiktokCloud` trong `ot-config.js`, hoặc chưa push lên Pages. |
| Worker mở ra không có `"onetool-tiktok-proxy"` | Chưa dán đúng `tiktok-proxy.js` hoặc chưa Deploy. |
| “Origin không được phép” | Domain lạ. Thêm origin vào `ALLOWED_ORIGINS` trong Worker (Settings → Variables) hoặc trong `wrangler-tiktok.toml` rồi deploy lại. |
| “Không lấy được video” | Link private / hết hạn / vùng hạn chế. Thử video công khai khác. |
| “Nguồn tải tạm hết hạn mức trong ngày” | tikwm hết quota — cấu hình **yt-dlp tự host** (mục 2c) hoặc đợi reset 0h UTC. |
| Lấy được info nhưng tải file lỗi | CDN chặn tạm thời — thử lại sau vài giây; hoặc chọn bản SD thay vì HD. |
| Trang tool cũ / không thấy tool | Hard refresh Ctrl+Shift+R; kiểm tra đã push `catalog.js` + `tiktok-download.html`. |

**Không cần** secret / API key cho Worker TikTok (khác Whisper).

---

### 2c. Cách ít cấu hình nhất (khuyên dùng)

**Không cần VPS, không API key, không biến môi trường** — chỉ 2 việc:

1. Dán + Deploy `workers/tiktok-proxy.js` lên Worker `onetool-tiktok` (version **5**).
2. Push site lên GitHub Pages (`ot-config.js` đã có `tiktokCloud`).

Worker tự làm phần còn lại:

- Xoay **6 nguồn API free** (tiklydown → sl-bjs → tikdown → sujoy → tikwm).
- **tikwm để cuối** — tiết kiệm quota 10k/ngày cho khi nguồn khác lỗi.
- **Cache 7 ngày** — cùng link không gọi API lại.

Kiểm tra: mở Worker URL → `"version": 5`.

---

### 2d. Dùng thoải mái hơn — tự host yt-dlp (tuỳ chọn)

API free bên thứ ba (tikwm, tiklydown…) **luôn có giới hạn ngày** (~10k hoặc ít hơn). Không có API public nào cho TikTok unlimited thật sự.

**Giải pháp:** chạy server yt-dlp của bạn (miễn phí, chỉ tốn VPS hoặc máy nhà):

1. Làm theo `servers/tiktok-ytdlp/README.md` (Python + yt-dlp, ~10 phút).
2. Cloudflare → Worker `onetool-tiktok` → **Variables**:
   - `YTDLP_API_URL` = URL server (vd. `https://tiktok-api.example.com`)
   - `YTDLP_API_KEY` = khóa bảo mật (tuỳ chọn)
3. Deploy lại `workers/tiktok-proxy.js` (version **4**).
4. Kiểm tra `/` → `"ytdlp": true`.

Worker ưu tiên yt-dlp → fallback tikwm/tiklydown khi cần. Cache 24h giảm tải.

VPS free: Oracle Cloud Always Free, hoặc máy nhà + Cloudflare Tunnel.

---

### Sơ đồ TikTok

```
Người dùng dán link
    → onetool.vn (HTML/JS)
    → Worker onetool-tiktok (/resolve)
    → lấy URL MP4 HD
    → Worker (/file) stream về máy (tránh CORS)
```

## 3. Góp ý (không cần cấu hình)

Form trên `lien-he.html` gửi email qua FormSubmit tới `onetools27@gmail.com`. Không có bảng bình luận công khai (GitHub Pages không lưu được cho máy khác nếu không có dịch vụ ngoài).

Lần đầu: mở Gmail → mail FormSubmit → **Activate Form**.

## 4. Góp ý trên IIS local

Dùng `feedback.ashx` — lưu file `docs/App_Data/feedback.jsonl`, không cần Apps Script.

## Sơ đồ

```
Người dùng → onetool.vn (GitHub Pages: HTML/JS)
                │
                ├─ Audio → Text     → Cloudflare Worker → Groq
                ├─ TikTok Download → Cloudflare Worker → TikTok CDN
                └─ Góp ý           → FormSubmit → Gmail
```
