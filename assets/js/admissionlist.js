const baseURL = "https://cms.uisto.edu.ng";
const apiBase = `${baseURL}/api/v1/news`;


const admissionId = "695b51f50b62d20907bf5f70";

async function loadNewsDetail() {
  
  const id = "695b51f50b62d20907bf5f70";

  try {
    const res = await fetch(`${apiBase}?page=1&limit=100`);
    const data = await res.json();

    const item = data.news.find((n) => n._id === id);
    if (!item) return;

    document.getElementById("news-title").innerText = item.title;
  
    document.getElementById("news-content").innerHTML = item.content;

    const image = document.getElementById("news-image");
    image.src = item.images?.[0]?.url
      ? baseURL + item.images[0].url
      : "";
    image.alt = item.title;

  } catch (err) {
    console.error("Error loading news detail:", err);
  }
}

loadNewsDetail();