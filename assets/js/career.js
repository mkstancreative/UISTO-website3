// const JOBS_API_URL = "http://192.168.1.37:5000/api/v1/";
const JOBS_API_URL = "https://career.uisto.edu.ng/api/v1/";

/* ── Job Data State ───────────────────────────────────── */
let uistoJobs = [];        // all jobs from API
let isLoading = false;

/* ── Fetch all jobs for the selector ─────────────────── */
async function loadJobSelector() {
    const sel = document.getElementById("apply-job-select");
    if (!sel) return;

    sel.innerHTML = `<option value="">Loading positions…</option>`;
    sel.disabled = true;

    try {
        const res = await fetch(`${JOBS_API_URL}careers?limit=1000`);
        const json = await res.json();

        if (!json.success || !json.data?.length) {
            sel.innerHTML = `<option value="">No positions available</option>`;
            return;
        }

        uistoJobs = json.data;
        _renderJobOptions(uistoJobs, ""); // show ALL positions — role type inferred from selection

    } catch (err) {
        console.error("loadJobSelector error:", err.message || err);
        sel.innerHTML = `<option value="">Failed to load positions. Please retry.</option>`;
    } finally {
        sel.disabled = false;
    }
}

/* ── Re-render <option> groups based on cadre filter ─── */
function _renderJobOptions(jobs, cadreFilter) {
    const sel = document.getElementById("apply-job-select");
    if (!sel) return;

    // normalise cadre filter: "academic" → "Academic", "non-academic" → "Non-Academic" / anything else
    const filterMap = { "academic": "Academic", "non-academic": "Non-Academic" };
    const activeCadre = filterMap[cadreFilter] || null;

    const filtered = activeCadre
        ? jobs.filter(j => (j.position?.cadre || "").toLowerCase() === activeCadre.toLowerCase())
        : jobs;

    // Group by cadre for <optgroup>
    const groups = {};
    filtered.forEach(j => {
        const cadre = j.position?.cadre || "Other";
        if (!groups[cadre]) groups[cadre] = [];
        groups[cadre].push(j);
    });

    sel.innerHTML = `<option value="">-- Select a position --</option>`;
    Object.entries(groups).forEach(([cadre, list]) => {
        const grp = document.createElement("optgroup");
        grp.label = cadre;
        list.forEach(j => {
            const opt = document.createElement("option");
            opt.value = j._id;
            opt.textContent = `${j.position?.title || "Position"}`;
            opt.dataset.cadre = j.position?.cadre || "";
            opt.dataset.faculty = j.position?.faculty || "";
            opt.dataset.department = j.position?.department || "";
            opt.dataset.deadline = j.applicationDeadline || "";
            opt.dataset.reqs = JSON.stringify(j.position?.requirements || []);
            grp.appendChild(opt);
        });
        sel.appendChild(grp);
    });

    if (!filtered.length) {
        sel.innerHTML = `<option value="">No ${activeCadre || ""} positions available</option>`;
    }
}

/* ── Handle job selection ─────────────────────────────── */
function onJobSelect(selectedId) {
    // Set hidden jobId
    const hiddenId = document.getElementById("apply-position-id");
    if (hiddenId) hiddenId.value = selectedId;

    const card = document.getElementById("job-preview-card");
    if (!selectedId) {
        if (card) card.style.display = "none";
        return;
    }

    // Find selected option's dataset
    const opt = document.querySelector(`#apply-job-select option[value="${selectedId}"]`);
    if (!opt || !card) return;

    const cadreRaw = opt.dataset.cadre || "";
    const cadreKey = cadreRaw.toLowerCase() === "academic" ? "academic" : "non-academic";

    // Update role type toggle (auto-detect from cadre)
    if (typeof setRoleType === "function") {
    setRoleType(cadreKey, true); // prevent dropdown reset
    }

    // Update job preview card
    
    document.getElementById("job-preview-title").textContent = opt.textContent;
    document.getElementById("job-preview-dept").textContent =
        [opt.dataset.faculty, opt.dataset.department].filter(Boolean).join(" · ") || "";
    document.getElementById("job-preview-cadre").textContent = cadreRaw;
    document.getElementById("job-preview-cadre").className =
        "job-preview-badge" + (cadreKey === "academic" ? " badge-academic-type" : " badge-nonacdemic-type");

    const dl = opt.dataset.deadline
        ? "Deadline: " + new Date(opt.dataset.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "";
    document.getElementById("job-preview-deadline").textContent = dl;
    // const reqs = opt.dataset.reqs ? "Requirements: " + opt.dataset.reqs : "";
    // document.getElementById("job-preview-reqs").textContent = reqs;

    const reqContainer = document.getElementById("job-preview-reqs");

if (reqContainer) {
    reqContainer.innerHTML = "";

    if (opt.dataset.reqs) {
        try {
            const parsed = JSON.parse(opt.dataset.reqs);

            if (Array.isArray(parsed) && parsed.length) {
                reqContainer.innerHTML = parsed
                    .map(r => `<li>${r}</li>`)
                    .join("");
            } else {
                reqContainer.innerHTML = "<li>No requirements specified</li>";
            }
        } catch (err) {
            console.error("Invalid requirements format:", opt.dataset.reqs);
        }
    }
}

    

    card.style.display = "block";
}

/* ── When role type changes, re-filter the dropdown ──── */
function onRoleTypeFilterChange(type) {
    _renderJobOptions(uistoJobs, type);
    // Reset job selection
    const sel = document.getElementById("apply-job-select");
    if (sel) sel.value = "";
    const card = document.getElementById("job-preview-card");
    if (card) card.style.display = "none";
    const hidden = document.getElementById("apply-position-id");
    if (hidden) hidden.value = "";
}

/* ── Overlay click-outside close ─────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("apply-overlay")?.addEventListener("click", function (e) {
        if (e.target === this) closeApplyModal();
    });
});
