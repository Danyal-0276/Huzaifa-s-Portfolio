const hero = document.querySelector('.hero-art');
const featuredCard = document.querySelector('.work-card-feature');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const splash = document.querySelector('#intro-splash');
if (splash) {
  let alreadyShown = false;
  try {
    alreadyShown = sessionStorage.getItem('huzaifa-splash-seen') === '1';
    if (!alreadyShown) sessionStorage.setItem('huzaifa-splash-seen', '1');
  } catch {
    // If storage is unavailable, show the intro once for this page load.
  }

  const dismissSplash = () => {
    if (!splash.isConnected) return;
    splash.classList.add('is-leaving');
    document.body.classList.remove('splash-active');
    window.setTimeout(() => splash.remove(), 750);
  };

  if (alreadyShown) {
    splash.remove();
  } else {
    document.body.classList.add('splash-active');
    const canvas = splash.querySelector('canvas');
    const context = canvas.getContext('2d');
    const lineColor = getComputedStyle(document.documentElement).getPropertyValue('--splash-line-color').trim() || '#e87355';
    let frame = 0;
    let animationId;

    const drawLines = (loop = true) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1.1;
      context.strokeStyle = lineColor;
      context.shadowColor = lineColor;
      context.shadowBlur = 13;
      const center = height * 0.52;
      const amplitude = Math.min(height * 0.27, 190);
      const phase = frame * 0.013;
      for (let line = 0; line < 34; line += 1) {
        const offset = (line - 16.5) * (height < 600 ? 5 : 7);
        const frequency = 0.004 + (line % 7) * 0.00042;
        context.globalAlpha = 0.12 + 0.25 * (1 - Math.abs(line - 16.5) / 17);
        context.beginPath();
        for (let x = 0; x <= width + 12; x += 12) {
          const wave = Math.sin(x * frequency + phase + line * 0.12) * amplitude;
          const detail = Math.sin(x * 0.011 - phase * 0.7 + line * 0.25) * amplitude * 0.12;
          const y = center + offset + wave + detail;
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }
      context.globalAlpha = 1;
      frame += 1;
      if (loop) animationId = window.requestAnimationFrame(() => drawLines());
    };

    if (!reducedMotion) {
      drawLines();
      window.addEventListener('resize', () => { canvas.width = 0; }, { passive: true });
    } else {
      drawLines(false);
    }

    splash.querySelector('.splash-skip').addEventListener('click', () => {
      if (animationId) window.cancelAnimationFrame(animationId);
      dismissSplash();
    });
    window.setTimeout(() => {
      if (animationId) window.cancelAnimationFrame(animationId);
      dismissSplash();
    }, reducedMotion ? 850 : 1900);
  }
}

document.querySelector('#year').textContent = new Date().getFullYear();

const glitchChars = '!<>/\\|{}[]*+=~^_?:;';
const rippleTimers = new WeakMap();

document.querySelectorAll('[data-ascii-ripple]').forEach((element) => {
  const label = element.textContent;
  element.setAttribute('aria-label', label);
  element.innerHTML = [...label].map((char) =>
    char === ' ' ? ' ' : `<span class="ripple-char" aria-hidden="true">${char}</span>`
  ).join('');

  const playRipple = (originX) => {
    if (reducedMotion) return;
    (rippleTimers.get(element) || []).forEach(clearTimeout);
    const chars = [...element.querySelectorAll('.ripple-char')];
    const rect = element.getBoundingClientRect();
    const targetX = originX ?? rect.left + rect.width / 2;
    const maxDistance = Math.max(rect.width / 2, 1);
    const timers = [];

    chars.forEach((char) => {
      const charRect = char.getBoundingClientRect();
      const distance = Math.abs(charRect.left + charRect.width / 2 - targetX);
      const delay = Math.min(1000, (distance / maxDistance) * 1000 * 1.2);
      timers.push(setTimeout(() => {
        const original = char.dataset.original || char.textContent;
        char.dataset.original = original;
        char.classList.add('is-glitching');
        let ticks = 0;
        const interval = setInterval(() => {
          char.textContent = glitchChars[Math.floor(Math.random() * glitchChars.length)];
          ticks += 1;
          if (ticks >= 5) {
            clearInterval(interval);
            char.textContent = original;
            char.classList.remove('is-glitching');
          }
        }, 38);
      }, delay));
    });
    rippleTimers.set(element, timers);
  };

  element.addEventListener('pointerenter', (event) => playRipple(event.clientX));
  element.addEventListener('focus', () => playRipple());
});

if (hero && !reducedMotion) {
  hero.classList.add('is-ready');
}

if (featuredCard && !reducedMotion) {
  let scheduled = false;
  const updateCard = () => {
    const rect = featuredCard.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    const progress = Math.max(0, Math.min(1, (viewHeight - rect.top) / (viewHeight + rect.height)));
    const scale = 1 - Math.sin(progress * Math.PI) * 0.055;
    const tilt = (progress - 0.5) * 2.2;
    featuredCard.style.setProperty('--scroll-scale', scale.toFixed(3));
    featuredCard.style.setProperty('--scroll-tilt', `${tilt.toFixed(2)}deg`);
    scheduled = false;
  };
  const requestUpdate = () => {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(updateCard);
    }
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  requestUpdate();
}
