const header = document.getElementById('header');
const toggle = header?.querySelector<HTMLButtonElement>('.header-toggle');
const nav = document.getElementById('primary-nav');

const setMenuOpen = (open: boolean) => {
  if (!header || !toggle) return;
  header.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};

toggle?.addEventListener('click', () => {
  setMenuOpen(!header?.classList.contains('is-open'));
});

// Close the mobile menu after choosing a destination
nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuOpen(false);
});

// Handle hash navigation from non-home pages
document.querySelectorAll<HTMLAnchorElement>('a[data-hash-link]').forEach((link) => {
  link.addEventListener('click', () => {
    const href = link.getAttribute('href');
    if (!href) return;
    const hash = href.split('#')[1];
    if (hash && window.location.pathname !== '/') {
      sessionStorage.setItem('scrollToHash', hash);
    }
  });
});

const scrollToHash = sessionStorage.getItem('scrollToHash');
if (scrollToHash) {
  sessionStorage.removeItem('scrollToHash');

  const scrollToElement = () => {
    const element = document.getElementById(scrollToHash);
    if (element) {
      element.scrollIntoView({ behavior: 'instant' });
      return true;
    }
    return false;
  };

  if (!scrollToElement()) {
    const maxAttempts = 50;
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (scrollToElement() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 100);
  }
}

// Highlight the section currently in view on the home page
const isHomePage = header?.dataset.homePage === 'true';
if (isHomePage && nav) {
  const sectionIds = ['home', 'about', 'projects', 'writing', 'events'] as const;
  const linkBySection = new Map(
    sectionIds.map((id) => [id, nav.querySelector<HTMLAnchorElement>(`a[data-section="${id}"]`)])
  );

  const setActiveSection = (id: string | null) => {
    for (const [sectionId, link] of linkBySection) {
      if (!link) continue;
      const active = sectionId === id;
      link.classList.toggle('active', active);
      if (active) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  };

  const observed = new Map<string, number>();

  const updateFromIntersections = () => {
    let bestId: string | null = null;
    let bestRatio = 0;
    for (const [id, ratio] of observed) {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = id;
      }
    }
    // Near the top of the page, prefer Home even if another section peeks in
    if (window.scrollY < 80) {
      setActiveSection('home');
      return;
    }
    setActiveSection(bestId);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        observed.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      }
      updateFromIntersections();
    },
    {
      root: null,
      // Bias toward the band just below the fixed header
      rootMargin: '-20% 0px -55% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    }
  );

  const watchSections = () => {
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el && !observed.has(id)) {
        observed.set(id, 0);
        observer.observe(el);
      }
    }
  };

  watchSections();
  // Writing/Events hydrate late (client:only); re-scan briefly
  let tries = 0;
  const lateScan = setInterval(() => {
    watchSections();
    tries++;
    if (tries >= 40) clearInterval(lateScan);
  }, 100);

  window.addEventListener('scroll', updateFromIntersections, { passive: true });
}
