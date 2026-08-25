# TikTok yt-dlp API — không giới hạn request

**Không có API TikTok free nào cho phép dùng thoải mái trên production.**  
tikwm (~10k/ngày), tiklydown, tikdown… đều có giới hạn hoặc chết bất ngờ.

Cách ổn định nhất: **tự chạy yt-dlp trên VPS/máy nhà** — miễn phí, không bị quota ngày.

## Cài trên Ubuntu (VPS / Oracle Free / máy nhà)

```bash
sudo apt update
sudo apt install -y python3-pip python3-venv ffmpeg
pip install yt-dlp   # hoặc: sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp

cd servers/tiktok-ytdlp
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export API_KEY="dat-mot-chuoi-bi-mat"   # khuyên dùng khi public internet
uvicorn app:app --host 0.0.0.0 --port 8788
```

Test:

```bash
curl http://127.0.0.1:8788/health
curl -X POST http://127.0.0.1:8788/resolve \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: dat-mot-chuoi-bi-mat" \
  -d '{"url":"https://www.tiktok.com/@xxx/video/1234567890"}'
```

## Gắn vào Cloudflare Worker

1. Deploy API lên VPS (mở port 8788 hoặc reverse proxy Nginx + HTTPS).
2. Cloudflare Dashboard → Worker `onetool-tiktok` → **Settings → Variables**:
   - `YTDLP_API_URL` = `https://your-domain.com` (không có `/` cuối)
   - `YTDLP_API_KEY` = cùng `API_KEY` trên server (nếu có)
3. Deploy lại Worker code mới (`workers/tiktok-proxy.js`, version 4).
4. Kiểm tra: mở `https://onetool-tiktok....workers.dev/` → `"ytdlp": true`.

Worker sẽ **ưu tiên yt-dlp trước**, chỉ fallback tikwm/tiklydown khi yt-dlp lỗi.

## VPS free gợi ý

| Nơi | Ghi chú |
|-----|---------|
| [Oracle Cloud Always Free](https://www.oracle.com/cloud/free/) | ARM 4 OCPU, chạy 24/7 miễn phí |
| Máy nhà + Cloudflare Tunnel | Không cần mở port, HTTPS free |
| Render / Fly.io | Free tier có giới hạn sleep — không khuyên production |

## Chạy nền (systemd)

```ini
# /etc/systemd/system/onetool-ytdlp.service
[Unit]
Description=OneTool TikTok yt-dlp API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/AITool/servers/tiktok-ytdlp
Environment=API_KEY=dat-mot-chuoi-bi-mat
ExecStart=/home/ubuntu/AITool/servers/tiktok-ytdlp/.venv/bin/uvicorn app:app --host 127.0.0.1 --port 8788
Restart=always

[Install]
WantedBy=multi-user.target
```

Nginx proxy HTTPS → `127.0.0.1:8788`.
