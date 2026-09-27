(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;

  if (document.body.classList.contains('home-immersive') && !reduce) {
    let seen = false;
    try { seen = sessionStorage.getItem('sr_intro_seen') === '1'; } catch (e) {}
    if (!seen) {
      const intro = document.createElement('div');
      intro.className = 'atelier-intro';
      intro.setAttribute('aria-hidden', 'true');
      intro.innerHTML = '<div class="atelier-intro-mark"><strong>SR</strong><span>strategy · culture · curiosity</span></div>';
      document.body.appendChild(intro);
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => {
        intro.classList.add('is-gone');
        document.body.style.overflow = '';
        try { sessionStorage.setItem('sr_intro_seen', '1'); } catch (e) {}
      }, 1050);
      window.setTimeout(() => intro.remove(), 1900);
    }
  }

  if (fine && !reduce) {
    window.addEventListener('pointermove', (event) => {
      document.documentElement.style.setProperty('--spot-x', ((event.clientX / window.innerWidth) * 100) + '%');
      document.documentElement.style.setProperty('--spot-y', ((event.clientY / window.innerHeight) * 100) + '%');
    }, { passive: true });
  }

  const stage = document.querySelector('.atelier-stage');
  const mirror = stage?.querySelector('.stage-mirror');
  const depthObjects = stage ? [...stage.querySelectorAll('[data-depth]')] : [];

  if (stage && mirror && fine && !reduce) {
    stage.addEventListener('pointermove', (event) => {
      const box = stage.getBoundingClientRect();
      const nx = ((event.clientX - box.left) / box.width) - 0.5;
      const ny = ((event.clientY - box.top) / box.height) - 0.5;

      mirror.style.setProperty('--ry', (nx * 9) + 'deg');
      mirror.style.setProperty('--rx', (ny * -7) + 'deg');

      depthObjects.forEach((item) => {
        const depth = Number(item.dataset.depth || 1);
        item.style.translate = (nx * depth * 5) + 'px ' + (ny * depth * 4) + 'px';
      });
    });

    stage.addEventListener('pointerleave', () => {
      mirror.style.setProperty('--ry', '0deg');
      mirror.style.setProperty('--rx', '0deg');
      depthObjects.forEach((item) => { item.style.translate = '0 0'; });
    });
  }

  const panels = [...document.querySelectorAll('.hpanel')];
  const horizontal = document.querySelector('[data-horizontal]');

  function updateRooms() {
    if (!panels.length || !horizontal) return;

    if (window.innerWidth <= 980 || reduce) {
      panels.forEach((panel) => {
        const rect = panel.getBoundingClientRect();
        const active = rect.top < window.innerHeight * 0.62 && rect.bottom > window.innerHeight * 0.32;
        panel.classList.toggle('is-active', active);
        if (active) {
          const chapter = document.querySelector('.horizontal-chapter');
          const label = panel.querySelector('.eyebrow')?.textContent?.trim();
          if (chapter && label) chapter.textContent = 'THE CABINET · ' + label.toUpperCase();
        }
      });
      return;
    }

    const header = document.querySelector('.site-header')?.offsetHeight || 0;
    const visible = Math.max(560, window.innerHeight - header);
    const scrollable = Math.max(1, horizontal.offsetHeight - visible);
    const rect = horizontal.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (-(rect.top - header)) / scrollable));
    const index = Math.min(panels.length - 1, Math.floor(progress * panels.length));
    panels.forEach((panel, i) => panel.classList.toggle('is-active', i === index));

    const chapter = document.querySelector('.horizontal-chapter');
    const activeEyebrow = panels[index]?.querySelector('.eyebrow')?.textContent?.trim();
    if (chapter && activeEyebrow) {
      chapter.textContent = 'THE CABINET · ' + activeEyebrow.toUpperCase();
    }
  }

  if (fine && !reduce) {
    panels.forEach((panel) => {
      panel.addEventListener('pointermove', (event) => {
        const box = panel.getBoundingClientRect();
        panel.style.setProperty('--panel-x', (((event.clientX - box.left) / box.width) * 100) + '%');
        panel.style.setProperty('--panel-y', (((event.clientY - box.top) / box.height) * 100) + '%');
      }, { passive: true });
    });
  }

  let roomTick = false;
  const onRoomScroll = () => {
    if (roomTick) return;
    roomTick = true;
    requestAnimationFrame(() => {
      updateRooms();
      roomTick = false;
    });
  };

  updateRooms();
  window.addEventListener('scroll', onRoomScroll, { passive: true });
  window.addEventListener('resize', updateRooms);

  if (fine && !reduce) {
    document.querySelectorAll('.feature-project').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const box = card.getBoundingClientRect();
        card.style.setProperty('--glow-x', (((event.clientX - box.left) / box.width) * 100) + '%');
        card.style.setProperty('--glow-y', (((event.clientY - box.top) / box.height) * 100) + '%');
      }, { passive: true });
    });
  }
})();
