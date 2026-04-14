// GET ALL NEWS FOR NEWS PAGE 
let currentPage = 1;
const apiBase =
  "https://cms.uisto.edu.ng/api/v1/news/active?page=1&limit=10";
const baseURL = "https://cms.uisto.edu.ng";

async function loadNews(page = 1) {
  const res = await fetch(`${apiBase}?page=${page}`);
  const data = await res.json();
  const container = document.getElementById("blog-list");
  container.innerHTML = "";

  data.news.forEach((item) => {
    const imageUrl = item.images?.[0]?.url
      ? baseURL + item.images[0].url
      : "default.jpg";

    const date = new Date(item.createdAt).toDateString();

    container.innerHTML += `
                      <a href="news-details.html?id=${item._id}" class="news-card fade-up">
                  <span class="news-tag">${item.newsTag}</span>
                  <img src="${imageUrl}" alt="${item.title}" />
                  <p class="news-date">${date}</p>
                  <h3 class="news-title">${item.title}</h3>
                </a>
                        
                        `;
  });

  // Pagination button logic (unchanged)
  document.getElementById("prevBtn").disabled = page === 1;
  document.getElementById("nextBtn").disabled =
    page >= Math.ceil(data.total / data.news.length);
}

document.getElementById("nextBtn").onclick = () => {
  currentPage++;
  loadNews(currentPage);
};
document.getElementById("prevBtn").onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    loadNews(currentPage);
  }
};

loadNews(currentPage);
