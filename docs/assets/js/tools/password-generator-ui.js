(function () {
  "use strict";

  const els = {
    length: document.getElementById("pwLength"),
    lengthVal: document.getElementById("pwLengthVal"),
    count: document.getElementById("pwCount"),
    lower: document.getElementById("optLower"),
    upper: document.getElementById("optUpper"),
    digits: document.getElementById("optDigits"),
    symbols: document.getElementById("optSymbols"),
    excludeAmbiguous: document.getElementById("optExcludeAmbiguous"),
    mainPwd: document.getElementById("mainPassword"),
    toggleVis: document.getElementById("toggleVis"),
    strengthBar: document.getElementById("strengthBar"),
    strengthLabel: document.getElementById("strengthLabel"),
    strengthMeta: document.getElementById("strengthMeta"),
    list: document.getElementById("pwList"),
    status: document.getElementById("status"),
    runBtn: document.getElementById("runBtn"),
    copyMainBtn: document.getElementById("copyMainBtn"),
    copyAllBtn: document.getElementById("copyAllBtn")
  };

  let lastPasswords = [];
  let hidden = true;

  function optsFromForm() {
    return {
      length: parseInt(els.length?.value, 10) || 16,
      count: parseInt(els.count?.value, 10) || 1,
      lower: !!els.lower?.checked,
      upper: !!els.upper?.checked,
      digits: !!els.digits?.checked,
      symbols: !!els.symbols?.checked,
      excludeAmbiguous: !!els.excludeAmbiguous?.checked
    };
  }

  function applyPreset(name) {
    const p = OTPassword.PRESETS[name];
    if (!p) return;
    if (els.length) els.length.value = p.length;
    if (els.lengthVal) els.lengthVal.textContent = p.length;
    if (els.lower) els.lower.checked = p.lower;
    if (els.upper) els.upper.checked = p.upper;
    if (els.digits) els.digits.checked = p.digits;
    if (els.symbols) els.symbols.checked = p.symbols;
    if (els.excludeAmbiguous) els.excludeAmbiguous.checked = p.excludeAmbiguous;
    document.querySelectorAll(".pg-preset").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.preset === name);
    });
    runGenerate({ silent: true });
  }

  function updateStrength(strength, password) {
    if (els.strengthBar) {
      const pct = Math.min(100, Math.round((strength.bits / 80) * 100));
      els.strengthBar.style.width = pct + "%";
      els.strengthBar.dataset.level = String(strength.level);
    }
    if (els.strengthLabel) els.strengthLabel.textContent = strength.label;
    if (els.strengthMeta) {
      els.strengthMeta.textContent =
        strength.bits + " bit · bảng " + strength.pool + " ký tự · " + password.length + " ký tự";
    }
  }

  function renderList(passwords) {
    if (!els.list) return;
    if (passwords.length <= 1) {
      els.list.innerHTML = "";
      els.list.hidden = true;
      if (els.copyAllBtn) els.copyAllBtn.disabled = true;
      return;
    }
    els.list.hidden = false;
    els.list.innerHTML = passwords
      .map(
        (pwd, i) => `
      <div class="pg-row">
        <span class="pg-row-num">${i + 1}</span>
        <code class="pg-row-pwd">${escapeHtml(pwd)}</code>
        <button type="button" class="pg-row-copy" data-i="${i}" title="Sao chép">Sao chép</button>
      </div>`
      )
      .join("");
    if (els.copyAllBtn) els.copyAllBtn.disabled = false;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showMain(password) {
    if (!els.mainPwd) return;
    els.mainPwd.value = password;
    els.mainPwd.type = hidden ? "password" : "text";
    if (els.copyMainBtn) els.copyMainBtn.disabled = !password;
  }

  function runGenerate({ silent } = {}) {
    try {
      const opts = optsFromForm();
      const { passwords, strength } = OTPassword.generate(opts);
      lastPasswords = passwords;
      showMain(passwords[0]);
      updateStrength(strength, passwords[0]);
      renderList(passwords);
      OT.setLastResult?.({
        text: passwords.join("\n"),
        fileName: "passwords.txt",
        contentType: "text/plain;charset=utf-8"
      });
      if (els.status) {
        els.status.textContent =
          passwords.length > 1
            ? "Đã tạo " + passwords.length + " mật khẩu — sao chép từng dòng hoặc tất cả."
            : "Mật khẩu mới — sao chép và lưu vào quản lý mật khẩu.";
        els.status.className = "pg-status is-ok";
      }
      if (!silent) showToast?.("Đã tạo mật khẩu!", "success");
    } catch (e) {
      if (els.status) {
        els.status.textContent = e.message || String(e);
        els.status.className = "pg-status is-err";
      }
      if (!silent) showToast?.(e.message || "Không tạo được.", "error");
    }
  }

  els.length?.addEventListener("input", () => {
    if (els.lengthVal) els.lengthVal.textContent = els.length.value;
    runGenerate({ silent: true });
  });

  els.count?.addEventListener("change", () => runGenerate({ silent: true }));

  [els.lower, els.upper, els.digits, els.symbols, els.excludeAmbiguous].forEach((el) => {
    el?.addEventListener("change", () => runGenerate({ silent: true }));
  });

  document.getElementById("presetGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".pg-preset");
    if (!btn) return;
    applyPreset(btn.dataset.preset);
  });

  els.toggleVis?.addEventListener("click", () => {
    hidden = !hidden;
    if (els.mainPwd) els.mainPwd.type = hidden ? "password" : "text";
    els.toggleVis.textContent = hidden ? "Hiện" : "Ẩn";
    els.toggleVis.setAttribute("aria-pressed", hidden ? "false" : "true");
  });

  els.runBtn?.addEventListener("click", () => {
    OT.setBusy?.(els.runBtn, true, "Đang tạo…");
    runGenerate();
    OT.setBusy?.(els.runBtn, false);
  });

  els.copyMainBtn?.addEventListener("click", async () => {
    if (!lastPasswords[0]) return;
    try {
      await OT.copyText(lastPasswords[0]);
      showToast?.("Đã sao chép!", "success");
    } catch (e) {
      showToast?.(e.message || "Không sao chép được.", "error");
    }
  });

  els.copyAllBtn?.addEventListener("click", async () => {
    if (!lastPasswords.length) return;
    try {
      await OT.copyText(lastPasswords.join("\n"));
      showToast?.("Đã sao chép " + lastPasswords.length + " mật khẩu!", "success");
    } catch (e) {
      showToast?.(e.message || "Không sao chép được.", "error");
    }
  });

  els.list?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".pg-row-copy");
    if (!btn) return;
    const i = parseInt(btn.dataset.i, 10);
    const pwd = lastPasswords[i];
    if (!pwd) return;
    try {
      await OT.copyText(pwd);
      btn.textContent = "Đã copy";
      setTimeout(() => { btn.textContent = "Sao chép"; }, 1200);
    } catch (err) {
      showToast?.(err.message || "Không sao chép được.", "error");
    }
  });

  applyPreset("strong");
})();
