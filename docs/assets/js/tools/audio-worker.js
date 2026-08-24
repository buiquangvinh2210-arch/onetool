/* Whisper chạy trong Worker — tránh treo / trắng UI thread */
import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

env.allowLocalModels = false;
env.useBrowserCache = true;
try {
  if (env.backends?.onnx?.wasm) {
    env.backends.onnx.wasm.numThreads = 1;
  }
} catch (_) { /* ignore */ }

let asr = null;

function progress(msg, pct) {
  self.postMessage({ type: "progress", msg, pct });
}

self.onmessage = async (ev) => {
  const data = ev.data || {};
  try {
    if (data.type === "init") {
      progress("Worker: tải Whisper tiny…", 10);
      asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny", {
        quantized: true,
        progress_callback: (p) => {
          if (!p) return;
          if (p.status === "progress" && p.total) {
            const pct = Math.round((p.loaded / p.total) * 100);
            progress(`Đang tải model… ${pct}%`, 10 + Math.min(45, (p.loaded / p.total) * 45));
          }
        }
      });
      progress("Model sẵn sàng.", 55);
      self.postMessage({ type: "ready" });
      return;
    }

    if (data.type === "transcribe") {
      if (!asr) throw new Error("Model chưa sẵn sàng.");
      progress("Đang nhận dạng giọng nói…", 70);
      const audio = new Float32Array(data.audio);
      const options = data.options || {};
      const result = await asr(audio, options);
      self.postMessage({
        type: "result",
        text: (result?.text || "").trim(),
        chunks: result?.chunks || []
      });
      return;
    }
  } catch (err) {
    self.postMessage({
      type: "error",
      message: err?.message || String(err)
    });
  }
};
