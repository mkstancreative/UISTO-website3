// ── Header & Footer Injector (no fetch, no CORS issues) ─────────────────
(function () {
  var HEADER_HTML = `<div class="w-layout-blockcontainer container-full w-container">
  <div
    data-animation="default"
    data-collapse="medium"
    data-duration="400"
    data-easing="ease"
    data-easing2="ease"
    role="banner"
    class="navbar w-nav"
  >
    <a href="/index" aria-current="page" class="brand w-nav-brand w--current">
      <img src="/assets/img/logo2.png" loading="lazy" alt="logo" width="70px" />
    </a>
    <nav role="navigation" class="nav-menu w-nav-menu">
      <a data-w-id="7b1b8292-efbe-45d3-f9b7-b8bf1652b056" href="#" class="nav-link-white w-inline-block">
        <div class="nav-link-inner-block">
          <div class="nav-link-text">Key Institutional Data</div>
          <div class="nav-link-text-hover">Key Institutional Data</div>
        </div>
      </a>
      <div data-hover="false" data-delay="0" class="dropdown w-dropdown">
        <div data-w-id="7b1b8292-efbe-45d3-f9b7-b8bf1652b063" class="nav-link-white w-dropdown-toggle">
          <div class="nav-link-inner-block">
            <div class="nav-link-text">Administration</div>
            <div class="nav-link-text-hover">Administration</div>
          </div>
          <div class="dropdown-icon w-icon-dropdown-toggle"></div>
        </div>
        <nav class="dropdown-list w-dropdown-list">
          <div class="dropdown-area">
            <div class="dropdown-block">
              <div class="dropdown-title">Administration</div>
              <div class="dropdown-nav-wrapper">
                <a href="/vc" class="dropdown-text-link">Vice Chancellor</a>
                <a href="/Bursar" class="dropdown-text-link">Bursar</a>
                <a href="/registrar" class="dropdown-text-link">Registrar</a>
                <a href="/librarian" class="dropdown-text-link">University Librarian</a>
              </div>
            </div>
          </div>
        </nav>
      </div>
      <div data-hover="false" data-delay="0" class="dropdown w-dropdown">
        <div data-w-id="7b1b8292-efbe-45d3-f9b7-b8bf1652b063" class="nav-link-white w-dropdown-toggle">
          <div class="nav-link-inner-block">
            <div class="nav-link-text">Academics</div>
            <div class="nav-link-text-hover">Academics</div>
          </div>
          <div class="dropdown-icon w-icon-dropdown-toggle"></div>
        </div>
        <nav class="dropdown-list w-dropdown-list">
          <div class="dropdown-area">
            <div class="dropdown-block">
              <div class="dropdown-title">Academics</div>
              <div class="dropdown-nav-wrapper">
                <a href="/programs" class="dropdown-text-link">Programs</a>
                <a href="/jorunals" class="dropdown-text-link">E-Jorunals</a>
              </div>
            </div>
          </div>
        </nav>
      </div>
      <div data-hover="false" data-delay="0" class="dropdown w-dropdown">
        <div data-w-id="7b1b8292-efbe-45d3-f9b7-b8bf1652b063" class="nav-link-white w-dropdown-toggle">
          <div class="nav-link-inner-block">
            <div class="nav-link-text">Admissions &amp; Aid</div>
            <div class="nav-link-text-hover">Admissions &amp; Aid</div>
          </div>
          <div class="dropdown-icon w-icon-dropdown-toggle"></div>
        </div>
        <nav class="dropdown-list w-dropdown-list">
          <div class="dropdown-area">
            <div class="dropdown-block">
              <div class="dropdown-title">Admissions &amp; Aid</div>
              <div class="dropdown-nav-wrapper">
                <a href="/admissions" class="dropdown-text-link">Admission Requirement</a>
                <a href="/admission-list" class="dropdown-text-link">Admission List</a>
                <a href="/pay-fees" class="dropdown-text-link">Pay Fees</a>
              </div>
            </div>
          </div>
        </nav>
      </div>
      <div data-hover="false" data-delay="0" class="dropdown w-dropdown">
        <div data-w-id="7b1b8292-efbe-45d3-f9b7-b8bf1652b063" class="nav-link-white w-dropdown-toggle">
          <div class="nav-link-inner-block">
            <div class="nav-link-text">More</div>
            <div class="nav-link-text-hover">More</div>
          </div>
          <div class="dropdown-icon w-icon-dropdown-toggle"></div>
        </div>
        <nav class="dropdown-list w-dropdown-list">
          <div class="dropdown-area">
            <div class="dropdown-block">
              <div class="dropdown-title">More</div>
              <div class="dropdown-nav-wrapper">
                <a href="/events" class="dropdown-text-link">Event</a>
                <a href="/blog" class="dropdown-text-link">News</a>
                <a href="/gallery" class="dropdown-text-link">Gallery</a>
                <a href="/campus" class="dropdown-text-link">Campus Tour</a>
                <a href="/career/index" class="dropdown-text-link">Career</a>
                <a href="/about" class="dropdown-text-link">About Us</a>
                <a href="/contact" class="dropdown-text-link">Contact</a>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </nav>
    <div class="user-event-block">
      <div class="hidden-mobile-small">
        <a
          data-w-id="0e0afb4f-aff4-5f19-346a-e7f4813a9a3b"
          href="https://uisto.edu.ng/news-details.html?id=69452cf9effafa3a02bb6c02"
          class="button is-white w-inline-block"
          style="padding: 10px"
        >
          <div class="button-block">
            <div class="button-text">Apply Now</div>
            <div class="button-text-hover">Apply Now</div>
          </div>
          <div class="button-icon-block">
            <img src="https://wubflow-shield.NOCODEXPORT.DEV/68e0f069e7077842f6665fd3/68e2f3e5162cf992203b2b45_icon-dark-arrow-up.svg" loading="lazy" alt="Arrow Top Right" class="button-icon" />
            <img src="https://wubflow-shield.NOCODEXPORT.DEV/68e0f069e7077842f6665fd3/68e2f3e5162cf992203b2b45_icon-dark-arrow-up.svg" loading="lazy" alt="Arrow Top Right" class="button-icon-hover" />
          </div>
        </a>
      </div>
      <div class="menu-button w-nav-button">
        <img src="https://wubflow-shield.NOCODEXPORT.DEV/68e0f069e7077842f6665fd3/68ebe4e6d055bcdafff66bb0_icon-white-menu-fill.svg" loading="lazy" alt="menu icon" class="menu-icon" />
      </div>
    </div>
  </div>
</div>`;

  var FOOTER_HTML = `<div class="footer-top">
  <div class="w-layout-blockcontainer container w-container">
    <div class="footer-widget-area">
      <div class="footer-widget-about">
        <a href="#" class="footer-logo-link w-inline-block">
          <img src="/assets/img/logo1.png" loading="lazy" width="99" alt="Logo" />
        </a>
        <div class="footer-info-list-block">
          <div class="footer-info-item-block">
            <address class="footer-info-address">
              <div>P. M. B. 1126 ORLU, IMO STATE, NIGERIA</div>
            </address>
          </div>
        </div>
      </div>
      <div class="footer-widget-nav">
        <div class="footer-nav-block">
          <a href="/index" aria-current="page" class="footer-nav-link w-inline-block w--current">
            <div class="footer-inner-block">
              <div class="footer-text">Home</div>
              <div class="footer-text-hover">Home</div>
            </div>
            <div class="footer-nav-hover-dash"></div>
          </a>
          <a href="/registrar" class="footer-nav-link w-inline-block">
            <div class="footer-inner-block">
              <div class="footer-text">Registrar</div>
              <div class="footer-text-hover">Registrar</div>
            </div>
            <div class="footer-nav-hover-dash"></div>
          </a>
          <a href="/Bursar" class="footer-nav-link w-inline-block">
            <div class="footer-inner-block">
              <div class="footer-text">Bursar</div>
              <div class="footer-text-hover">Bursar</div>
            </div>
            <div class="footer-nav-hover-dash"></div>
          </a>
          <a href="/librarian" class="footer-nav-link w-inline-block">
            <div class="footer-inner-block">
              <div class="footer-text">University Librarian</div>
              <div class="footer-text-hover">University Librarian</div>
            </div>
            <div class="footer-nav-hover-dash"></div>
          </a>
        </div>
      </div>
      <div class="footer-widget-nav">
        <div class="footer-nav-block">
          <a href="/about" class="footer-nav-link w-inline-block">
            <div class="footer-inner-block">
              <div class="footer-text">About</div>
              <div class="footer-text-hover">About</div>
            </div>
            <div class="footer-nav-hover-dash"></div>
          </a>
          <a href="/programs" class="footer-nav-link w-inline-block">
            <div class="footer-inner-block">
              <div class="footer-text">Apply Now</div>
              <div class="footer-text-hover">Apply Now</div>
            </div>
            <div class="footer-nav-hover-dash"></div>
          </a>
        </div>
      </div>
      <div class="footer-widget-nav">
        <div class="footer-nav-block">
          <a href="./admissions" class="footer-nav-link w-inline-block">
            <div class="footer-inner-block">
              <div class="footer-text">Undergraduate</div>
              <div class="footer-text-hover">Undergraduate</div>
            </div>
            <div class="footer-nav-hover-dash"></div>
          </a>
          <a href="#" class="footer-nav-link w-inline-block">
            <div class="footer-inner-block">
              <div class="footer-text">Postgraduate</div>
              <div class="footer-text-hover">Postgraduate</div>
            </div>
            <div class="footer-nav-hover-dash"></div>
          </a>
          <a href="#" class="footer-nav-link w-inline-block">
            <div class="footer-inner-block">
              <div class="footer-text">Professional Studies</div>
              <div class="footer-text-hover">Professional Studies</div>
            </div>
            <div class="footer-nav-hover-dash"></div>
          </a>
          <a href="#" class="footer-nav-link w-inline-block">
            <div class="footer-inner-block">
              <div class="footer-text">Certificate &amp; Courses</div>
              <div class="footer-text-hover">Certificate &amp; Courses</div>
            </div>
            <div class="footer-nav-hover-dash"></div>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="footer-bottom">
  <div class="w-layout-blockcontainer container w-container">
    <div class="footer-bottom-block">
      <div class="copyright-text">Powered By NetPro International</div>
    </div>
  </div>
</div>`;

  function injectSection(selector, html) {
    var el = document.querySelector(selector);
    if (!el) return;
    el.innerHTML = html;
    if (selector === ".section-header" && window.Webflow) {
      try {
        Webflow.destroy();
        Webflow.ready();
        Webflow.require("ix2").init();
      } catch (e) {}
    }
  }

  function run() {
    injectSection(".section-header", HEADER_HTML);
    injectSection(".section-footer", FOOTER_HTML);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

// ── Scroll-based Header Class ─────────────────────────────────────────────
window.addEventListener("scroll", function () {
  var header = document.querySelector(".section-header");
  if (!header) return;
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// ── Video play handler ────────────────────────────────────────────────────
var playBtn = document.getElementById("playVideo");
if (playBtn) {
  playBtn.addEventListener("click", function () {
    var video = document.getElementById("tourVideo");
    var thumb = document.getElementById("videoThumb");
    var youtubeID = "KudqBnl8W8U?si=Eczs6pTtMG_Vpv0G";
    video.src =
      "https://www.youtube.com/embed/" +
      youtubeID +
      "?autoplay=1&controls=0&rel=0&modestbranding=1&showinfo=0&disablekb=1";
    thumb.style.display = "none";
    this.style.display = "none";
    video.style.display = "block";
  });
}


// ── Scroll-based Header Class ─────────────────────────────────────────────
window.addEventListener("scroll", function () {
  var header = document.querySelector(".section-header");
  if (!header) return;
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// ── Video play handler ────────────────────────────────────────────────────
var playBtn = document.getElementById("playVideo");
if (playBtn) {
  playBtn.addEventListener("click", function () {
    var video = document.getElementById("tourVideo");
    var thumb = document.getElementById("videoThumb");
    var youtubeID = "KudqBnl8W8U?si=Eczs6pTtMG_Vpv0G";

    video.src =
      "https://www.youtube.com/embed/" +
      youtubeID +
      "?autoplay=1&controls=0&rel=0&modestbranding=1&showinfo=0&disablekb=1";

    thumb.style.display = "none";
    this.style.display = "none";
    video.style.display = "block";
  });
}

