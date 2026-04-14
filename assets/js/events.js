const apiBase = "https://cms.uisto.edu.ng/api/v1/events";

async function fetchEvents() {
  try {
    const res = await fetch(apiBase);
    const data = await res.json();

    if (data.success && data.events.length > 0) {
      renderEvents(data.events);
    } else {
      document.getElementById("eventsContainer").innerHTML =
        "<p>No events found.</p>";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("eventsContainer").innerHTML =
      "<p>Failed to load events.</p>";
  }
}

function renderEvents(events) {
  const container = document.getElementById("eventsContainer");
  container.innerHTML = "";

  events.forEach((event) => {
    const eventCard = document.createElement("div");
    eventCard.classList.add("event-card");

    // Short preview
    const preview =
      event.description.length > 100
        ? event.description.slice(0, 100) + "..."
        : event.description;

    eventCard.innerHTML = `
              <div class="event-title">${event.title}</div>
              <div class="event-description-preview">${preview}</div>
            `;

    // Open modal on click
    eventCard.addEventListener("click", () => openModal(event));

    container.appendChild(eventCard);
  });
}

// Modal handling
const modal = document.getElementById("eventModal");
const modalContent = modal.querySelector(".modal-content");
const modalClose = document.getElementById("modalClose");

function openModal(event) {
  document.getElementById("modalTitle").innerText = event.title;
  document.getElementById("modalDescription").innerText = event.description;
  document.getElementById("modalDate").innerText = new Date(
    event.date
  ).toLocaleDateString();
  document.getElementById(
    "modalTime"
  ).innerText = `${event.startTime} - ${event.endTime}`;
  document.getElementById("modalLocation").innerText = event.location;

  modal.style.display = "block";
  setTimeout(() => modal.classList.add("show"), 10); // trigger animation
}

// Close modal
modalClose.onclick = () => closeModal();
window.onclick = (e) => {
  if (e.target == modal) closeModal();
};

function closeModal() {
  modal.classList.remove("show");
  setTimeout(() => (modal.style.display = "none"), 300);
}

fetchEvents();
