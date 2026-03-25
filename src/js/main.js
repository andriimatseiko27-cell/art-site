import Swiper from "swiper";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "../css/styles.css";

const base = import.meta.env.BASE_URL;

async function loadPartial(id, file) {
  const res = await fetch(`${base}partials/${file}`);

  if (!res.ok) {
    throw new Error(`Failed to load partial: ${file}`);
  }

  const html = await res.text();
  const element = document.getElementById(id);

  if (element) {
    element.innerHTML = html;
  }
}

async function initPage() {
  await loadPartial("header", "header.html");
  await loadPartial("hero", "hero.html");
  await loadPartial("services", "services.html");
  await loadPartial("about", "about.html");
  await loadPartial("gallery", "gallery.html");
  await loadPartial("review", "review.html");
  await loadPartial("footer", "footer.html");

  initGallerySwiper();
  initGalleryAnimation();
  initGalleryLightbox();
  initModal();
  initServices();
  initAboutAnimation();
  initReviewSwiper();
  initReviewAnimation();
  initActiveNav();
  initMobileMenu();
  initScrollTop();
}

function initMobileMenu() {
  const burger = document.querySelector(".burger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (!burger || !mobileMenu) return;

  function openMenu() {
    burger.classList.add("is-open");
    mobileMenu.classList.add("active");
    burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
  }

  function closeMenu() {
    burger.classList.remove("is-open");
    mobileMenu.classList.remove("active");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
  }

  burger.addEventListener("click", () => {
    const isOpen = burger.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  mobileMenu.addEventListener("click", (event) => {
    if (event.target === mobileMenu) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.classList.contains("active")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      closeMenu();
    }
  });
}

// ===== GALLERY SWIPER =====
function initGallerySwiper() {
  const gallerySwiperEl = document.querySelector(".gallery-swiper");

  if (!gallerySwiperEl) return;

  new Swiper(".gallery-swiper", {
    modules: [Navigation, Pagination],
    loop: true,
    spaceBetween: 24,
    slidesPerView: 1,
    speed: 700,
    grabCursor: true,

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    breakpoints: {
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  });
}

// ===== GALLERY SCROLL ANIMATION =====
function initGalleryAnimation() {
  const galleryAnimatedSlides = document.querySelectorAll(".gallery-animate");

  if (!galleryAnimatedSlides.length) return;

  const galleryAnimationObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("is-visible");
          }, index * 120);

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    },
  );

  galleryAnimatedSlides.forEach((slide) => {
    galleryAnimationObserver.observe(slide);
  });
}

// ===== LIGHTBOX =====
function initGalleryLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");
  const galleryImages = [
    ...document.querySelectorAll(".gallery-swiper .gallery-img"),
  ];

  if (!lightbox || !lightboxImg || !galleryImages.length) return;

  let currentIndex = 0;

  function updateLightboxImage() {
    const currentImg = galleryImages[currentIndex];
    if (!currentImg) return;

    lightboxImg.classList.add("is-switching");

    setTimeout(() => {
      lightboxImg.src = currentImg.src;
      lightboxImg.alt = currentImg.alt;
      lightboxImg.classList.remove("is-switching");
    }, 120);
  }

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = galleryImages[currentIndex].src;
    lightboxImg.alt = galleryImages[currentIndex].alt;
    lightbox.classList.add("active");
    document.body.classList.add("no-scroll");
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    updateLightboxImage();
  }

  function showPrev() {
    currentIndex =
      (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
  }

  galleryImages.forEach((img, index) => {
    img.addEventListener("click", () => openLightbox(index));
  });

  closeBtn?.addEventListener("click", closeLightbox);
  nextBtn?.addEventListener("click", showNext);
  prevBtn?.addEventListener("click", showPrev);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("active")) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") showNext();
    if (event.key === "ArrowLeft") showPrev();
  });
}

// ===== MODAL =====
function initModal() {
  let lottieInstance = null;

  const openModalBtn = document.querySelector("[data-modal-open]");
  const closeModalBtn = document.querySelector("[data-modal-close]");
  const backdrop = document.querySelector("[data-modal]");
  const form = document.querySelector("[data-estimate-form]");
  const formWrap = document.querySelector("[data-modal-form-wrap]");
  const successMessage = document.querySelector("[data-modal-success]");

  function openModal() {
    if (!backdrop) return;

    backdrop.classList.remove("is-hidden");
    document.body.style.overflow = "hidden";

    if (formWrap && successMessage) {
      formWrap.classList.remove("is-hidden");
      successMessage.classList.add("is-hidden");
    }
  }

  function closeModal() {
    if (!backdrop) return;

    backdrop.classList.add("is-hidden");
    document.body.style.overflow = "";
  }

  if (openModalBtn) {
    openModalBtn.addEventListener("click", openModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }

  if (backdrop) {
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      backdrop &&
      !backdrop.classList.contains("is-hidden")
    ) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);

      const payload = {
        name: formData.get("name")?.toString().trim(),
        phone: formData.get("phone")?.toString().trim(),
        message: formData.get("message")?.toString().trim(),
      };

      const submitBtn = form.querySelector(".form-submit-btn");
      const btnText = submitBtn?.querySelector(".btn-text");

      if (submitBtn) {
        submitBtn.classList.add("loading");
      }

      if (btnText) {
        btnText.textContent = "Sending...";
      }

      try {
        const endpoint = window.location.hostname.includes("github.io")
          ? "https://arttime-llc.netlify.app/.netlify/functions/send-telegram"
          : "/.netlify/functions/send-telegram";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Failed to send request");
        }

        if (submitBtn) {
          submitBtn.classList.remove("loading");
        }

        if (btnText) {
          btnText.textContent = "Send";
        }

        if (formWrap && successMessage) {
          formWrap.classList.add("is-hidden");
          successMessage.classList.remove("is-hidden");
        }

        const container = document.getElementById("lottie-success");

        if (container && typeof lottie !== "undefined") {
          if (!lottieInstance) {
            lottieInstance = lottie.loadAnimation({
              container,
              renderer: "svg",
              loop: false,
              autoplay: true,
              path: "https://assets10.lottiefiles.com/packages/lf20_jbrw3hcz.json",
            });
          } else {
            lottieInstance.goToAndPlay(0, true);
          }
        }

        form.reset();

        setTimeout(() => {
          closeModal();
        }, 3000);
      } catch (error) {
        if (submitBtn) {
          submitBtn.classList.remove("loading");
        }

        if (btnText) {
          btnText.textContent = "Send";
        }

        console.error("Form submit error:", error);
        alert("Something went wrong. Please try again.");
      }
    });
  }
}

// ===== ACTIVE NAV =====
function initActiveNav() {
  const sections = document.querySelectorAll(
    "#hero, #services, #about, #gallery, #review, #footer",
  );
  const navLinks = document.querySelectorAll(".nav-link");

  if (!sections.length || !navLinks.length) return;

  function updateActiveLink() {
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;

      if (
        window.scrollY >= sectionTop &&
        window.scrollY < sectionTop + sectionHeight
      ) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");

      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  }

  updateActiveLink();
  window.addEventListener("scroll", updateActiveLink);
}

// ===== SERVICES =====
function initServices() {
  const serviceCards = document.querySelectorAll(".service-card");
  const serviceToggleButtons = document.querySelectorAll(
    "[data-service-toggle]",
  );

  serviceToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".service-card");
      if (!card) return;

      const isOpen = card.classList.contains("is-open");

      serviceCards.forEach((item) => {
        item.classList.remove("is-open");

        const itemButton = item.querySelector("[data-service-toggle]");
        if (itemButton) {
          itemButton.textContent = "Learn More";
        }
      });

      if (!isOpen) {
        card.classList.add("is-open");
        button.textContent = "Show Less";
      }
    });
  });

  if (!serviceCards.length) return;

  const servicesObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("is-visible");
          }, index * 120);

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    },
  );

  serviceCards.forEach((card) => {
    servicesObserver.observe(card);
  });
}

// ===== ABOUT =====
function initAboutAnimation() {
  document.documentElement.classList.add("js");

  const aboutItems = document.querySelectorAll(".about-animate");

  if (!aboutItems.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  aboutItems.forEach((item) => {
    observer.observe(item);
  });
}

// ===== REVIEW SWIPER =====
function initReviewSwiper() {
  const reviewSwiperEl = document.querySelector(".review-swiper");

  if (!reviewSwiperEl) return;

  new Swiper(".review-swiper", {
    modules: [Navigation, Pagination],
    loop: true,
    slidesPerView: 1,
    speed: 700,
    spaceBetween: 24,

    pagination: {
      el: ".review-pagination",
      clickable: true,
    },

    navigation: {
      nextEl: ".review-next",
      prevEl: ".review-prev",
    },
  });
}

function initReviewAnimation() {
  document.documentElement.classList.add("js");

  const reviewItems = document.querySelectorAll(".review-animate");

  if (!reviewItems.length) return;

  const reviewObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  reviewItems.forEach((item) => {
    reviewObserver.observe(item);
  });
}

// ===== BUTTON UP =====
function initScrollTop() {
  const btn = document.querySelector("[data-scroll-top]");
  if (!btn) return;

  const progressBar = btn.querySelector(".scroll-progress-bar");
  const hero = document.querySelector("#hero");
  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  if (progressBar) {
    progressBar.style.strokeDasharray = `${circumference}`;
    progressBar.style.strokeDashoffset = `${circumference}`;
  }

  function updateScrollTop() {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    const offset = circumference - progress * circumference;

    if (progressBar) {
      progressBar.style.strokeDashoffset = `${offset}`;
    }

    if (scrollTop > (hero?.offsetHeight || 400)) {
      btn.classList.add("is-visible");
    } else {
      btn.classList.remove("is-visible");
    }
  }

  window.addEventListener("scroll", updateScrollTop, { passive: true });
  window.addEventListener("resize", updateScrollTop);

  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  updateScrollTop();
}

initPage().catch((error) => {
  console.error("Page init failed:", error);
});

document.documentElement.classList.add("js");
