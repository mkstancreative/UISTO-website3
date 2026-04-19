// const JOBS_API_URL = "http://192.168.1.37:5000/api/v1/";
const JOBS_API_URL = "https://career.uisto.edu.ng/api/v1/";

/* ── State ──────────────────────────────────────────────── */
let uistoAcademicJobs    = [];   // cached Academic positions
let uistoNonAcademicJobs = [];   // cached Non-Academic positions

/* ════════════════════════════════════════════════════════════
   LOAD JOB SELECTOR  — entry point (called from openApplyModal)
   ════════════════════════════════════════════════════════════ */
async function loadJobSelector() {
    const activeType = (typeof currentRoleType !== "undefined" && currentRoleType)
        ? currentRoleType : "academic";

    _resetJobSelection();

    if (activeType === "academic") {
        _showDirectSelector();
        await _loadAcademicPositions();
    } else {
        _showSubCadrePicker();
        await _loadNonAcademicSubCadres();
    }
}

/* ════════════════════════════════════════════════════════════
   ACADEMIC — fetch with cadre=Academic, populate directly
   ════════════════════════════════════════════════════════════ */
async function _loadAcademicPositions() {
    const sel = document.getElementById("apply-job-select");
    if (!sel) return;

    sel.innerHTML = `<option value="">Loading positions…</option>`;
    sel.disabled  = true;

    try {
        if (!uistoAcademicJobs.length) {
            const res  = await fetch(`${JOBS_API_URL}careers?page=1&cadre=Academic&limit=1000`);
            const json = await res.json();
            uistoAcademicJobs = (json.success && Array.isArray(json.data) && json.data.length)
                ? json.data : [];
        }

        if (!uistoAcademicJobs.length) {
            sel.innerHTML = `<option value="">No Academic positions available</option>`;
            return;
        }

        sel.innerHTML = `<option value="" disabled selected hidden>-- Select an Academic position --</option>`;
        uistoAcademicJobs.forEach(j => _appendJobOption(sel, j));

    } catch (err) {
        console.error("_loadAcademicPositions:", err);
        sel.innerHTML = `<option value="">Failed to load. Please retry.</option>`;
    } finally {
        sel.disabled = false;
    }
}

/* ════════════════════════════════════════════════════════════
   NON-ACADEMIC — step 1: show sub-cadre cards
   ════════════════════════════════════════════════════════════ */
async function _loadNonAcademicSubCadres() {
    const grid = document.getElementById("subcadre-grid");
    if (!grid) return;

    grid.innerHTML = `
        <div class="subcadre-loading">
            <span class="subcadre-spinner"></span>
            <span>Loading categories…</span>
        </div>`;

    try {
        if (!uistoNonAcademicJobs.length) {
            const res  = await fetch(`${JOBS_API_URL}careers?page=1&cadre=Non-Academic&limit=1000`);
            const json = await res.json();
            uistoNonAcademicJobs = (json.success && Array.isArray(json.data) && json.data.length)
                ? json.data : [];
        }

        if (!uistoNonAcademicJobs.length) {
            grid.innerHTML = `<p class="subcadre-empty">No Non-Academic positions are currently available.</p>`;
            return;
        }

        /* Group by position.subcadre.name */
        const subCadreMap = {};
        uistoNonAcademicJobs.forEach(j => {
            const sc = j.position?.subcadre?.name || "General";
            if (!subCadreMap[sc]) subCadreMap[sc] = [];
            subCadreMap[sc].push(j);
        });

        grid.innerHTML = "";
        Object.entries(subCadreMap).forEach(([name, jobs]) => {
            const card = document.createElement("button");
            card.type             = "button";
            card.className        = "subcadre-card";
            card.dataset.subcadre = name;
            card.innerHTML = `
                <span class="subcadre-card-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </span>
                <span class="subcadre-card-name">${name}</span>
                <span class="subcadre-card-count">${jobs.length} position${jobs.length !== 1 ? "s" : ""}</span>
                <svg class="subcadre-card-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="1.8"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
            card.addEventListener("click", () => _onSubCadreSelect(name, jobs));
            grid.appendChild(card);
        });

    } catch (err) {
        console.error("_loadNonAcademicSubCadres:", err);
        grid.innerHTML = `<p class="subcadre-empty" style="color:#c0392b;">Failed to load categories. Please retry.</p>`;
    }
}

/* ════════════════════════════════════════════════════════════
   NON-ACADEMIC — step 2: sub-cadre clicked → show positions
   ════════════════════════════════════════════════════════════ */
function _onSubCadreSelect(subCadreName, jobs) {
    /* Highlight selected card */
    document.querySelectorAll(".subcadre-card").forEach(c =>
        c.classList.toggle("active", c.dataset.subcadre === subCadreName));

    /* Switch panels */
    _showDirectSelector();

    /* Show back button with label */
    const backBtn = document.getElementById("subcadre-back-btn");
    if (backBtn) {
        backBtn.style.display = "inline-flex";
        const lbl = backBtn.querySelector(".back-btn-label");
        if (lbl) lbl.textContent = subCadreName;
    }

    /* Populate the select */
    const sel = document.getElementById("apply-job-select");
    if (!sel) return;
    sel.innerHTML = `<option value="" disabled selected hidden>-- Select a position in ${subCadreName} --</option>`;
    jobs.forEach(j => _appendJobOption(sel, j));

    sel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ════════════════════════════════════════════════════════════
   BACK — return to sub-cadre picker
   ════════════════════════════════════════════════════════════ */
function backToSubCadres() {
    _resetJobSelection();
    _showSubCadrePicker();
    document.querySelectorAll(".subcadre-card").forEach(c => c.classList.remove("active"));
}

/* ════════════════════════════════════════════════════════════
   VISIBILITY HELPERS
   ════════════════════════════════════════════════════════════ */
function _showSubCadrePicker() {
    const picker  = document.getElementById("subcadre-picker");
    const selWrap = document.getElementById("job-select-wrap");
    if (picker)  picker.style.display  = "block";
    if (selWrap) selWrap.style.display = "none";
}

function _showDirectSelector() {
    const picker  = document.getElementById("subcadre-picker");
    const selWrap = document.getElementById("job-select-wrap");
    if (picker)  picker.style.display  = "none";
    if (selWrap) selWrap.style.display = "block";
}

function _resetJobSelection() {
    const sel    = document.getElementById("apply-job-select");
    const card   = document.getElementById("job-preview-card");
    const hidden = document.getElementById("apply-position-id");
    const back   = document.getElementById("subcadre-back-btn");
    if (sel)    { sel.value = ""; sel.innerHTML = `<option value="" disabled selected hidden>-- Select a position --</option>`; }
    if (card)   card.style.display = "none";
    if (hidden) hidden.value = "";
    if (back)   back.style.display = "none";
}

/* ════════════════════════════════════════════════════════════
   SHARED HELPER — append a job <option> to a <select>
   ════════════════════════════════════════════════════════════ */
function _appendJobOption(sel, j) {
    const opt = document.createElement("option");
    opt.value           = j._id;
    opt.textContent     = j.position?.title || "Position";
    opt.dataset.cadre   = j.position?.cadre      || "";
    opt.dataset.faculty = j.position?.faculty    || "";
    // opt.dataset.dept    = j.position?.department || "";
    opt.dataset.deadline = j.applicationDeadline || "";
    opt.dataset.reqs    = JSON.stringify(j.position?.requirements || []);
    sel.appendChild(opt);
}

/* ════════════════════════════════════════════════════════════
   HANDLE JOB SELECTION
   ════════════════════════════════════════════════════════════ */
function onJobSelect(selectedId) {
    const hiddenId = document.getElementById("apply-position-id");
    if (hiddenId) hiddenId.value = selectedId;

    const card = document.getElementById("job-preview-card");
    if (!selectedId) { if (card) card.style.display = "none"; return; }

    const opt = document.querySelector(`#apply-job-select option[value="${selectedId}"]`);
    if (!opt || !card) return;

    const cadreRaw = opt.dataset.cadre || "";
    const cadreKey = cadreRaw.toLowerCase() === "academic" ? "academic" : "non-academic";

    /* Auto-detect role type from cadre */
    if (typeof setRoleType === "function") {
        setRoleType(cadreKey, true); // true = skip dropdown re-filter
    }

    /* Populate preview card */
    document.getElementById("job-preview-title").textContent = opt.textContent;
    // document.getElementById("job-preview-dept").textContent  =
    //     [opt.dataset.faculty, opt.dataset.dept].filter(Boolean).join(" · ") || "";
    document.getElementById("job-preview-cadre").textContent = cadreRaw;
    document.getElementById("job-preview-cadre").className   =
        "job-preview-badge" + (cadreKey === "academic" ? " badge-academic-type" : " badge-nonacdemic-type");

    const dl = opt.dataset.deadline
        ? "Deadline: " + new Date(opt.dataset.deadline).toLocaleDateString("en-GB",
            { day: "numeric", month: "short", year: "numeric" })
        : "";
    document.getElementById("job-preview-deadline").textContent = dl;

    const reqEl = document.getElementById("job-preview-reqs");
    if (reqEl) {
        reqEl.innerHTML = "";
        try {
            const parsed = JSON.parse(opt.dataset.reqs || "[]");
            reqEl.innerHTML = (Array.isArray(parsed) && parsed.length)
                ? parsed.map(r => `<li>${r}</li>`).join("")
                : "<li>No requirements specified</li>";
        } catch { reqEl.innerHTML = "<li>No requirements specified</li>"; }
    }

    card.style.display = "block";
}

/* ════════════════════════════════════════════════════════════
   ROLE TYPE FILTER CHANGE  (called by setRoleType in CareerApplication.js)
   ════════════════════════════════════════════════════════════ */
function onRoleTypeFilterChange(type) {
    _resetJobSelection();

    if (type === "academic") {
        _showDirectSelector();
        _loadAcademicPositions();
    } else {
        _showSubCadrePicker();
        _loadNonAcademicSubCadres();
    }
}

/* ════════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("apply-overlay")?.addEventListener("click", function (e) {
        if (e.target === this) closeApplyModal();
    });
});
