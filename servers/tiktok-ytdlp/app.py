"""
OneTool — TikTok resolve API (yt-dlp, không giới hạn request/ngày).
Chạy trên VPS free (Oracle / Render / máy nhà) rồi gắn URL vào Cloudflare Worker.

Cài:
  pip install -r requirements.txt
  apt install ffmpeg   # hoặc brew install ffmpeg

Chạy:
  uvicorn app:app --host 0.0.0.0 --port 8788

Test:
  curl -X POST http://127.0.0.1:8788/resolve -H "Content-Type: application/json" -d "{\"url\":\"https://www.tiktok.com/@user/video/123\"}"
"""
from __future__ import annotations

import json
import os
import re
import subprocess
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="OneTool TikTok yt-dlp API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.environ.get("API_KEY", "").strip()
YTDLP = os.environ.get("YTDLP_PATH", "yt-dlp")
FFMPEG = os.environ.get("FFMPEG_PATH", "ffmpeg")


class ResolveBody(BaseModel):
    url: str


def check_auth(x_api_key: str | None) -> None:
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="API key không hợp lệ.")


def run_ytdlp(url: str) -> dict[str, Any]:
    cmd = [
        YTDLP,
        "-j",
        "--no-playlist",
        "--no-warnings",
        "-f",
        "best[ext=mp4]/best",
        url,
    ]
    if FFMPEG:
        cmd[1:1] = ["--ffmpeg-location", FFMPEG]

    try:
        out = subprocess.check_output(cmd, stderr=subprocess.STDOUT, timeout=120)
    except subprocess.CalledProcessError as e:
        raw = (e.output or b"").decode("utf-8", errors="replace")
        raise HTTPException(status_code=502, detail=raw[-400:] or "yt-dlp lỗi.")
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="yt-dlp quá thời gian chờ.")

    try:
        return json.loads(out.decode("utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="yt-dlp trả JSON lỗi.")


def pick_video_url(info: dict[str, Any]) -> str:
    direct = str(info.get("url") or "").strip()
    if direct.startswith("http"):
        return direct
    formats = info.get("formats") or []
    best = None
    for f in reversed(formats):
        u = str(f.get("url") or "").strip()
        if not u.startswith("http"):
            continue
        if f.get("vcodec") != "none" and (best is None or (f.get("height") or 0) > (best.get("height") or 0)):
            best = f
    if best:
        return str(best["url"])
    if direct:
        return direct
    raise HTTPException(status_code=502, detail="Không tìm thấy link video.")


def normalize(info: dict[str, Any]) -> dict[str, Any]:
    video_url = pick_video_url(info)
    title = str(info.get("title") or info.get("description") or "TikTok video").strip()
    cover = str(info.get("thumbnail") or "").strip()
    duration = int(info.get("duration") or 0)
    vid = str(info.get("id") or "")
    author = str(info.get("uploader") or info.get("creator") or "TikTok")
    unique = str(info.get("uploader_id") or info.get("channel_id") or "")
    size = int(info.get("filesize") or info.get("filesize_approx") or 0)

    videos = [
        {
            "id": "hd",
            "label": "MP4 · Không logo TikTok (yt-dlp)",
            "url": video_url,
            "quality": "hd" if (info.get("height") or 0) >= 720 else "sd",
        }
    ]

    return {
        "id": vid,
        "title": title,
        "cover": cover,
        "duration": duration,
        "region": "",
        "author": {"id": unique, "uniqueId": unique, "nickname": author},
        "stats": {"play": 0, "digg": 0, "comment": 0, "share": 0},
        "size": size,
        "hdSize": size,
        "videos": videos,
        "music": None,
        "images": [],
        "source": "ytdlp",
    }


@app.get("/")
@app.get("/health")
def health():
    return {"ok": True, "service": "onetool-ytdlp", "hasKey": bool(API_KEY)}


@app.post("/resolve")
def resolve(body: ResolveBody, x_api_key: str | None = Header(default=None)):
    check_auth(x_api_key)
    url = body.url.strip()
    if not re.search(r"tiktok\.com|vm\.tiktok|vt\.tiktok", url, re.I):
        raise HTTPException(status_code=400, detail="Link TikTok không hợp lệ.")
    info = run_ytdlp(url)
    return {"ok": True, "data": normalize(info)}
