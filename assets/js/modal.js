const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("closeModal");
const closeBtn = document.getElementById("closeBtn");

// Open on load
window.addEventListener("load", () => {
  setTimeout(() => {
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }, 400);
});

// Close function
function closeModal() {
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

// Events
if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
if (closeBtn) closeBtn.addEventListener("click", closeModal);

// Close when clicking backdrop
if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}
