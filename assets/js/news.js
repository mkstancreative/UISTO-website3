const apiBase =
  "https://cms.uisto.edu.ng/api/v1/news/active?page=1&limit=10";
const baseURL = "https://cms.uisto.edu.ng";
// Get 3 NEWS ITEMS
async function loadLatestNews(limit = 3) {
  try {
    const res = await fetch(apiBase);
    const data = await res.json();

    const grid = document.getElementById("news-grid");
    grid.innerHTML = "";

    data.news.slice(0, limit).forEach((item) => {
      const imageUrl = item.images?.[0]?.url
        ? baseURL + item.images[0].url
        : "default.jpg";
      const date = new Date(item.createdAt).toDateString();

      grid.innerHTML += `
            <a href="news-details.html?id=${item._id}" class="news-card fade-up" style="text-decoration:none;">
      <span class="news-tag">${item.newsTag}</span>
      <img src="${imageUrl}" alt="${item.title}" />
      <p class="news-date">${date}</p>
      <h3 class="news-title">${item.title}</h3>
    </a>
    `;
    });
  } catch (err) {
    console.error("Error fetching news:", err);
  }
}
loadLatestNews(3);


// GET NEWS BY ID
function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

async function loadNewsDetail() {
  const id = getQueryParam("id");
  if (!id) return;

  try {
    const res = await fetch(`${apiBase}?page=1&limit=100`);
    const data = await res.json();

    const item = data.news.find((n) => n._id === id);
    if (!item) return;

    document.getElementById("news-title").innerText = item.title;
    document.getElementById("news-date").innerText = new Date(
      item.createdAt
    ).toDateString();
    document.getElementById("news-tag").innerText = item.newsTag;
    document.getElementById("news-writer").innerText = item.writer || "Admin";
    document.getElementById("news-content").innerHTML = item.content;
    document.getElementById("news-image").src = item.images?.[0]?.url
      ? baseURL + item.images[0].url
      : "";
    document.getElementById("news-image").alt = item.title;
  } catch (err) {
    console.error("Error loading news detail:", err);
  }
}

loadNewsDetail();