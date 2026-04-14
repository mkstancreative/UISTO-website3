const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("closeModal");
const closeBtn = document.getElementById("closeBtn");

// Open on load
window.addEventListener("load", () => {
  setTimeout(() => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }, 400);
});

// Close function
function closeModal() {
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

// Events
closeModalBtn.addEventListener("click", closeModal);
closeBtn.addEventListener("click", closeModal);

// Close when clicking backdrop
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
