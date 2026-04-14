const apiBase = "https://cms.uisto.edu.ng/api/gallery";
const baseUrl = "https://cms.uisto.edu.ng";

let currentPage = 1;
let totalPages = 1;

async function fetchGallery(page = 1) {
  try {
    const res = await fetch(`${apiBase}?page=${page}`);
    const data = await res.json();

    if (data.success && data.images.length > 0) {
      renderGallery(data.images);
      currentPage = data.currentPage;
      totalPages = data.totalPages;
      renderPagination();
    } else {
      document.getElementById("galleryContainer").innerHTML =
        "<p>No images found.</p>";
      document.getElementById("pagination").innerHTML = "";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("galleryContainer").innerHTML =
      "<p>Failed to load gallery.</p>";
    document.getElementById("pagination").innerHTML = "";
  }
}

function renderGallery(images) {
  const container = document.getElementById("galleryContainer");
  container.innerHTML = "";

  images.forEach((image) => {
    const card = document.createElement("div");
    card.classList.add("gallery-card");

    card.innerHTML = `
      <div class="gallery-img-container">
        <img src="${baseUrl + image.url}" alt="${image.altText}">
        <div class="img-title">${image.altText || "Untitled"}</div>
      </div>
    `;

    card.onclick = () => openModal(baseUrl + image.url);
    container.appendChild(card);
  });
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => fetchGallery(currentPage - 1);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => fetchGallery(currentPage + 1);

  pagination.appendChild(prevBtn);
  pagination.appendChild(nextBtn);
}

// MODAL FUNCTIONS
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");
const closeModalBtn = document.getElementById("closeModal");

function openModal(src) {
  modalImg.src = src;
  modal.classList.add("active");
}

closeModalBtn.onclick = () => modal.classList.remove("active");
modal.onclick = (e) => {
  if (e.target === modal) modal.classList.remove("active");
};

fetchGallery();
