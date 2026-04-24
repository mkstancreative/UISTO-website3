const APP_API_URL = "https://career.uisto.edu.ng/api/v1/";
const COUNTRIES_API = "https://countriesnow.space/api/v0.1";

/* ── Role Type State ─────────────────────────────────── */
let currentRoleType = "academic"; // "academic" | "non-academic"

function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = [
      "position:fixed",
      "top:24px",
      "right:24px",
      "z-index:99999",
      "display:flex",
      "flex-direction:column",
      "gap:10px",
      "max-width:360px",
      "pointer-events:none",
    ].join(";");
    document.body.appendChild(container);
  }

  const C = {
    success: { bg: "#0f5132", border: "#198754", icon: "✓" },
    error: { bg: "#6f1a1a", border: "#dc3545", icon: "✕" },
    info: { bg: "#084298", border: "#0d6efd", icon: "ℹ" },
    warning: { bg: "#664d03", border: "#ffc107", icon: "⚠" },
  }[type] || { bg: "#084298", border: "#0d6efd", icon: "ℹ" };

  const t = document.createElement("div");
  t.className = "ca-toast";
  t.style.cssText = [
    `background:${C.bg}`,
    `border:1px solid ${C.border}`,
    "color:#fff",
    "border-radius:10px",
    "padding:14px 16px",
    "font-size:14px",
    "display:flex",
    "gap:12px",
    "align-items:flex-start",
    "box-shadow:0 8px 24px rgba(0,0,0,.35)",
    "pointer-events:all",
    "opacity:0",
    "transform:translateX(40px)",
    "transition:opacity .3s,transform .3s",
  ].join(";");
  t.innerHTML = `
        <span style="font-size:18px;line-height:1;flex-shrink:0">${C.icon}</span>
        <span style="flex:1;line-height:1.4">${message}</span>
        <button onclick="this.closest('.ca-toast').remove()"
            style="background:none;border:none;color:#fff;cursor:pointer;font-size:16px;padding:0;flex-shrink:0">×</button>`;
  container.appendChild(t);
  requestAnimationFrame(() => {
    t.style.opacity = "1";
    t.style.transform = "translateX(0)";
  });
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(40px)";
    setTimeout(() => t.remove(), 350);
  }, 5500);
}

/* ══════════════════════════════════════════════════════════════
   NIGERIAN STATES / LGA
   ══════════════════════════════════════════════════════════════ */
async function loadNigerianStates() {
  const sel = document.getElementById("apply-state");
  if (!sel) return;
  sel.innerHTML = `<option value="" disabled selected hidden>Loading states…</option>`;
  try {
    const res = await fetch(`${COUNTRIES_API}/countries/states`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: "Nigeria" }),
    });
    const json = await res.json();
    if (json.error || !json.data?.states) throw new Error();
    sel.innerHTML = `<option value="" disabled selected hidden>Select State</option>`;
    json.data.states.forEach((s) => {
      const o = document.createElement("option");
      o.value = s.name;
      o.textContent = s.name;
      sel.appendChild(o);
    });
  } catch {
    sel.innerHTML = `<option value="" disabled selected hidden>Error loading states</option>`;
  }
}

/* ── State name normalization: maps API state names → what cities endpoint accepts ── */
const STATE_NAME_MAP = {
  "Abuja Federal Capital Territory": "Federal Capital Territory",
  "FCT": "Federal Capital Territory",
};

/* ── Hardcoded LGAs for states the API can't resolve ── */
const FALLBACK_LGAS = {
  "Federal Capital Territory": [
    "Abaji", "Abuja Municipal Area Council", "Bwari",
    "Gwagwalada", "Kuje", "Kwali"
  ],
};

async function onStateChange() {
  const stateName = document.getElementById("apply-state").value;
  const lgaSel = document.getElementById("apply-lga");
  lgaSel.innerHTML = `<option value="" disabled selected hidden>Loading LGAs…</option>`;
  if (!stateName) {
    lgaSel.innerHTML = `<option value="" disabled selected hidden>Select LGA</option>`;
    return;
  }

  // Normalize state name for the cities API
  const apiStateName = STATE_NAME_MAP[stateName] || stateName;

  // Check hardcoded fallback first
  if (FALLBACK_LGAS[apiStateName]) {
    lgaSel.innerHTML = `<option value="" disabled selected hidden>Select LGA</option>`;
    FALLBACK_LGAS[apiStateName].forEach((lga) => {
      const o = document.createElement("option");
      o.value = lga;
      o.textContent = lga;
      lgaSel.appendChild(o);
    });
    return;
  }

  try {
    const res = await fetch(`${COUNTRIES_API}/countries/state/cities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: "Nigeria", state: apiStateName }),
    });
    const json = await res.json();
    if (json.error || !json.data) throw new Error();
    lgaSel.innerHTML = `<option value="" disabled selected hidden>Select LGA</option>`;
    json.data.forEach((city) => {
      const o = document.createElement("option");
      o.value = city;
      o.textContent = city;
      lgaSel.appendChild(o);
    });
  } catch {
    lgaSel.innerHTML = `<option value="" disabled selected hidden>Error loading LGAs</option>`;
  }
}


/* ══════════════════════════════════════════════════════════════
   MODAL OPEN / CLOSE
   ══════════════════════════════════════════════════════════════ */
function openApplyModal() {
  document.getElementById("career-apply-form")?.reset();
  // hide preview card on fresh open
  const card = document.getElementById("job-preview-card");
  if (card) card.style.display = "none";
  // hide ICT detail fields until checkbox is checked
  const ictWrap = document.getElementById("ict-fields-wrap");
  if (ictWrap) ictWrap.style.display = "none";
  _goto(1);
  clearAllErrors();
  resetFileLabels();
  setRoleType("academic"); // default to academic on open
  loadNigerianStates();
  if (typeof loadJobSelector === "function") loadJobSelector();
  document.getElementById("apply-overlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeApplyModal() {
  document.getElementById("apply-overlay").classList.remove("active");
  document.body.style.overflow = "";
  // Reset success panel so modal is clean on next open
  document.getElementById("apply-success")?.classList.remove("active");
  _goto(1);
}

/* ══════════════════════════════════════════════════════════════
   STATUS MODAL
   ══════════════════════════════════════════════════════════════ */
function openStatusModal() {
  document.getElementById("status-app-id").value = "";
  document.getElementById("status-email").value = "";
  document.getElementById("status-result").style.display = "none";
  document.getElementById("status-overlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeStatusModal() {
  document.getElementById("status-overlay").classList.remove("active");
  document.body.style.overflow = "";
}

async function checkApplicationStatus() {
  const appId = document.getElementById("status-app-id").value.trim();
  const email = document.getElementById("status-email").value.trim();
  const resultDiv = document.getElementById("status-result");
  const btn = document.getElementById("status-check-btn");

  if (!appId || !email) {
    showToast("Please enter both Application ID and Email.", "warning");
    return;
  }

  // Set loading state
  btn.innerHTML = `<span class="btn-spinner"></span> Checking...`;
  btn.disabled = true;
  resultDiv.style.display = "none";

  try {
    const res = await fetch(
      `${APP_API_URL}applications/status/${encodeURIComponent(appId)}?email=${encodeURIComponent(email)}`,
    );
    const data = await res.json();

    if (res.ok && data.success) {
      // Success - show result card
      const resultData = data.data;
      const subdate = new Date(resultData.appliedAt).toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
      );

      const positionTitle =
        resultData.job?.position?.title || "Position applied for";

      // Prefer the shortlisting status if available, fallback to the base status
      const mainStatus = resultData.status || "Pending";
      const badgeClass = "status-" + mainStatus.toLowerCase();

      resultDiv.innerHTML = `
                <div class="result-card">
                    <div class="result-header">
                        <span class="result-role">${positionTitle}</span>
                        <span class="result-badge ${badgeClass}">${mainStatus}</span>
                    </div>
                    <div class="result-meta">
                        <div><strong>Application ID:</strong> ${resultData.applicationId}</div>
                        <div><strong>Submitted on:</strong> ${subdate}</div>
                    </div>
                    ${
                      mainStatus === "Shortlisted"
                        ? `
                    <div class="result-message result-msg-success">
                        Congratulations! You have been shortlisted. Please check your email for the next steps.
                    </div>`
                        : ""
                    }
                    ${
                      mainStatus === "Pending" || mainStatus === "Submitted"
                        ? `
                    <div class="result-message result-msg-info">
                        Your application has been received and is currently under review.
                    </div>`
                        : ""
                    }
                     ${
                       mainStatus === "Rejected"
                         ? `
                    <div class="result-message result-msg-error">
                        Unfortunately, your application was not successful at this time.
                    </div>`
                         : ""
                     }
                </div>
            `;
      resultDiv.style.display = "block";
    } else {
      showToast(
        data.message || "Application not found. Please check your details.",
        "error",
      );
    }
  } catch (err) {
    console.error("Status check error:", err);
    showToast("Network error. Please try again later.", "error");
  } finally {
    // Reset button
    btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Check Status
        `;
    btn.disabled = false;
  }
}

/* ══════════════════════════════════════════════════════════════
   ICT FIELDS TOGGLE
   ══════════════════════════════════════════════════════════════ */
function toggleIctFields(checkbox) {
  const wrap = document.getElementById("ict-fields-wrap");
  if (!wrap) return;
  if (checkbox.checked) {
    wrap.style.display = "grid";
    // Animate in
    wrap.style.opacity = "0";
    wrap.style.transform = "translateY(-6px)";
    wrap.style.transition = "opacity 0.22s ease, transform 0.22s ease";
    requestAnimationFrame(() => {
      wrap.style.opacity = "1";
      wrap.style.transform = "translateY(0)";
    });
  } else {
    wrap.style.opacity = "0";
    wrap.style.transform = "translateY(-6px)";
    setTimeout(() => {
      wrap.style.display = "none";
    }, 220);
    // Clear values when hidden
    document.getElementById("apply-computer-skills").value = "";
    document.getElementById("apply-prof-certs").value = "";
  }
}

/* ══════════════════════════════════════════════════════════════
   REFEREE 2 TOGGLE
   ══════════════════════════════════════════════════════════════ */
function toggleReferee2() {
  const wrap = document.getElementById("referee2-wrap");
  const lbl = document.getElementById("referee2-btn-label");
  if (!wrap) return;

  const isVisible = wrap.style.display === "block";
  if (!isVisible) {
    wrap.style.display = "block";
    wrap.style.opacity = "0";
    wrap.style.transform = "translateY(-6px)";
    wrap.style.transition = "opacity 0.22s ease, transform 0.22s ease";
    requestAnimationFrame(() => {
      wrap.style.opacity = "1";
      wrap.style.transform = "translateY(0)";
    });
    if (lbl) lbl.textContent = "Remove Second Referee";
  } else {
    wrap.style.opacity = "0";
    wrap.style.transform = "translateY(-6px)";
    setTimeout(() => {
      wrap.style.display = "none";
    }, 220);
    if (lbl) lbl.textContent = "Add Second Referee";
  }
}

/* ══════════════════════════════════════════════════════════════
   REFEREE 3 TOGGLE
   ══════════════════════════════════════════════════════════════ */
function toggleReferee3() {
  const wrap = document.getElementById("referee3-wrap");
  const lbl = document.getElementById("referee3-btn-label");
  if (!wrap) return;

  const isVisible = wrap.style.display === "block";
  if (!isVisible) {
    wrap.style.display = "block";
    wrap.style.opacity = "0";
    wrap.style.transform = "translateY(-6px)";
    wrap.style.transition = "opacity 0.22s ease, transform 0.22s ease";
    requestAnimationFrame(() => {
      wrap.style.opacity = "1";
      wrap.style.transform = "translateY(0)";
    });
    if (lbl) lbl.textContent = "Remove Third Referee";
  } else {
    wrap.style.opacity = "0";
    wrap.style.transform = "translateY(-6px)";
    setTimeout(() => {
      wrap.style.display = "none";
    }, 220);
    if (lbl) lbl.textContent = "Add Third Referee";
  }
}

/* ══════════════════════════════════════════════════════════════
   ROLE TYPE TOGGLE
   ══════════════════════════════════════════════════════════════ */
function setRoleType(type, skipFilter = false) {
  currentRoleType = type;

  // Update tab UI
  document
    .querySelectorAll(".role-tab")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById(`role-tab-${type}`)?.classList.add("active");

  // Show/hide academic-only fields
  document.querySelectorAll(".academic-only").forEach((el) => {
    el.classList.toggle("hidden", type !== "academic");
  });

  // Show/hide non-academic-only fields
  document.querySelectorAll(".non-academic-only").forEach((el) => {
    el.classList.toggle("hidden", type !== "non-academic");
  });

  // Update position label in modal header
  const lbl = document.getElementById("apply-position-label");
  if (lbl) {
    lbl.textContent =
      type === "academic"
        ? "Academic Staff Position"
        : "Non-Academic Staff Position";
  }

  // ✅ ADD THIS
  if (!skipFilter) {
    onRoleTypeFilterChange(type);
  }
}

/* ══════════════════════════════════════════════════════════════
   STEP NAVIGATION  (steps 1 / 2 / 3)
   ══════════════════════════════════════════════════════════════ */
const STEPS = 3;

function _goto(n) {
  for (let i = 1; i <= STEPS; i++) {
    document
      .getElementById(`apply-step-${i}`)
      ?.classList.toggle("active", i === n);
    document
      .getElementById(`apply-step-indicator-${i}`)
      ?.classList.toggle("active", i === n);
  }
  document
    .getElementById("apply-overlay")
    ?.querySelector(".apply-modal")
    ?.scrollTo(0, 0);
}

function goToStep1() {
  _goto(1);
}
function goToStep2() {
  if (_validateStep1()) _goto(2);
}
function goToStep3() {
  if (_validateStep2()) _goto(3);
}

/* ══════════════════════════════════════════════════════════════
   FILE LABEL HELPERS
   ══════════════════════════════════════════════════════════════ */
function updateFileLabel(inputId, labelId) {
  const inp = document.getElementById(inputId);
  const lbl = document.getElementById(labelId);
  if (!inp || !lbl) return;
  if (inp.files?.length) {
    lbl.textContent = inp.multiple
      ? `${inp.files.length} file(s) selected`
      : inp.files[0].name;
    lbl.classList.add("has-file");
  } else {
    lbl.textContent = lbl.dataset.default;
    lbl.classList.remove("has-file");
  }
}

function resetFileLabels() {
  ["apply-cover-label", "apply-cv-label", "apply-docs-label"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = el.dataset.default;
      el.classList.remove("has-file");
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   VALIDATION
   ══════════════════════════════════════════════════════════════ */
function _showErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("error");
  let span = el.parentElement.querySelector(".field-error");
  if (!span) {
    span = document.createElement("span");
    span.className = "field-error";
    el.parentElement.appendChild(span);
  }
  span.textContent = msg;
}
function _clearErr(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("error");
  el.parentElement?.querySelector(".field-error")?.remove();
}
function clearAllErrors() {
  document
    .querySelectorAll(".apply-modal .error")
    .forEach((el) => el.classList.remove("error"));
  document
    .querySelectorAll(".apply-modal .field-error")
    .forEach((el) => el.remove());
}

function _req(id, label, errors) {
  _clearErr(id);
  const el = document.getElementById(id);
  if (!el || !el.value.trim()) {
    _showErr(id, `${label} is required.`);
    errors.push(id);
  }
}

function _validateStep1() {
  const errs = [];

  const jobId = document.getElementById("apply-position-id")?.value?.trim();
  if (!jobId) {
    _showErr("apply-job-select", "Position is required.");
    errs.push("apply-job-select");
  } else {
    _clearErr("apply-job-select");
  }

  _req("apply-firstname", "First name", errs);
  _req("apply-lastname", "Last name", errs);
  _req("apply-dob", "Date of birth", errs);
  // DOB age range: 18–65 years
  const dobEl = document.getElementById("apply-dob");
  if (dobEl?.value) {
    const dob = new Date(dobEl.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    if (age < 18) {
      _showErr("apply-dob", "Applicant must be at least 18 years old.");
      errs.push("apply-dob");
    } else if (age > 65) {
      _showErr("apply-dob", "Applicant must not be older than 65 years.");
      errs.push("apply-dob");
    }
  }
  _req("apply-phone", "Phone number", errs);
  _req("apply-email", "Email address", errs);
  _req("apply-state", "State", errs);
  _req("apply-lga", "LGA", errs);
  _req("apply-gender", "Gender", errs);
  _req("apply-marital", "Marital Status", errs);
  _req("apply-nin", "National Identification Number (NIN)", errs);
  _req("apply-address", "Home address", errs);
  const em = document.getElementById("apply-email");
  if (em?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) {
    _showErr("apply-email", "Enter a valid email address.");
    errs.push("apply-email");
  }
  // NIN must be exactly 11 digits
  const ninEl = document.getElementById("apply-nin");
  if (ninEl?.value && !/^\d{11}$/.test(ninEl.value.trim())) {
    _showErr("apply-nin", "NIN must be exactly 11 digits.");
    errs.push("apply-nin");
  }
  // Academic-only: Department is on Step 1 — validate it here
  if (currentRoleType === "academic") {
    _req("apply-department", "Department", errs);
  }

  if (errs.length)
    showToast("Please complete all required personal details.", "warning");
  return errs.length === 0;
}

function _validateStep2() {
  const errs = [];
  const isAcademic = currentRoleType === "academic";

  // Common required fields
  _req("apply-degree-type", "Degree type", errs);
  _req("apply-institution", "Institution", errs);

  // Programme & PhD field — required for ALL applicants
  _req("apply-programme", "Programme", errs);
  // PhD degree field required for all when PhD is selected
  const degType = document.getElementById("apply-degree-type")?.value;
  if (degType === "phd") {
    _req("apply-phd-degree", "PhD Degree Field", errs);
  }

  // Referee required fields
  _req("apply-referee-name", "Referee 1 name", errs);
  _req("apply-referee-email", "Referee 1 email", errs);

  _req("apply-referee2-name", "Referee 2 name", errs);
  _req("apply-referee2-email", "Referee 2 email", errs);

  _req("apply-referee3-name", "Referee 3 name", errs);
  _req("apply-referee3-email", "Referee 3 email", errs);

  // Academic-only required fields
  if (isAcademic) {
    _req("apply-year-awarded", "Year awarded", errs);
    _req("apply-teaching-years", "Teaching years", errs);
    _req("apply-research-years", "Research years", errs);
    _req("apply-publications", "Number of publications", errs);
  }

  // Non-academic required fields
  if (!isAcademic) {
    _req(
      "apply-post-qual-years",
      "Post qualification working experience",
      errs,
    );
  }

  // Industry years — mandatory for all
  _req("apply-industry-years", "Years of industry experience", errs);

  const validateEmail = (id) => {
    const el = document.getElementById(id);
    if (el?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
      _showErr(id, "Enter a valid referee email.");
      errs.push(id);
    }
  };
  validateEmail("apply-referee-email");
  validateEmail("apply-referee2-email");
  validateEmail("apply-referee3-email");

  // Auto-open hidden wrappers if they contain errors
  if (errs.some((e) => e.includes("referee2"))) {
    const wrap2 = document.getElementById("referee2-wrap");
    if (wrap2 && wrap2.style.display !== "block") toggleReferee2();
  }
  if (errs.some((e) => e.includes("referee3"))) {
    const wrap3 = document.getElementById("referee3-wrap");
    if (wrap3 && wrap3.style.display !== "block") toggleReferee3();
  }

  if (errs.length)
    showToast(
      "Please complete qualifications, experience, and referee details.",
      "warning",
    );
  return errs.length === 0;
}

function _validateRoleType() {
  if (!currentRoleType) {
    showToast(
      "Please select a position type (Academic or Non-Teaching).",
      "warning",
    );
    return false;
  }
  return true;
}

function _validateStep3() {
  const cv = document.getElementById("apply-cv");
  if (!cv || cv.files.length === 0) {
    showToast("CV / Resume is required.", "error");
    return false;
  }
  return true;
}

/* ══════════════════════════════════════════════════════════════
   SUBMIT — builds FormData to exactly match Postman payload
   ══════════════════════════════════════════════════════════════ */
async function submitApplication(e) {
  e.preventDefault();
  if (!_validateRoleType()) return;
  if (!_validateStep3()) return;

  const jobId = document.getElementById("apply-position-id")?.value?.trim();
  if (!jobId) {
    showToast(
      "Please select a position from the dropdown on Step 1.",
      "warning",
    );
    _goto(1);
    document.getElementById("apply-job-select")?.focus();
    return;
  }

  /* ── personalInfo ── */
  const personalInfo = {
    firstName: document.getElementById("apply-firstname").value.trim(),
    middleName: document.getElementById("apply-middlename")?.value.trim() || "",
    lastName: document.getElementById("apply-lastname").value.trim(),
    email: document.getElementById("apply-email").value.trim(),
    phone: document.getElementById("apply-phone").value.trim(),
    dateOfBirth: document.getElementById("apply-dob").value,
    gender: document.getElementById("apply-gender")?.value,
    maritalStatus: document.getElementById("apply-marital")?.value,
    nin: document.getElementById("apply-nin")?.value.trim() || "",
  };

  /* ── qualifications ── */
  const degreeObj = {
    degreeType: document.getElementById("apply-degree-type").value,
    institution: document.getElementById("apply-institution").value.trim(),
  };
  const degClass = document.getElementById("apply-degree-class").value;
  if (degClass) degreeObj.degreeClass = degClass;

  const yrAwarded = document.getElementById("apply-year-awarded").value;
  if (yrAwarded) degreeObj.yearAwarded = parseInt(yrAwarded, 10);

  // Programme — for all applicants
  const progVal = document.getElementById("apply-programme")?.value;
  if (progVal) degreeObj.programme = progVal;

  // PhD degree field — shown only when PhD + programme selected
  const phdField = document.getElementById("apply-phd-degree")?.value;
  if (phdField) degreeObj.phdDegreeField = phdField;

  // Department — only relevant for Academic
  const deptVal = document.getElementById("apply-department")?.value;
  if (deptVal) degreeObj.department = deptVal;

  const qualifications = {
    degrees: [degreeObj],
    hasPhd: degreeObj.degreeType === "phd",
    nysc: {
      completed: document.getElementById("apply-nysc")?.checked || false,
    },
  };

  /* ── experience — flat unified object matching backend schema ── */
  const isAcademic = currentRoleType === "academic";
  const experience = {
    teachingYears:
      parseInt(document.getElementById("apply-teaching-years")?.value, 10) || 0,
    researchYears:
      parseInt(document.getElementById("apply-research-years")?.value, 10) || 0,
    industryYears:
      parseInt(document.getElementById("apply-industry-years")?.value, 10) || 0,
    publications:
      parseInt(document.getElementById("apply-publications")?.value, 10) || 0,
    postQualificationExperience:
      parseInt(document.getElementById("apply-post-qual-years")?.value, 10) ||
      0,
  };

  /* ── professionalInfo ── */
  const ictChecked =
    document.getElementById("apply-ict-proficiency")?.checked || false;
  const compRaw = document.getElementById("apply-computer-skills")?.value || "";
  const certsRaw = document.getElementById("apply-prof-certs")?.value || "";
  const professionalInfo = {
    ictProficiency: ictChecked,
    computerSkills: compRaw
      ? compRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    certifications: certsRaw
      ? certsRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  };

  /* ── referees — single array, all optional extras appended only if filled ── */
  const ref1 = {
    name: document.getElementById("apply-referee-name")?.value.trim() || "",
    email: document.getElementById("apply-referee-email")?.value.trim() || "",
  };

  const refereesArr = [ref1];

  // Referee 2
  const ref2Name =
    document.getElementById("apply-referee2-name")?.value.trim() || "";
  const ref2Email =
    document.getElementById("apply-referee2-email")?.value.trim() || "";
  refereesArr.push({
    name: ref2Name,
    email: ref2Email,
  });

  // Referee 3
  const ref3Name =
    document.getElementById("apply-referee3-name")?.value.trim() || "";
  const ref3Email =
    document.getElementById("apply-referee3-email")?.value.trim() || "";
  refereesArr.push({
    name: ref3Name,
    email: ref3Email,
  });

  const fd = new FormData();
  fd.append("jobId", jobId);
  // Top-level department — academic applicants only
  if (currentRoleType === "academic") {
    const topDept = document.getElementById("apply-department")?.value || "";
    if (topDept) fd.append("department", topDept);
  }
  // Top-level email (required by backend)
  fd.append("email", personalInfo.email);
  fd.append("personalInfo", JSON.stringify(personalInfo));
  fd.append("qualifications", JSON.stringify(qualifications));
  fd.append("experience", JSON.stringify(experience));
  fd.append("professionalInfo", JSON.stringify(professionalInfo));
  fd.append("referees", JSON.stringify(refereesArr));

  const coverFile = document.getElementById("apply-cover")?.files[0];
  if (coverFile) fd.append("coverLetter", coverFile);

  const cvFile = document.getElementById("apply-cv")?.files[0];
  if (cvFile) fd.append("resume", cvFile);

  const docFile = document.getElementById("apply-docs")?.files[0];
  if (docFile) fd.append("supportingDocument", docFile);

  /* ── Submit with upload progress ── */
  const submitBtn = document.querySelector(".apply-submit-btn[type='submit']");
  const origHTML  = submitBtn?.innerHTML;

  // Inject a progress bar below the submit button (once)
  let progressWrap = document.getElementById("upload-progress-wrap");
  if (!progressWrap) {
    progressWrap = document.createElement("div");
    progressWrap.id = "upload-progress-wrap";
    progressWrap.style.cssText = [
      "margin-top:12px", "display:none", "flex-direction:column",
      "gap:6px", "width:100%"
    ].join(";");
    progressWrap.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#6b7c93;font-weight:600;">
        <span id="upload-progress-label">Uploading files…</span>
        <span id="upload-progress-pct">0%</span>
      </div>
      <div style="background:#dde6f0;border-radius:99px;height:6px;overflow:hidden;">
        <div id="upload-progress-bar"
             style="height:100%;width:0%;background:linear-gradient(90deg,#1e3a5f,#c9a84c);
                    border-radius:99px;transition:width 0.2s ease;"></div>
      </div>`;
    submitBtn?.parentElement?.appendChild(progressWrap);
  }

  const progBar   = document.getElementById("upload-progress-bar");
  const progPct   = document.getElementById("upload-progress-pct");
  const progLabel = document.getElementById("upload-progress-label");

  const setProgress = (pct, label) => {
    if (progBar)   progBar.style.width   = `${pct}%`;
    if (progPct)   progPct.textContent   = `${Math.round(pct)}%`;
    if (progLabel) progLabel.textContent = label || "Uploading files…";
  };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="btn-spinner" style="margin-right:8px;border-top-color:#fff;display:block"></span> Uploading…`;
  }
  progressWrap.style.display = "flex";
  setProgress(0, "Preparing upload…");

  // Use XHR so we get upload progress events
  await new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = (e.loaded / e.total) * 95; // cap at 95% until server responds
        setProgress(pct, pct < 50 ? "Uploading files…" : "Almost there…");
      }
    });

    xhr.addEventListener("load", () => {
      setProgress(100, "Processing…");
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success !== false) {
          showToast("Application submitted! We'll be in touch.", "success");
          _showSuccess();
        } else {
          const errMsg = [data.message, data.error].filter(Boolean).join(" — ");
          showToast(`Submission failed: ${errMsg || `Error ${xhr.status}`}`, "error");
          console.error("Server error:", data);
        }
      } catch {
        showToast(`Submission failed: Unexpected server response.`, "error");
      }
      // Reset UI
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origHTML; }
      progressWrap.style.display = "none";
      setProgress(0);
      resolve();
    });

    xhr.addEventListener("error", () => {
      showToast("Network error. Please check your connection and try again.", "error");
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origHTML; }
      progressWrap.style.display = "none";
      resolve();
    });

    xhr.addEventListener("timeout", () => {
      showToast("Request timed out. Please try again.", "error");
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origHTML; }
      progressWrap.style.display = "none";
      resolve();
    });

    xhr.open("POST", `${APP_API_URL}applications/apply`);
    xhr.timeout = 120000; // 2-minute timeout for large files
    xhr.send(fd);
  });
}

function _showSuccess() {
  for (let i = 1; i <= STEPS; i++) {
    document.getElementById(`apply-step-${i}`)?.classList.remove("active");
    document
      .getElementById(`apply-step-indicator-${i}`)
      ?.classList.remove("active");
  }
  document.getElementById("apply-success")?.classList.add("active");
}

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  // Set DOB age limits dynamically (18–65 years)
  const dobInput = document.getElementById("apply-dob");
  if (dobInput) {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - 65, today.getMonth(), today.getDate());
    dobInput.max = maxDate.toISOString().split("T")[0];
    dobInput.min = minDate.toISOString().split("T")[0];
  }

  loadNigerianStates();
  const form = document.getElementById("career-apply-form");
  if (form) form.addEventListener("submit", submitApplication);
  _goto(1);

  /* ── Block click-outside-to-close on both modals ──────── */
  // Clicking the overlay backdrop does nothing — user must use the ✕ button
  ["apply-overlay", "status-overlay"].forEach((id) => {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    // Do NOT close when the backdrop (overlay itself) is clicked
    overlay.addEventListener("click", (e) => e.stopPropagation());
  });

  // Also stop clicks inside the modal panels from bubbling out
  document.querySelectorAll(".apply-modal").forEach((modal) => {
    modal.addEventListener("click", (e) => e.stopPropagation());
  });
});

/* ══════════════════════════════════════════════════════════════
   PHD DEGREE FIELD — per-programme PhD options
   Keys match snake_case option values; core/related use {value, label}
   ══════════════════════════════════════════════════════════════ */
const PHD_MAP = {
  // ── Accounting & Finance ─────────────────────────────────
  "accounting":           { core: { value: "accounting", label: "Accounting" }, related: [{ value: "finance", label: "Finance" }, { value: "taxation", label: "Taxation" }, { value: "auditing", label: "Auditing" }, { value: "financial_management", label: "Financial Management" }] },
  "finance":              { core: { value: "finance", label: "Finance" }, related: [{ value: "accounting", label: "Accounting" }, { value: "financial_management", label: "Financial Management" }, { value: "financial_economics", label: "Financial Economics" }] },
  "taxation":             { core: { value: "taxation", label: "Taxation" }, related: [{ value: "accounting", label: "Accounting" }, { value: "auditing", label: "Auditing" }, { value: "finance", label: "Finance" }] },
  "auditing":             { core: { value: "auditing", label: "Auditing" }, related: [{ value: "accounting", label: "Accounting" }, { value: "taxation", label: "Taxation" }, { value: "financial_management", label: "Financial Management" }] },
  "financial_management": { core: { value: "financial_management", label: "Financial Management" }, related: [{ value: "finance", label: "Finance" }, { value: "accounting", label: "Accounting" }, { value: "economics", label: "Economics" }] },

  // ── Advertising & Communication ───────────────────────────
  "advertising":                        { core: { value: "advertising", label: "Advertising" }, related: [{ value: "marketing", label: "Marketing" }, { value: "mass_communication", label: "Mass Communication" }, { value: "media_studies", label: "Media Studies" }, { value: "integrated_marketing_communication", label: "Integrated Marketing Communication" }] },
  "marketing":                          { core: { value: "marketing", label: "Marketing" }, related: [{ value: "advertising", label: "Advertising" }, { value: "mass_communication", label: "Mass Communication" }, { value: "integrated_marketing_communication", label: "Integrated Marketing Communication" }] },
  "mass_communication":                 { core: { value: "mass_communication", label: "Mass Communication" }, related: [{ value: "media_studies", label: "Media Studies" }, { value: "advertising", label: "Advertising" }, { value: "information_media_studies", label: "Information & Media Studies" }] },
  "media_studies":                      { core: { value: "media_studies", label: "Media Studies" }, related: [{ value: "mass_communication", label: "Mass Communication" }, { value: "advertising", label: "Advertising" }, { value: "film_multimedia_studies", label: "Film & Multimedia Studies" }] },
  "integrated_marketing_communication": { core: { value: "integrated_marketing_communication", label: "Integrated Marketing Communication" }, related: [{ value: "marketing", label: "Marketing" }, { value: "advertising", label: "Advertising" }] },

  // ── Agriculture ───────────────────────────────────────────
  "agriculture":           { core: { value: "agriculture", label: "Agriculture / Agricultural Science" }, related: [{ value: "agronomy", label: "Agronomy" }, { value: "animal_science", label: "Animal Science" }, { value: "soil_science", label: "Soil Science" }, { value: "agricultural_economics", label: "Agricultural Economics" }, { value: "crop_science", label: "Crop Science" }] },
  "agronomy":              { core: { value: "agronomy", label: "Agronomy" }, related: [{ value: "agriculture", label: "Agriculture" }, { value: "crop_science", label: "Crop Science" }, { value: "soil_science", label: "Soil Science" }] },
  "animal_science":        { core: { value: "animal_science", label: "Animal Science" }, related: [{ value: "agriculture", label: "Agriculture" }, { value: "zoology", label: "Zoology" }, { value: "biology", label: "Biology" }] },
  "soil_science":          { core: { value: "soil_science", label: "Soil Science" }, related: [{ value: "agriculture", label: "Agriculture" }, { value: "agronomy", label: "Agronomy" }, { value: "crop_science", label: "Crop Science" }] },
  "agricultural_economics":{ core: { value: "agricultural_economics", label: "Agricultural Economics" }, related: [{ value: "economics", label: "Economics" }, { value: "agriculture", label: "Agriculture" }] },
  "crop_science":          { core: { value: "crop_science", label: "Crop Science" }, related: [{ value: "agriculture", label: "Agriculture" }, { value: "agronomy", label: "Agronomy" }, { value: "botany", label: "Botany" }] },

  // ── Architecture & Design ─────────────────────────────────
  "architecture":            { core: { value: "architecture", label: "Architecture" }, related: [{ value: "environmental_design", label: "Environmental Design" }, { value: "urban_regional_planning", label: "Urban & Regional Planning" }, { value: "building_technology", label: "Building Technology" }] },
  "environmental_design":    { core: { value: "environmental_design", label: "Environmental Design" }, related: [{ value: "architecture", label: "Architecture" }, { value: "urban_regional_planning", label: "Urban & Regional Planning" }] },
  "urban_regional_planning": { core: { value: "urban_regional_planning", label: "Urban & Regional Planning" }, related: [{ value: "architecture", label: "Architecture" }, { value: "environmental_design", label: "Environmental Design" }, { value: "estate_management", label: "Estate Management" }] },
  "building_technology":     { core: { value: "building_technology", label: "Building Technology" }, related: [{ value: "architecture", label: "Architecture" }, { value: "building", label: "Building" }] },

  // ── Biology & Life Sciences ───────────────────────────────
  "biology":          { core: { value: "biology", label: "Biology" }, related: [{ value: "botany", label: "Botany" }, { value: "zoology", label: "Zoology" }, { value: "genetics", label: "Genetics" }, { value: "ecology", label: "Ecology" }, { value: "molecular_biology", label: "Molecular Biology" }] },
  "botany":           { core: { value: "botany", label: "Botany" }, related: [{ value: "biology", label: "Biology" }, { value: "ecology", label: "Ecology" }, { value: "crop_science", label: "Crop Science" }] },
  "zoology":          { core: { value: "zoology", label: "Zoology" }, related: [{ value: "biology", label: "Biology" }, { value: "genetics", label: "Genetics" }, { value: "ecology", label: "Ecology" }] },
  "genetics":         { core: { value: "genetics", label: "Genetics" }, related: [{ value: "biology", label: "Biology" }, { value: "molecular_biology", label: "Molecular Biology" }, { value: "biotechnology", label: "Biotechnology" }] },
  "ecology":          { core: { value: "ecology", label: "Ecology" }, related: [{ value: "biology", label: "Biology" }, { value: "botany", label: "Botany" }, { value: "zoology", label: "Zoology" }] },
  "molecular_biology": { core: { value: "molecular_biology", label: "Molecular Biology" }, related: [{ value: "biology", label: "Biology" }, { value: "biochemistry", label: "Biochemistry" }, { value: "genetics", label: "Genetics" }] },

  // ── Computer Science & IT ─────────────────────────────────
  "computer_science":      { core: { value: "computer_science", label: "Computer Science" }, related: [{ value: "software_engineering", label: "Software Engineering" }, { value: "information_systems", label: "Information Systems" }, { value: "artificial_intelligence", label: "Artificial Intelligence" }] },
  "software_engineering":  { core: { value: "software_engineering", label: "Software Engineering" }, related: [{ value: "computer_science", label: "Computer Science" }, { value: "information_systems", label: "Information Systems" }] },
  "information_systems":   { core: { value: "information_systems", label: "Information Systems" }, related: [{ value: "computer_science", label: "Computer Science" }, { value: "artificial_intelligence", label: "Artificial Intelligence" }, { value: "data_science", label: "Data Science" }] },
  "artificial_intelligence": { core: { value: "artificial_intelligence", label: "Artificial Intelligence" }, related: [{ value: "computer_science", label: "Computer Science" }, { value: "data_science", label: "Data Science" }, { value: "machine_learning", label: "Machine Learning" }] },

  // ── Cyber Security ────────────────────────────────────────
  "cyber_security":     { core: { value: "cyber_security", label: "Cyber Security" }, related: [{ value: "information_security", label: "Information Security" }, { value: "digital_forensics", label: "Digital Forensics" }, { value: "computer_science", label: "Computer Science" }] },
  "information_security": { core: { value: "information_security", label: "Information Security" }, related: [{ value: "cyber_security", label: "Cyber Security" }, { value: "digital_forensics", label: "Digital Forensics" }] },
  "digital_forensics":  { core: { value: "digital_forensics", label: "Digital Forensics" }, related: [{ value: "cyber_security", label: "Cyber Security" }, { value: "information_security", label: "Information Security" }] },

  // ── Data Science & Statistics ─────────────────────────────
  "data_science":   { core: { value: "data_science", label: "Data Science" }, related: [{ value: "statistics", label: "Statistics" }, { value: "machine_learning", label: "Machine Learning" }, { value: "artificial_intelligence", label: "Artificial Intelligence" }] },
  "statistics":     { core: { value: "statistics", label: "Statistics" }, related: [{ value: "data_science", label: "Data Science" }, { value: "mathematics", label: "Mathematics" }, { value: "machine_learning", label: "Machine Learning" }] },
  "machine_learning": { core: { value: "machine_learning", label: "Machine Learning" }, related: [{ value: "artificial_intelligence", label: "Artificial Intelligence" }, { value: "data_science", label: "Data Science" }, { value: "statistics", label: "Statistics" }] },

  // ── Economics ─────────────────────────────────────────────
  "economics":              { core: { value: "economics", label: "Economics" }, related: [{ value: "development_economics", label: "Development Economics" }, { value: "econometrics", label: "Econometrics" }, { value: "financial_economics", label: "Financial Economics" }] },
  "development_economics":  { core: { value: "development_economics", label: "Development Economics" }, related: [{ value: "economics", label: "Economics" }, { value: "agricultural_economics", label: "Agricultural Economics" }] },
  "econometrics":           { core: { value: "econometrics", label: "Econometrics" }, related: [{ value: "economics", label: "Economics" }, { value: "statistics", label: "Statistics" }, { value: "mathematics", label: "Mathematics" }] },
  "financial_economics":    { core: { value: "financial_economics", label: "Financial Economics" }, related: [{ value: "economics", label: "Economics" }, { value: "finance", label: "Finance" }, { value: "financial_management", label: "Financial Management" }] },

  // ── Mathematics ───────────────────────────────────────────
  "mathematics":         { core: { value: "mathematics", label: "Mathematics" }, related: [{ value: "applied_mathematics", label: "Applied Mathematics" }, { value: "pure_mathematics", label: "Pure Mathematics" }, { value: "mathematical_physics", label: "Mathematical Physics" }] },
  "applied_mathematics": { core: { value: "applied_mathematics", label: "Applied Mathematics" }, related: [{ value: "mathematics", label: "Mathematics" }, { value: "statistics", label: "Statistics" }, { value: "mathematical_physics", label: "Mathematical Physics" }] },
  "pure_mathematics":    { core: { value: "pure_mathematics", label: "Pure Mathematics" }, related: [{ value: "mathematics", label: "Mathematics" }, { value: "applied_mathematics", label: "Applied Mathematics" }] },
  "mathematical_physics": { core: { value: "mathematical_physics", label: "Mathematical Physics" }, related: [{ value: "mathematics", label: "Mathematics" }, { value: "physics", label: "Physics" }, { value: "applied_mathematics", label: "Applied Mathematics" }] },

  // ── Physics ───────────────────────────────────────────────
  "physics":        { core: { value: "physics", label: "Physics" }, related: [{ value: "applied_physics", label: "Applied Physics" }, { value: "nuclear_physics", label: "Nuclear Physics" }, { value: "electronics", label: "Electronics" }] },
  "applied_physics": { core: { value: "applied_physics", label: "Applied Physics" }, related: [{ value: "physics", label: "Physics" }, { value: "nuclear_physics", label: "Nuclear Physics" }, { value: "electronics", label: "Electronics" }] },
  "nuclear_physics": { core: { value: "nuclear_physics", label: "Nuclear Physics" }, related: [{ value: "physics", label: "Physics" }, { value: "applied_physics", label: "Applied Physics" }] },
  "electronics":    { core: { value: "electronics", label: "Electronics" }, related: [{ value: "physics", label: "Physics" }, { value: "applied_physics", label: "Applied Physics" }, { value: "computer_science", label: "Computer Science" }] },

  // ── Chemistry ─────────────────────────────────────────────
  "chemistry":           { core: { value: "chemistry", label: "Chemistry" }, related: [{ value: "industrial_chemistry", label: "Industrial Chemistry" }, { value: "biochemistry", label: "Biochemistry" }, { value: "materials_science", label: "Materials Science" }] },
  "industrial_chemistry": { core: { value: "industrial_chemistry", label: "Industrial Chemistry" }, related: [{ value: "chemistry", label: "Chemistry" }, { value: "materials_science", label: "Materials Science" }] },
  "biochemistry":        { core: { value: "biochemistry", label: "Biochemistry" }, related: [{ value: "chemistry", label: "Chemistry" }, { value: "molecular_biology", label: "Molecular Biology" }, { value: "microbiology", label: "Microbiology" }] },
  "materials_science":   { core: { value: "materials_science", label: "Materials Science" }, related: [{ value: "chemistry", label: "Chemistry" }, { value: "physics", label: "Physics" }, { value: "industrial_chemistry", label: "Industrial Chemistry" }] },

  // ── Microbiology & Biotechnology ─────────────────────────
  "microbiology":  { core: { value: "microbiology", label: "Microbiology" }, related: [{ value: "biotechnology", label: "Biotechnology" }, { value: "virology", label: "Virology" }, { value: "immunology", label: "Immunology" }] },
  "biotechnology": { core: { value: "biotechnology", label: "Biotechnology" }, related: [{ value: "microbiology", label: "Microbiology" }, { value: "genetics", label: "Genetics" }, { value: "molecular_biology", label: "Molecular Biology" }] },
  "virology":      { core: { value: "virology", label: "Virology" }, related: [{ value: "microbiology", label: "Microbiology" }, { value: "immunology", label: "Immunology" }, { value: "biology", label: "Biology" }] },
  "immunology":    { core: { value: "immunology", label: "Immunology" }, related: [{ value: "microbiology", label: "Microbiology" }, { value: "virology", label: "Virology" }, { value: "biology", label: "Biology" }] },

  // ── English & Linguistics ─────────────────────────────────
  "english":             { core: { value: "english", label: "English / English Studies" }, related: [{ value: "linguistics", label: "Linguistics" }, { value: "literature", label: "Literature in English" }, { value: "applied_linguistics", label: "Applied Linguistics" }] },
  "linguistics":         { core: { value: "linguistics", label: "Linguistics" }, related: [{ value: "english", label: "English" }, { value: "applied_linguistics", label: "Applied Linguistics" }, { value: "literature", label: "Literature" }] },
  "literature":          { core: { value: "literature", label: "Literature" }, related: [{ value: "english", label: "English" }, { value: "linguistics", label: "Linguistics" }] },
  "applied_linguistics": { core: { value: "applied_linguistics", label: "Applied Linguistics" }, related: [{ value: "linguistics", label: "Linguistics" }, { value: "english", label: "English" }] },

  // ── Philosophy & Religion ─────────────────────────────────
  "philosophy":       { core: { value: "philosophy", label: "Philosophy" }, related: [{ value: "ethics", label: "Ethics" }, { value: "logic", label: "Logic" }, { value: "religious_studies", label: "Religious Studies" }] },
  "ethics":           { core: { value: "ethics", label: "Ethics" }, related: [{ value: "philosophy", label: "Philosophy" }, { value: "logic", label: "Logic" }] },
  "logic":            { core: { value: "logic", label: "Logic" }, related: [{ value: "philosophy", label: "Philosophy" }, { value: "mathematics", label: "Mathematics" }] },
  "religious_studies": { core: { value: "religious_studies", label: "Religious Studies" }, related: [{ value: "philosophy", label: "Philosophy" }] },

  // ── Library & Information Science ─────────────────────────
  "library_information_science": { core: { value: "library_information_science", label: "Library and Information Science (LIS)" }, related: [{ value: "information_science", label: "Information Science" }, { value: "knowledge_management", label: "Knowledge Management" }, { value: "archival_studies", label: "Archival Studies" }, { value: "records_management", label: "Records Management" }, { value: "digital_libraries", label: "Digital Libraries" }] },
  "information_science":  { core: { value: "information_science", label: "Information Science" }, related: [{ value: "library_information_science", label: "Library and Information Science" }, { value: "knowledge_management", label: "Knowledge Management" }, { value: "information_systems", label: "Information Systems" }] },
  "knowledge_management": { core: { value: "knowledge_management", label: "Knowledge Management" }, related: [{ value: "library_information_science", label: "Library and Information Science" }, { value: "information_science", label: "Information Science" }] },
  "archival_studies":     { core: { value: "archival_studies", label: "Archival Studies" }, related: [{ value: "library_information_science", label: "Library and Information Science" }, { value: "records_management", label: "Records Management" }] },
  "records_management":   { core: { value: "records_management", label: "Records Management" }, related: [{ value: "archival_studies", label: "Archival Studies" }, { value: "library_information_science", label: "Library and Information Science" }] },
  "digital_libraries":    { core: { value: "digital_libraries", label: "Digital Libraries" }, related: [{ value: "library_information_science", label: "Library and Information Science" }, { value: "information_systems", label: "Information Systems" }, { value: "information_science", label: "Information Science" }] },

  // ── Others ────────────────────────────────────────────────
  "building":                        { core: { value: "building", label: "Building" }, related: [{ value: "building_technology", label: "Building Technology" }, { value: "architecture", label: "Architecture" }] },
  "business_administration":         { core: { value: "business_administration", label: "Business Administration (MBA)" }, related: [{ value: "financial_management", label: "Financial Management" }, { value: "economics", label: "Economics" }] },
  "business_information_technology": { core: { value: "business_information_technology", label: "Business Information Systems / IT Management" }, related: [{ value: "information_systems", label: "Information Systems" }, { value: "computer_science", label: "Computer Science" }] },
  "clothing_textile":                { core: { value: "clothing_textile", label: "Textile Science / Clothing & Textile" }, related: [{ value: "fashion_design", label: "Fashion Design" }] },
  "employment_relations_hrm":        { core: { value: "employment_relations_hrm", label: "Human Resource Management / Industrial Relations" }, related: [{ value: "business_administration", label: "Business Administration" }] },
  "entrepreneurship":                { core: { value: "entrepreneurship", label: "Entrepreneurship" }, related: [{ value: "business_administration", label: "Business Administration" }] },
  "estate_management":               { core: { value: "estate_management", label: "Estate Management" }, related: [{ value: "urban_regional_planning", label: "Urban & Regional Planning" }, { value: "architecture", label: "Architecture" }] },
  "fashion_design":                  { core: { value: "fashion_design", label: "Fashion Design" }, related: [{ value: "clothing_textile", label: "Clothing & Textile" }, { value: "interior_architecture_design", label: "Interior Architecture & Design" }] },
  "film_multimedia_studies":         { core: { value: "film_multimedia_studies", label: "Film Studies / Multimedia Studies" }, related: [{ value: "mass_communication", label: "Mass Communication" }, { value: "media_studies", label: "Media Studies" }] },
  "french":                          { core: { value: "french", label: "French" }, related: [{ value: "linguistics", label: "Linguistics" }, { value: "english", label: "English" }] },
  "furniture_design":                { core: { value: "furniture_design", label: "Furniture Design" }, related: [{ value: "interior_architecture_design", label: "Interior Architecture & Design" }] },
  "igbo":                            { core: { value: "igbo", label: "Igbo Language" }, related: [{ value: "linguistics", label: "Linguistics" }, { value: "english", label: "English" }] },
  "information_media_studies":       { core: { value: "information_media_studies", label: "Information & Media Studies" }, related: [{ value: "mass_communication", label: "Mass Communication" }, { value: "library_information_science", label: "Library & Information Science" }] },
  "ict":                             { core: { value: "ict", label: "Information & Communication Technology" }, related: [{ value: "computer_science", label: "Computer Science" }, { value: "information_systems", label: "Information Systems" }] },
  "interior_architecture_design":    { core: { value: "interior_architecture_design", label: "Interior Architecture" }, related: [{ value: "architecture", label: "Architecture" }, { value: "fashion_design", label: "Fashion Design" }] },
  "logistics_supply_chain":          { core: { value: "logistics_supply_chain", label: "Logistics / Supply Chain Management" }, related: [{ value: "business_administration", label: "Business Administration" }] },
  "office_information_management":   { core: { value: "office_information_management", label: "Office Management / Information Management" }, related: [{ value: "business_administration", label: "Business Administration" }, { value: "information_systems", label: "Information Systems" }] },
};

function onProgrammeOrDegreeChange() {
  const degType = document.getElementById("apply-degree-type")?.value;
  const programme = document.getElementById("apply-programme")?.value;
  const phdWrap = document.getElementById("field-phd-degree");
  const phdSel  = document.getElementById("apply-phd-degree");
  if (!phdWrap || !phdSel) return;

  if (degType === "phd" && programme && PHD_MAP[programme]) {
    const map = PHD_MAP[programme];
    phdSel.innerHTML = `<option value="" disabled selected hidden>Select PhD degree field</option>`;
    // Core option
    const coreGrp = document.createElement("optgroup");
    coreGrp.label = "Core PhD";
    const coreOpt = document.createElement("option");
    coreOpt.value = map.core.value;
    coreOpt.textContent = map.core.label;
    coreGrp.appendChild(coreOpt);
    phdSel.appendChild(coreGrp);
    // Related options
    if (map.related.length) {
      const relGrp = document.createElement("optgroup");
      relGrp.label = "Related PhDs";
      map.related.forEach((r) => {
        const o = document.createElement("option");
        o.value = r.value;
        o.textContent = r.label;
        relGrp.appendChild(o);
      });
      phdSel.appendChild(relGrp);
    }
    // Show with animation
    phdWrap.style.display = "block";
    phdWrap.style.opacity = "0";
    phdWrap.style.transform = "translateY(-6px)";
    phdWrap.style.transition = "opacity 0.22s ease, transform 0.22s ease";
    requestAnimationFrame(() => {
      phdWrap.style.opacity = "1";
      phdWrap.style.transform = "translateY(0)";
    });
  } else {
    phdWrap.style.opacity = "0";
    phdWrap.style.transform = "translateY(-6px)";
    setTimeout(() => {
      phdWrap.style.display = "none";
      phdSel.innerHTML = `<option value="" disabled selected hidden>Select PhD degree field</option>`;
    }, 220);
  }
}

function onPhdDegreeFieldChange() {
  // placeholder — future logic if needed
}

