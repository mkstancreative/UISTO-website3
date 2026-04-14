const JOBS_API_URL = "https://career.uisto.edu.ng/api/v1/";


/* ── Job Data State ───────────────────────────────────── */
let uistoJobs = [];
let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;
let totalJobs = 0;
let searchQuery = "";
let activeFilter = "all";   // active category pill
let activeJobId = null;
let isLoading = false;


/* ── API Fetch Functions ──────────────────────────────── */
async function fetchJobs() {
    try {
        isLoading = true;
        renderCards();

        const params = new URLSearchParams({
            page: currentPage,
            limit: itemsPerPage
        });
        if (searchQuery) params.append("search", searchQuery);

        const res = await fetch(`${JOBS_API_URL}careers?${params.toString()}`);
        const result = await res.json();

        if (result.success) {
            uistoJobs = result.data;
            totalJobs = result.total || 0;
            totalPages = Math.ceil(totalJobs / itemsPerPage);
        } else {
            uistoJobs = [];
            totalJobs = 0;
            totalPages = 1;
        }
    } catch (err) {
        console.error("Error fetching jobs:", err);
        uistoJobs = [];
    } finally {
        isLoading = false;
        renderCards();
        renderFilters();
        renderPagination();
    }
}

function handleSearch() {
    const input = document.getElementById("uisto-search").value;
    searchQuery = input;
    currentPage = 1;
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        fetchJobs();
    }, 500);
}

function filterByCategory(cadre) {
    activeFilter = cadre;
    renderCards();
    renderFilters();
}

function changePage(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    currentPage = newPage;
    fetchJobs();
}

/* ── Render Category Filters ────────────────────────────── */
function renderFilters() {
    const bar = document.getElementById("uisto-filters");
    if (!bar) return;

    // Collect unique cadre names from loaded jobs
    const categories = ["all", ...new Set(
        uistoJobs.map((j) => j.cadre?.name).filter(Boolean)
    )];

    bar.innerHTML = categories.map((cat) => {
        const isActive = cat === activeFilter;
        const label = cat === "all" ? "All" : cat;
        return `<button class="filter-pill${isActive ? " active" : ""}" onclick="filterByCategory('${cat}')">${label}</button>`;
    }).join("");
}

function renderPagination() {
    const paginationContainer = document.getElementById("uisto-pagination");
    if (!paginationContainer) return;

    if (totalPages <= 1) {
        paginationContainer.innerHTML = "";
        return;
    }

    let html = `<button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>Previous</button>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination-btn ${i === currentPage ? "active" : ""}" onclick="changePage(${i})">${i}</button>`;
    }

    html += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>Next</button>`;

    paginationContainer.innerHTML = html;
}

/* ── Render Cards ─────────────────────────────────────── */
function renderCards() {
    const countEl = document.getElementById("uisto-count");
    if (isLoading) {
        if (countEl) countEl.textContent = "Loading jobs...";
        document.getElementById("uisto-grid").innerHTML = "<p>Loading positions...</p>";
        return;
    }

    const filteredJobs = activeFilter === "all"
        ? uistoJobs
        : uistoJobs.filter((j) => j.cadre?.name === activeFilter);

    if (countEl) {
        countEl.textContent = `Showing ${filteredJobs.length} position${filteredJobs.length !== 1 ? "s" : ""} (Total on page: ${uistoJobs.length})`;
    }

    if (filteredJobs.length === 0) {
        document.getElementById("uisto-grid").innerHTML = "<p>No positions match the selected category.</p>";
        return;
    }

    document.getElementById("uisto-grid").innerHTML = filteredJobs
        .map((j) => {
            const reqText = j.description || j.requirements?.[0] || "";
            const preview = reqText.length > 90 ? reqText.slice(0, 90) + "…" : reqText;
            const catName = j.cadre?.name || "Career";
            return `
        <div class="job-card" onclick="openJobDetail('${j._id}')">
          <div class="card-top">
            <span class="card-title">${j.title}</span>
            <span class="badge badge-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}">${catName}</span>
          </div>
          <p class="card-req">${preview}</p>
          <div class="card-footer">
            <span class="card-type-tag">${j.type || "Full-Time"}</span>
            <span class="card-level-tag">${j.rank || "Staff"}</span>
            <span class="card-arrow">View Details →</span>
          </div>
        </div>`;
        })
        .join("");
}

/* ── Job Detail Modal ─────────────────────────────────── */
async function openJobDetail(id) {
    try {
        const res = await fetch(`${JOBS_API_URL}careers/${id}`);
        const result = await res.json();

        if (!result.success || !result.data) {
            alert("Job details could not be loaded.");
            return;
        }

        const job = result.data;
        activeJobId = id;

        const catName = job.cadre?.name || "Career";
        const minQual = job.qualificationMatrix ?
            `${job.qualificationMatrix.minimumDegree || ""} ${job.qualificationMatrix.minimumClass ? '(' + job.qualificationMatrix.minimumClass + ')' : ''} with ${job.qualificationMatrix.requiredYearsExperience || 0} years experience`
            : "";

        const defaultClass = "badge-" + catName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        document.getElementById("jd-badge").className = `jd-badge badge ${defaultClass}`;
        document.getElementById("jd-badge").textContent = catName;
        document.getElementById("jd-title").textContent = job.title;
        document.getElementById("jd-type").textContent = job.type || "Full-Time";
        document.getElementById("jd-level").textContent = job.rank || "";
        document.getElementById("jd-qualifications").textContent = minQual;

        let responsibilities = job.requirements || [];
        if (!Array.isArray(responsibilities)) {
            responsibilities = [];
        }

        document.getElementById("jd-responsibilities").innerHTML = responsibilities
            .map((d) => `<li>${d}</li>`)
            .join("");

        const applyPositionLabel = document.getElementById("apply-position-label");
        if (applyPositionLabel) {
            applyPositionLabel.textContent = `Applying for: ${job.title}`;
        }
        const applyPositionId = document.getElementById("apply-position-id");
        if (applyPositionId) {
            applyPositionId.value = job._id;
        }

        document.getElementById("job-detail-overlay").classList.add("active");
        document.body.style.overflow = "hidden";
    } catch (err) {
        console.error("Error fetching job details:", err);
        alert("Failed to fetch job details.");
    }
}

function closeJobDetail() {
    document.getElementById("job-detail-overlay").classList.remove("active");
    document.body.style.overflow = "";
}

/* ── Overlay click-outside close ─────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("job-detail-overlay").addEventListener("click", function (e) {
        if (e.target === this) closeJobDetail();
    });
    document.getElementById("apply-overlay").addEventListener("click", function (e) {
        if (e.target === this) closeApplyModal();
    });
    // Note: state dropdown population and form submit are handled by CareerApplication.js
});

/* ── Init ─────────────────────────────────────────────── */
fetchJobs();