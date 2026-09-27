const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.textContent = open ? 'Close' : 'Menu';
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

document.querySelectorAll('#year').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

/* page progress */
const pageProgress = document.createElement('div');
pageProgress.className = 'scroll-progress-page';
document.body.appendChild(pageProgress);

/* soft page transition */
const curtain = document.createElement('div');
curtain.className = 'page-curtain';
curtain.setAttribute('aria-hidden', 'true');
document.body.appendChild(curtain);

document.querySelectorAll('a[href]').forEach((link) => {
  const raw = link.getAttribute('href');
  if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('http') || link.target === '_blank') return;
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reduceMotion) return;
    event.preventDefault();
    document.body.classList.add('is-leaving');
    window.setTimeout(() => {
      window.location.href = raw;
    }, 420);
  });
});

/* custom editorial cursor */
let cursorDot;
let cursorLabel;
if (finePointer && !reduceMotion) {
  cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot';
  cursorLabel = document.createElement('div');
  cursorLabel.className = 'cursor-label';
  document.body.append(cursorDot, cursorLabel);

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  let lx = cx;
  let ly = cy;

  const renderCursor = () => {
    lx += (cx - lx) * 0.16;
    ly += (cy - ly) * 0.16;
    cursorDot.style.left = cx + 'px';
    cursorDot.style.top = cy + 'px';
    cursorLabel.style.left = lx + 'px';
    cursorLabel.style.top = ly + 'px';
    requestAnimationFrame(renderCursor);
  };
  renderCursor();

  window.addEventListener('mousemove', (event) => {
    cx = event.clientX;
    cy = event.clientY;
  });

  document.querySelectorAll('[data-cursor]').forEach((target) => {
    target.addEventListener('mouseenter', () => {
      cursorLabel.textContent = target.dataset.cursor || 'view';
      cursorLabel.classList.add('on');
      cursorDot.style.opacity = '0';
    });
    target.addEventListener('mouseleave', () => {
      cursorLabel.classList.remove('on');
      cursorDot.style.opacity = '1';
    });
  });
}

/* magnetic details */
if (finePointer && !reduceMotion) {
  document.querySelectorAll('.magnetic').forEach((item) => {
    item.addEventListener('mousemove', (event) => {
      const box = item.getBoundingClientRect();
      const x = event.clientX - box.left - box.width / 2;
      const y = event.clientY - box.top - box.height / 2;
      item.style.transform = `translate(${x * 0.08}px,${y * 0.08}px)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });
}

/* hero ambient motion */
const orbOne = document.querySelector('.orb-one');
const orbTwo = document.querySelector('.orb-two');
if (finePointer && !reduceMotion && orbOne && orbTwo) {
  window.addEventListener('mousemove', (event) => {
    const px = event.clientX / window.innerWidth - 0.5;
    const py = event.clientY / window.innerHeight - 0.5;
    orbOne.style.transform = `translate(${px * 36}px,${py * 28}px)`;
    orbTwo.style.transform = `translate(${px * -26}px,${py * -22}px)`;
  });
}

/* horizontal chapter */
const horizontal = document.querySelector('[data-horizontal]');
const horizontalTrack = horizontal?.querySelector('.horizontal-track');
const horizontalProgress = horizontal?.querySelector('.horizontal-progress span');
const horizontalCount = horizontal?.querySelector('.horizontal-count');
const horizontalPanels = horizontal ? Array.from(horizontal.querySelectorAll('.hpanel')) : [];
let horizontalDistance = 0;
let horizontalEnabled = false;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sizeHorizontal() {
  if (!horizontal || !horizontalTrack) return;
  horizontalEnabled = window.innerWidth > 980 && !reduceMotion;
  if (!horizontalEnabled) {
    horizontal.style.height = 'auto';
    horizontalTrack.style.transform = '';
    return;
  }

  const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
  horizontalDistance = Math.max(0, horizontalTrack.scrollWidth - window.innerWidth);
  const visibleHeight = Math.max(560, window.innerHeight - headerHeight);
  horizontal.style.height = (horizontalDistance + visibleHeight) + 'px';
}

function updateHorizontal() {
  if (!horizontal || !horizontalTrack || !horizontalEnabled) return;

  const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
  const rect = horizontal.getBoundingClientRect();
  const visibleHeight = Math.max(560, window.innerHeight - headerHeight);
  const scrollable = Math.max(1, horizontal.offsetHeight - visibleHeight);
  const passed = -(rect.top - headerHeight);
  const progress = clamp(passed / scrollable, 0, 1);

  horizontalTrack.style.transform = `translate3d(${-horizontalDistance * progress}px,0,0)`;
  if (horizontalProgress) horizontalProgress.style.width = (progress * 100) + '%';

  if (horizontalCount && horizontalPanels.length) {
    const index = Math.min(horizontalPanels.length - 1, Math.floor(progress * horizontalPanels.length));
    const current = String(index + 1).padStart(2, '0');
    const total = String(horizontalPanels.length).padStart(2, '0');
    horizontalCount.textContent = current + ' / ' + total;
  }
}

/* desktop collage parallax retained for pages that use it */
const collage = document.querySelector('.hero-collage');
if (collage && finePointer && !reduceMotion) {
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

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    pageProgress.style.width = clamp(window.scrollY / max, 0, 1) * 100 + '%';
    updateHorizontal();
    ticking = false;
  });
}

sizeHorizontal();
updateHorizontal();
onScroll();

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => {
  sizeHorizontal();
  updateHorizontal();
});

/* make Back Forward Cache restores look normal */
window.addEventListener('pageshow', () => {
  document.body.classList.remove('is-leaving');
});
