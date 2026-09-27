const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.textContent = open ? 'Close' : 'Menu';
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.11 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

document.querySelectorAll('#year').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const collage = document.querySelector('.hero-collage');

if (collage && finePointer && !prefersReducedMotion) {
  const main = collage.querySelector('.frame-main');
  const note = collage.querySelector('.frame-note');
  const archive = collage.querySelector('.frame-archive');

  collage.addEventListener('mousemove', (event) => {
    const box = collage.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) - 0.5;
    const y = ((event.clientY - box.top) / box.height) - 0.5;

    if (main) {
      main.style.setProperty('--tx', `${x * 8}px`);
      main.style.setProperty('--ty', `${y * 7}px`);
    }
    if (note) {
      note.style.setProperty('--tx', `${x * -5}px`);
      note.style.setProperty('--ty', `${y * -4}px`);
    }
    if (archive) {
      archive.style.setProperty('--tx', `${x * 6}px`);
      archive.style.setProperty('--ty', `${y * -5}px`);
    }
  });

  collage.addEventListener('mouseleave', () => {
    [main, note, archive].forEach((item) => {
      if (!item) return;
      item.style.setProperty('--tx', '0px');
      item.style.setProperty('--ty', '0px');
    });
  });
}

document.querySelectorAll('.selected-card, .interest-card').forEach((card) => {
  if (!finePointer || prefersReducedMotion) return;
  card.addEventListener('mousemove', (event) => {
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    card.style.setProperty('--glow-x', `${x * 100}%`);
    card.style.setProperty('--glow-y', `${y * 100}%`);
  });
});
