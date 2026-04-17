
"use strict";

const REF_API = "https://career.uisto.edu.ng/api/v1/";

/* ── Helpers ─────────────────────────────────────────────── */
function qs(id) { return document.getElementById(id); }

function showToast(message, type = "info") {
  let container = qs("toast-container");
  const C = {
    success: { bg: "#0f5132", border: "#198754", icon: "✓" },
    error:   { bg: "#6f1a1a", border: "#dc3545", icon: "✕" },
    info:    { bg: "#084298", border: "#0d6efd", icon: "ℹ" },
    warning: { bg: "#664d03", border: "#ffc107", icon: "⚠" },
  }[type] || { bg: "#084298", border: "#0d6efd", icon: "ℹ" };

  const t = document.createElement("div");
  t.style.cssText = [
    `background:${C.bg}`, `border:1px solid ${C.border}`,
    "color:#fff", "border-radius:10px", "padding:14px 16px",
    "font-size:14px", "display:flex", "gap:12px", "align-items:flex-start",
    "box-shadow:0 8px 24px rgba(0,0,0,.35)", "pointer-events:all",
    "opacity:0", "transform:translateX(40px)", "transition:opacity .3s,transform .3s",
    "max-width:360px",
  ].join(";");
  t.innerHTML = `
    <span style="font-size:18px;line-height:1;flex-shrink:0">${C.icon}</span>
    <span style="flex:1;line-height:1.4">${message}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:#fff;cursor:pointer;font-size:16px;padding:0;flex-shrink:0">×</button>`;
  container.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = "1"; t.style.transform = "translateX(0)"; });
  setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateX(40px)"; setTimeout(() => t.remove(), 350); }, 6000);
}

function showState(name) {
  ["loading", "error", "success"].forEach(s => {
    qs(`state-${s}`).classList.toggle("active", s === name);
  });
  qs("main-form").style.display = name ? "none" : "block";
  if (name === null) qs("main-form").style.display = "block"; // show form
}

/* ── Token from URL ──────────────────────────────────────── */
function getToken() {
  return new URLSearchParams(window.location.search).get("token") || "";
}

/* ── Fetch referee form data from API ────────────────────── */
async function loadRefereeForm(token) {
  showState("loading");

  try {
    const res = await fetch(`${REF_API}referee/${token}`);
    const data = await res.json();

    // API returns a flat object — treat a non-OK HTTP status as a failure.
    if (!res.ok) {
      qs("error-msg").textContent =
        data.message || "This referee link is invalid or has already expired.";
      showState("error");
      return;
    }

    // ── Response shape: { refereeName, applicantName, jobTitle, university, gender? }
    const refereeName   = data.refereeName   || "Referee";
    const applicantName = data.applicantName || "the applicant";
    const positionTitle = data.jobTitle      || "the advertised position";
    const university    = data.university    || "UISTO";

    // Gender-aware pronouns (API may send "Male", "Female", or nothing)
    const gender = (data.gender || "").toLowerCase();
    const pronoun = gender === "male" ? "his" : gender === "female" ? "her" : "their";

    // ── Salutation
    qs("ref-salutation").textContent = `Dear ${refereeName},`;

    // ── Intro paragraph (use innerHTML for .highlight spans)
    qs("ref-intro-text").innerHTML =
      `<span class="highlight">${applicantName}</span> has applied for the position of ` +
      `<span class="highlight">${positionTitle}</span> at the ` +
      `<span class="highlight">${university}</span> and has nominated you as ` +
      `${pronoun} referee.`;

    // Show the form
    showState(null);

  } catch (err) {
    console.error("Referee form load error:", err);
    qs("error-msg").textContent = "A network error occurred. Please check your connection and try again.";
    showState("error");
  }
}

/* ── Submit reference ────────────────────────────────────── */
async function submitReference(e) {
  e.preventDefault();

  const token = getToken();
  if (!token) { showToast("Missing referee token.", "error"); return; }

  const referenceText = qs("ref-text").value.trim();
  if (!referenceText) {
    showToast("Please write your reference before submitting.", "warning");
    qs("ref-text").focus();
    return;
  }

  // Word limit guard
  const wordCount = referenceText.split(/\s+/).filter(Boolean).length;
  if (wordCount > 1000) {
    showToast(`Your reference exceeds 1000 words (${wordCount} words). Please shorten it.`, "error");
    qs("ref-text").focus();
    return;
  }

  const referenceFile = qs("ref-file").files[0] || null;

  // File size guard (10 MB)
  if (referenceFile && referenceFile.size > 10 * 1024 * 1024) {
    showToast("File is too large. Maximum size is 10 MB.", "error");
    return;
  }

  const fd = new FormData();
  fd.append("referenceText", referenceText);
  if (referenceFile) fd.append("referenceFile", referenceFile);

  const btn = qs("submit-btn");
  const origHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="btn-spinner"></span> Submitting…`;

  try {
    const res = await fetch(`${REF_API}referees/submit/${encodeURIComponent(token)}`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || `Server error ${res.status}`);
    }

    showState("success");

  } catch (err) {
    console.error("Referee submit error:", err);
    showToast(`Submission failed: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = origHTML;
  }
}

/* ── File label update ───────────────────────────────────── */
function setupFileInput() {
  const input = qs("ref-file");
  const zone  = qs("ref-file-zone");
  const label = qs("ref-file-label");

  input.addEventListener("change", () => {
    if (input.files?.length) {
      label.textContent = input.files[0].name;
      zone.classList.add("has-file");
    } else {
      label.textContent = "Click to upload or drag & drop";
      zone.classList.remove("has-file");
    }
  });

  // Drag-and-drop
  zone.addEventListener("dragover", e => { e.preventDefault(); zone.style.borderColor = "#c9a84c"; });
  zone.addEventListener("dragleave", () => { zone.style.borderColor = ""; });
  zone.addEventListener("drop", e => {
    e.preventDefault();
    zone.style.borderColor = "";
    const files = e.dataTransfer.files;
    if (files.length) {
      input.files = files;
      label.textContent = files[0].name;
      zone.classList.add("has-file");
    }
  });
}

/* ── Word count countdown ──────────────────────────── */
function setupWordCount() {
  const LIMIT   = 1000;
  const textarea = qs("ref-text");
  const counter  = qs("word-count");

  textarea.addEventListener("input", () => {
    const words     = textarea.value.trim().split(/\s+/).filter(Boolean).length;
    const remaining = LIMIT - words;
    counter.textContent = remaining < 0 ? 0 : remaining;
    counter.classList.toggle("warn", remaining >= 0 && remaining <= 100);
    counter.classList.toggle("over", remaining < 0);
  });
}

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // Set footer year
  const yr = qs("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  // Wire form submit
  qs("referee-form").addEventListener("submit", submitReference);

  // File input
  setupFileInput();

  // Word count
  setupWordCount();

  // "HERE" link opens the file picker
  const attachLink = qs("attach-link");
  if (attachLink) {
    attachLink.addEventListener("click", () => qs("ref-file").click());
  }

  // Load data
  const token = getToken();
  if (!token) {
    qs("error-msg").textContent = "No referee token found in this link. Please use the link provided in your invitation email.";
    showState("error");
    return;
  }

  loadRefereeForm(token);
});
