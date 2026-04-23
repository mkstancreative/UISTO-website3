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

async function onStateChange() {
  const stateName = document.getElementById("apply-state").value;
  const lgaSel = document.getElementById("apply-lga");
  lgaSel.innerHTML = `<option value="" disabled selected hidden>Loading LGAs…</option>`;
  if (!stateName) {
    lgaSel.innerHTML = `<option value="" disabled selected hidden>Select LGA</option>`;
    return;
  }
  try {
    const res = await fetch(`${COUNTRIES_API}/countries/state/cities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: "Nigeria", state: stateName }),
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
  if (degType === "PhD") {
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
    hasPhd: degreeObj.degreeType === "PhD",
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
    yearsPostQualification:
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
  fd.append("roleType", currentRoleType);
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

  /* ── Submit ── */
  const submitBtn = document.querySelector(".apply-submit-btn[type='submit']");
  const origHTML = submitBtn?.innerHTML;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="btn-spinner" style="margin-right:8px; border-top-color:#fff;"></span> Uploading & Submitting...`;
  }

  try {
    const res = await fetch(`${APP_API_URL}applications/apply`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
    showToast("Application submitted! We'll be in touch.", "success");
    _showSuccess();
  } catch (err) {
    console.error("Submit error:", err);
    showToast(`Submission failed: ${err.message}`, "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origHTML;
    }
  }
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
   ══════════════════════════════════════════════════════════════ */
const PHD_MAP = {
  "Accounting": { core: "Accounting", related: ["Finance", "Taxation", "Auditing", "Financial Management"] },
  "Advertising": { core: "Advertising", related: ["Marketing", "Mass Communication", "Media Studies", "Integrated Marketing Communication"] },
  "Agriculture": { core: "Agriculture / Agricultural Science", related: ["Agronomy", "Animal Science", "Soil Science", "Agricultural Economics", "Crop Science"] },
  "Architecture": { core: "Architecture", related: ["Environmental Design", "Urban & Regional Planning", "Building Technology"] },
  "Biology": { core: "Biology", related: ["Botany", "Zoology", "Genetics", "Ecology", "Molecular Biology"] },
  "Building": { core: "Building", related: ["Construction Management", "Quantity Surveying", "Civil Engineering"] },
  "Business Administration": { core: "Business Administration", related: ["Management", "Strategic Management", "Organizational Behaviour"] },
  "Business Information Technology": { core: "Business Information Systems / IT Management", related: ["Information Systems", "Computer Science", "MIS"] },
  "Chemistry": { core: "Chemistry", related: ["Industrial Chemistry", "Biochemistry", "Materials Science"] },
  "Clothing & Textile": { core: "Textile Science / Clothing & Textile", related: ["Fashion Design", "Home Economics", "Apparel Technology"] },
  "Computer Science": { core: "Computer Science", related: ["Software Engineering", "Information Systems", "Artificial Intelligence"] },
  "Cyber Security": { core: "Cyber Security", related: ["Computer Science", "Information Security", "Digital Forensics"] },
  "Data Science": { core: "Data Science", related: ["Statistics", "Computer Science", "AI", "Machine Learning"] },
  "Economics": { core: "Economics", related: ["Development Economics", "Econometrics", "Financial Economics"] },
  "Employment Relations & HRM": { core: "Human Resource Management / Industrial Relations", related: ["Labour Studies", "Organizational Behaviour", "Business Administration"] },
  "English": { core: "English / English Studies", related: ["Linguistics", "Literature in English", "Applied Linguistics"] },
  "Entrepreneurship": { core: "Entrepreneurship", related: ["Business Administration", "Innovation Studies", "SME Development"] },
  "Estate Management": { core: "Estate Management", related: ["Property Valuation", "Real Estate", "Urban Planning"] },
  "Fashion Design": { core: "Fashion Design", related: ["Textile Science", "Clothing & Textile", "Creative Arts"] },
  "Film & Multimedia Studies": { core: "Film Studies / Multimedia Studies", related: ["Mass Communication", "Media Studies", "Theatre Arts"] },
  "French": { core: "French", related: ["Linguistics", "Translation Studies", "Comparative Literature"] },
  "Furniture Design": { core: "Furniture Design", related: ["Industrial Design", "Wood Technology", "Interior Design"] },
  "Igbo": { core: "Igbo Language", related: ["Linguistics", "African Languages", "Literature"] },
  "Information & Media Studies": { core: "Information & Media Studies", related: ["Mass Communication", "Library & Information Science"] },
  "ICT": { core: "Information & Communication Technology", related: ["Computer Science", "Information Systems", "Telecommunications"] },
  "Interior Architecture & Design": { core: "Interior Architecture", related: ["Architecture", "Environmental Design", "Fine Arts"] },
  "Library & Information Science": { core: "Library and Information Science (LIS)", related: ["Information Science", "Knowledge Management", "Archival Studies", "Records & Information Management", "Digital Libraries", "Information Systems"] },
  "Logistics & Supply Chain Technology": { core: "Logistics / Supply Chain Management", related: ["Operations Management", "Transport Management", "Industrial Engineering"] },
  "Marketing": { core: "Marketing", related: ["Consumer Behaviour", "Advertising", "Business Administration"] },
  "Mathematics": { core: "Mathematics", related: ["Applied Mathematics", "Pure Mathematics", "Mathematical Physics"] },
  "Microbiology": { core: "Microbiology", related: ["Biotechnology", "Virology", "Immunology"] },
  "Office & Information Management": { core: "Office Management / Information Management", related: ["Business Education", "Information Systems"] },
  "Philosophy": { core: "Philosophy", related: ["Ethics", "Logic", "Religious Studies"] },
  "Physics": { core: "Physics", related: ["Applied Physics", "Nuclear Physics", "Electronics"] },
  "Software Engineering": { core: "Software Engineering", related: ["Computer Science", "Information Systems"] },
  "Statistics": { core: "Statistics", related: ["Biostatistics", "Data Science", "Mathematics"] },
};

function onProgrammeOrDegreeChange() {
  const degType = document.getElementById("apply-degree-type")?.value;
  const programme = document.getElementById("apply-programme")?.value;
  const phdWrap = document.getElementById("field-phd-degree");
  const phdSel  = document.getElementById("apply-phd-degree");
  if (!phdWrap || !phdSel) return;

  if (degType === "PhD" && programme && PHD_MAP[programme]) {
    const map = PHD_MAP[programme];
    phdSel.innerHTML = `<option value="" disabled selected hidden>Select PhD degree field</option>`;
    // Core option (bold-labelled via optgroup)
    const coreGrp = document.createElement("optgroup");
    coreGrp.label = "Core PhD";
    const coreOpt = document.createElement("option");
    coreOpt.value = map.core;
    coreOpt.textContent = map.core;
    coreGrp.appendChild(coreOpt);
    phdSel.appendChild(coreGrp);
    // Related options
    if (map.related.length) {
      const relGrp = document.createElement("optgroup");
      relGrp.label = "Related PhDs";
      map.related.forEach((r) => {
        const o = document.createElement("option");
        o.value = r;
        o.textContent = r;
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
