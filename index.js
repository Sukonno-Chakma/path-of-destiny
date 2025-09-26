// index.js (drop-in)
(() => {
  const bg1 = document.getElementById('bg1');
  const bg2 = document.getElementById('bg2');
  if (!bg1 || !bg2) return;

  const layers = [bg1, bg2];
  let active = 0;

  function setBackground(url, scrim) {
    const next = 1 - active;
    layers[next].style.backgroundImage = `url(${url})`;
    layers[next].style.opacity = '1';
    // allow per-section scrim intensity, fallback to default (.45)
    document.documentElement.style.setProperty('--scrim', scrim || '0.45');
    layers[active].style.opacity = '0';
    active = next;
  }

  // Observe all sections with data-bg
  let sections = Array.from(document.querySelectorAll('[data-bg]'));

  // Start with the first section's bg
  const initial = sections[0]?.getAttribute('data-bg');
  const initialScrim = sections[0]?.getAttribute('data-scrim') || '0.45';
  if (initial) {
    layers[active].style.backgroundImage = `url(${initial})`;
    layers[active].style.opacity = '1';
    document.documentElement.style.setProperty('--scrim', initialScrim);
  }

  // More permissive thresholds so big/small sections still trigger
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bg = entry.target.getAttribute('data-bg');
        const scrim = entry.target.getAttribute('data-scrim') || '0.45';
        if (bg) setBackground(bg, scrim);
      }
    });
  }, {
    // Trigger when ~25% of a section is visible, with a slight bottom margin
    threshold: 0.25,
    rootMargin: '0px 0px -15% 0px'
  });

  sections.forEach(sec => io.observe(sec));

  // Reconnect on resize/content changes (e.g., you add more cards)
  let ro;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => {
      io.disconnect();
      sections = Array.from(document.querySelectorAll('[data-bg]'));
      sections.forEach(sec => io.observe(sec));
    });
    sections.forEach(sec => ro.observe(sec));
  }

  // Safety: when user lands on an anchor mid-page
  window.addEventListener('load', () => {
    const current = sections.find(sec => {
      const rect = sec.getBoundingClientRect();
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      return rect.top < vh * 0.75 && rect.bottom > vh * 0.25;
    });
    if (current) {
      const bg = current.getAttribute('data-bg');
      const scrim = current.getAttribute('data-scrim') || '0.45';
      if (bg) setBackground(bg, scrim);
    }
  }, { once: true });
})();
