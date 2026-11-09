// Interações leves: atualiza apenas quando o ponteiro se move.
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('.motion-toggle');
  const scene = document.querySelector('.ambient-parallax');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const precisePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let savedPause = false;
  let pointerFrame = 0;

  try { savedPause = localStorage.getItem('portfolio-motion-paused') === 'true'; }
  catch { /* O site continua funcionando quando o armazenamento está bloqueado. */ }

  function isPaused() {
    return reducedMotion.matches || root.dataset.motion === 'paused';
  }

  function resetPointer() {
    scene.style.removeProperty('--ambient-x');
    scene.style.removeProperty('--ambient-y');
    document.querySelectorAll('.project-card').forEach(card => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    });
  }

  function syncMotion() {
    const paused = savedPause || reducedMotion.matches;
    root.dataset.motion = paused ? 'paused' : 'running';
    toggle.setAttribute('aria-pressed', String(paused));
    const label = reducedMotion.matches
      ? 'Animações reduzidas pela preferência do dispositivo'
      : paused ? 'Ativar animações' : 'Pausar animações';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    toggle.disabled = reducedMotion.matches;
    resetPointer();
    document.dispatchEvent(new Event('motionchange'));
  }

  toggle.addEventListener('click', () => {
    savedPause = !savedPause;
    try { localStorage.setItem('portfolio-motion-paused', String(savedPause)); }
    catch { /* A preferência permanece válida nesta página. */ }
    syncMotion();
  });
  reducedMotion.addEventListener('change', syncMotion);
  precisePointer.addEventListener('change', resetPointer);

  document.addEventListener('pointermove', event => {
    if (isPaused() || !precisePointer.matches || document.hidden) return;
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      scene.style.setProperty('--ambient-x', `${(event.clientX / innerWidth - .5) * 22}px`);
      scene.style.setProperty('--ambient-y', `${(event.clientY / innerHeight - .5) * 16}px`);
    });
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', resetPointer);

  document.querySelectorAll('.skill-card, .project-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (isPaused() || !precisePointer.matches) return;
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      card.style.setProperty('--spot-x', `${x}px`);
      card.style.setProperty('--spot-y', `${y}px`);
      if (card.classList.contains('project-card')) {
        card.style.setProperty('--tilt-x', `${(y / bounds.height - .5) * -3}deg`);
        card.style.setProperty('--tilt-y', `${(x / bounds.width - .5) * 3}deg`);
      }
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    });
  });

  // Evita trabalho visual em abas que não estão visíveis.
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('page-hidden', document.hidden);
  });
  syncMotion();
})();
