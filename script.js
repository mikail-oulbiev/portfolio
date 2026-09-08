const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".navigation");

menuButton.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  menuButton.textContent = isOpen ? "×" : "☰";
});

document.querySelectorAll(".navigation a").forEach((link) => link.addEventListener("click", () => {
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Ouvrir le menu");
  menuButton.textContent = "☰";
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible"));
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
document.querySelector("#year").textContent = new Date().getFullYear();

const sectionLinks = [...document.querySelectorAll('.navigation a[href^="#"]')];
const sections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const navigationObserver = new IntersectionObserver((entries) => {
  const visibleSection = entries.find((entry) => entry.isIntersecting);
  if (!visibleSection) return;

  sectionLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${visibleSection.target.id}`);
  });
}, { rootMargin: "-35% 0px -55%", threshold: 0 });

sections.forEach((section) => navigationObserver.observe(section));

const copyEmailButton = document.querySelector(".copy-email-button");
const copyStatus = document.querySelector(".copy-status");

async function copyEmail(email) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(email);
    return;
  }

  const fallback = document.createElement("textarea");
  fallback.value = email;
  fallback.setAttribute("readonly", "");
  fallback.style.position = "fixed";
  fallback.style.opacity = "0";
  document.body.append(fallback);
  fallback.select();
  const copied = document.execCommand("copy");
  fallback.remove();
  if (!copied) throw new Error("Copie indisponible");
}

copyEmailButton.addEventListener("click", async () => {
  const defaultLabel = "Copier mon e-mail";
  try {
    await copyEmail(copyEmailButton.dataset.email);
    copyEmailButton.textContent = "✓ E-mail copié";
    copyStatus.textContent = "Adresse e-mail copiée dans le presse-papiers.";
  } catch {
    copyStatus.textContent = "Copie indisponible : sélectionnez l’adresse e-mail ci-dessous.";
  }

  window.setTimeout(() => {
    copyEmailButton.textContent = defaultLabel;
    copyStatus.textContent = "";
  }, 2500);
});

// Galerie projets : ouverture en grand écran + navigation clavier.
const lightbox = document.querySelector('#project-lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxCaption = document.querySelector('#lightbox-caption');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');
const galleryItems = [...document.querySelectorAll('.project-gallery .gallery-image')];
const singleLightboxItems = [...document.querySelectorAll('[data-lightbox="single"]')];
let lightboxItems = [];
let lightboxIndex = 0;
let lastFocusedElement = null;

function getLightboxData() {
  return [...galleryItems, ...singleLightboxItems];
}

function showLightbox(index) {
  lightboxItems = getLightboxData();
  if (!lightboxItems.length) return;
  lightboxIndex = Math.max(0, Math.min(index, lightboxItems.length - 1));
  const item = lightboxItems[lightboxIndex];
  lightboxImage.src = item.dataset.full || item.querySelector('img')?.src || '';
  lightboxImage.alt = item.querySelector('img')?.alt || '';
  lightboxCaption.textContent = item.dataset.caption || '';
  lightboxPrev.disabled = lightboxItems.length < 2;
  lightboxNext.disabled = lightboxItems.length < 2;
  lightbox.hidden = false;
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('.lightbox-close').focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
  document.body.style.overflow = '';
  lastFocusedElement?.focus();
}

function moveLightbox(step) {
  if (lightboxItems.length < 2) return;
  lightboxIndex = (lightboxIndex + step + lightboxItems.length) % lightboxItems.length;
  const item = lightboxItems[lightboxIndex];
  lightboxImage.src = item.dataset.full || item.querySelector('img')?.src || '';
  lightboxImage.alt = item.querySelector('img')?.alt || '';
  lightboxCaption.textContent = item.dataset.caption || '';
}

galleryItems.forEach((item) => item.addEventListener('click', () => {
  lastFocusedElement = item;
  // Navigation is kept within the same project when possible.
  const projectGallery = item.closest('.project-gallery');
  const projectItems = [...projectGallery.querySelectorAll('.gallery-image')];
  lightboxItems = projectItems;
  lightboxIndex = projectItems.indexOf(item);
  const current = lightboxItems[lightboxIndex];
  lightboxImage.src = current.dataset.full;
  lightboxImage.alt = current.querySelector('img')?.alt || '';
  lightboxCaption.textContent = current.dataset.caption || '';
  lightboxPrev.disabled = projectItems.length < 2;
  lightboxNext.disabled = projectItems.length < 2;
  lightbox.hidden = false;
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('.lightbox-close').focus();
}));

singleLightboxItems.forEach((item) => item.addEventListener('click', () => {
  lastFocusedElement = item;
  lightboxItems = singleLightboxItems;
  lightboxIndex = singleLightboxItems.indexOf(item);
  const current = lightboxItems[lightboxIndex];
  lightboxImage.src = current.dataset.full;
  lightboxImage.alt = current.alt || '';
  lightboxCaption.textContent = '';
  lightboxPrev.disabled = true;
  lightboxNext.disabled = true;
  lightbox.hidden = false;
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('.lightbox-close').focus();
}));

lightbox.querySelectorAll('[data-lightbox-close]').forEach((button) => button.addEventListener('click', closeLightbox));
lightboxPrev.addEventListener('click', () => moveLightbox(-1));
lightboxNext.addEventListener('click', () => moveLightbox(1));

document.addEventListener('keydown', (event) => {
  if (lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') moveLightbox(-1);
  if (event.key === 'ArrowRight') moveLightbox(1);
});
