// 1. Scroll-based Header Class (Keep this as is)
window.addEventListener("scroll", function () {
  const header = document.querySelector(".section-header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// 2. jQuery Load Function (Keep this as is)
function loadSection(selector, file, callback) {
  $(selector).load(file, function () {
    if (callback) callback();
  });
}

loadSection(".section-header", "header.html", function () {
  if (window.Webflow) {
    try {
      Webflow.destroy();
      Webflow.ready();
      Webflow.require("ix2").init();
      console.log("Header loaded and Webflow re-initialized immediately.");
    } catch (e) {
      console.error("Webflow re-initialization failed:", e);
    }
  }
});

loadSection(".section-footer", "footer.html");

const playBtn = document.getElementById("playVideo");
if (playBtn) {
  playBtn.addEventListener("click", function () {
    const video = document.getElementById("tourVideo");
    const thumb = document.getElementById("videoThumb");
    const box = document.getElementById("videoBox");

    const youtubeID = "KudqBnl8W8U?si=Eczs6pTtMG_Vpv0G";

    video.src = `https://www.youtube.com/embed/${youtubeID}?autoplay=1&controls=0&rel=0&modestbranding=1&showinfo=0&disablekb=1`;

    thumb.style.display = "none";
    this.style.display = "none";
    video.style.display = "block";
  });
}
