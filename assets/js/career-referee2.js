
"use strict";

const REF_API = "https://career.uisto.edu.ng/api/v1/";

/* ── Current submission mode ─────────────────────────────── */
let currentMode = "text"; // "text" | "upload"
let quillEditor = null;

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

/* ── Mode tab switcher (global, called from HTML onclick) ── */
window.switchMode = function switchMode(mode) {
  currentMode = mode;

  // Tabs
  qs("tab-text").classList.toggle("active", mode === "text");
  qs("tab-upload").classList.toggle("active", mode === "upload");
  qs("tab-text").setAttribute("aria-selected", mode === "text");
  qs("tab-upload").setAttribute("aria-selected", mode === "upload");

  // Panels
  qs("panel-text").classList.toggle("active", mode === "text");
  qs("panel-upload").classList.toggle("active", mode === "upload");
};

/* ── Token from URL ──────────────────────────────────────── */
function getToken() {
  const match = window.location.pathname.match(/\/referee\/([^/]+)/);
  return match ? match[1] : "";
}

console.log("Extracted token:", getToken());
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

  const fd = new FormData();

  if (currentMode === "text") {
    // ── Text editor mode: get plain text + HTML from Quill
    const plainText = quillEditor ? quillEditor.getText().trim() : "";
    const htmlText  = quillEditor ? quillEditor.getSemanticHTML() : "";

    if (!plainText) {
      showToast("Please write your reference before submitting.", "warning");
      quillEditor && quillEditor.focus();
      return;
    }

    // Word limit guard
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    if (wordCount > 1000) {
      showToast(`Your reference exceeds 1000 words (${wordCount} words). Please shorten it.`, "error");
      quillEditor && quillEditor.focus();
      return;
    }

    fd.append("referenceText", plainText);
    fd.append("referenceTextHtml", htmlText);

  } else {
    // ── Upload mode: must have a file
    const referenceFile = qs("ref-file").files[0] || null;

    if (!referenceFile) {
      showToast("Please upload your reference document before submitting.", "warning");
      return;
    }

    // File size guard (10 MB)
    if (referenceFile.size > 10 * 1024 * 1024) {
      showToast("File is too large. Maximum size is 10 MB.", "error");
      return;
    }

    fd.append("referenceFile", referenceFile);
  }

  const btn = qs("submit-btn");
  const origHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="btn-spinner"></span> Submitting…`;

  try {
    const res = await fetch(`${REF_API}referee/${encodeURIComponent(token)}`, {
      method: "POST",
      body: fd,
    });

    // Safe parse — server might return HTML on unexpected errors
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : { message: `Server returned ${res.status} (${res.statusText})` };

    if (!res.ok) {
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

/* ── Quill initialisation ────────────────────────────────── */
function setupQuillEditor() {
  const LIMIT = 1000;
  const counter = qs("word-count");

  quillEditor = new Quill("#ref-editor", {
    theme: "snow",
    placeholder: "Write your reference here — include your professional assessment of the applicant's skills, character, work ethic, and suitability for the role…",
    modules: {
      toolbar: [
        [{ header: [false, 2, 3] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote"],
        ["clean"],
      ],
    },
  });

  // Live word count
  quillEditor.on("text-change", () => {
    const text  = quillEditor.getText().trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const remaining = LIMIT - words;
    counter.textContent = remaining < 0 ? 0 : remaining;
    counter.classList.toggle("warn", remaining >= 0 && remaining <= 100);
    counter.classList.toggle("over", remaining < 0);
  });

  // Focus ring helper
  const wrapper = qs("ref-editor-wrapper");
  quillEditor.on("selection-change", range => {
    wrapper.classList.toggle("ql-editor-focused-wrapper", !!range);
  });
}

/* ── File label update ───────────────────────────────────── */
function setupFileInput() {
  const input    = qs("ref-file");
  const zone     = qs("ref-file-zone");
  const label    = qs("ref-file-label");
  const fnBox    = qs("drop-filename");
  const fnText   = qs("drop-filename-text");

  function applyFile(file) {
    if (file) {
      label.textContent = "File selected — click to replace";
      zone.classList.add("has-file");
      fnBox.classList.add("visible");
      fnText.textContent = file.name;
    } else {
      label.textContent = "Click to upload or drag & drop";
      zone.classList.remove("has-file");
      fnBox.classList.remove("visible");
      fnText.textContent = "";
    }
  }

  input.addEventListener("change", () => {
    applyFile(input.files?.[0] || null);
  });

  // Drag-and-drop
  zone.addEventListener("dragover", e => { e.preventDefault(); zone.style.borderColor = "#c9a84c"; });
  zone.addEventListener("dragleave", () => { zone.style.borderColor = ""; });
  zone.addEventListener("drop", e => {
    e.preventDefault();
    zone.style.borderColor = "";
    const files = e.dataTransfer.files;
    if (files.length) {
      // Only accept PDF
      if (!files[0].name.toLowerCase().endsWith(".pdf")) {
        showToast("Only PDF files are accepted.", "warning");
        return;
      }
      input.files = files;
      applyFile(files[0]);
    }
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

  // Quill editor
  setupQuillEditor();

  // Load data
  const token = getToken();
  if (!token) {
    qs("error-msg").textContent = "No referee token found in this link. Please use the link provided in your invitation email.";
    showState("error");
    return;
  }

  loadRefereeForm(token);
});
