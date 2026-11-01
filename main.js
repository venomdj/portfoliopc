/* ============================================================
   ARYAN VERMA — Developer Portfolio
   Main JavaScript — Vanilla JS + GSAP
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   1. PAGE LOADER
───────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  setTimeout(() => {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        loader.style.display = 'none';
        document.body.style.overflow = '';
        initHeroAnimations();
      }
    });
  }, 1200);
});

/* ─────────────────────────────────────────
   2. CUSTOM CURSOR
───────────────────────────────────────── */
(function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    document.body.style.cursor = 'auto';
    document.querySelectorAll('*').forEach(el => {
      if (getComputedStyle(el).cursor === 'none') {
        el.style.cursor = 'auto';
      }
    });
    return;
  }

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    raf = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  const interactiveEls = 'a, button, .filter-btn, .nav-link, .project-card, .team-card, .achievement-card, input, textarea, .social-icon-btn, .contact-social-link, .footer-social-btn';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveEls)) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveEls)) {
      document.body.classList.remove('cursor-hover');
    }
  });
})();

/* ─────────────────────────────────────────
   3. SCROLL PROGRESS BAR
───────────────────────────────────────── */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

/* ─────────────────────────────────────────
   4. NAVBAR
───────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Scroll state
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Active link via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, observerOptions);

  sections.forEach(s => sectionObserver.observe(s));

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = document.getElementById('navbar').offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobile-menu');
        const hamburger = document.querySelector('.hamburger');
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
          hamburger && hamburger.classList.remove('active');
          document.body.classList.remove('menu-open');
        }
      }
    });
  });
})();

/* ─────────────────────────────────────────
   5. HAMBURGER / MOBILE MENU
───────────────────────────────────────── */
(function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });
})();

/* ─────────────────────────────────────────
   6. HERO ANIMATIONS (GSAP)
───────────────────────────────────────── */
function initHeroAnimations() {
  // Register ScrollTrigger if available
  if (typeof gsap === 'undefined') return;

  // Hero content stagger reveal
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTl
    .from('.hero-badge', { opacity: 0, y: 30, duration: 0.7 })
    .from('.hero-headline .line', { opacity: 0, y: 60, stagger: 0.12, duration: 0.8 }, '-=0.3')
    .from('.hero-tagline', { opacity: 0, y: 30, duration: 0.7 }, '-=0.4')
    .from('.hero-ctas', { opacity: 0, y: 30, duration: 0.7 }, '-=0.4')
    .from('.hero-meta', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
    .from('.hero-avatar-wrap', { opacity: 0, scale: 0.8, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.7')
    .from('.hero-stat-card', { opacity: 0, scale: 0.7, stagger: 0.12, duration: 0.6, ease: 'back.out(1.6)' }, '-=0.4')
    .from('.hero-scroll-indicator', { opacity: 0, y: 20, duration: 0.6 }, '-=0.2');

  // Hero parallax on mouse move
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const { left, top, width, height } = heroSection.getBoundingClientRect();
      const xPct = ((e.clientX - left) / width - 0.5) * 2;
      const yPct = ((e.clientY - top) / height - 0.5) * 2;

      gsap.to('.hero-headline', { x: xPct * 12, y: yPct * 6, duration: 0.8, ease: 'power2.out' });
      gsap.to('.hero-avatar-wrap', { x: -xPct * 16, y: -yPct * 8, duration: 0.8, ease: 'power2.out' });
      gsap.to('.hero-bg-text', { x: xPct * 30, y: yPct * 10, duration: 1.2, ease: 'power2.out' });
    });
    heroSection.addEventListener('mouseleave', () => {
      gsap.to('.hero-headline, .hero-avatar-wrap, .hero-bg-text', { x: 0, y: 0, duration: 0.8, ease: 'power2.out' });
    });
  }

  // ScrollTrigger for sections
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initScrollTriggerAnimations();
  }
}

/* ─────────────────────────────────────────
   7. SCROLL TRIGGER ANIMATIONS
───────────────────────────────────────── */
function initScrollTriggerAnimations() {
  // Generic reveal elements
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    });
  });

  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      x: -50,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    });
  });

  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      x: 50,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Skills section — category cards stagger
  gsap.from('.skill-category', {
    opacity: 0,
    y: 60,
    stagger: 0.15,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.skills-categories',
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });

  // Project cards stagger
  gsap.from('.project-card', {
    opacity: 0,
    y: 50,
    stagger: 0.1,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.projects-grid',
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });

  // Team cards stagger
  gsap.from('.team-card', {
    opacity: 0,
    y: 50,
    scale: 0.95,
    stagger: 0.12,
    duration: 0.7,
    ease: 'back.out(1.2)',
    scrollTrigger: {
      trigger: '.team-cards',
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });

  // Achievement cards
  gsap.from('.achievement-card', {
    opacity: 0,
    x: -30,
    stagger: 0.1,
    duration: 0.6,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.achievements-grid',
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });

  // Timeline items
  gsap.from('.timeline-item', {
    opacity: 0,
    x: -40,
    stagger: 0.15,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.timeline',
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });

  // Section headings dramatic reveal
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Contact form section
  gsap.from('.contact-form-wrap', {
    opacity: 0,
    y: 60,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.contact-form-wrap',
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });

  gsap.from('.contact-info', {
    opacity: 0,
    x: -50,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.contact-info',
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });
}

/* ─────────────────────────────────────────
   8. SKILL PROGRESS BARS (IntersectionObserver)
───────────────────────────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const target = bar.dataset.width || '0';
        // Delay slightly for stagger effect
        const index = Array.from(bars).indexOf(bar);
        setTimeout(() => {
          bar.style.width = target + '%';
        }, index * 80);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.1 });

  bars.forEach(bar => observer.observe(bar));
})();

/* ─────────────────────────────────────────
   9. ANIMATED COUNTING NUMBERS
───────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ─────────────────────────────────────────
   10. MAGNETIC BUTTON EFFECT
───────────────────────────────────────── */
(function initMagneticButtons() {
  const magneticBtns = document.querySelectorAll('.btn, .nav-cta');

  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.3;
      const dy = (e.clientY - cy) * 0.3;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ─────────────────────────────────────────
   11. PROJECT FILTERING
───────────────────────────────────────── */
(function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projectCards.forEach((card, i) => {
        const categories = (card.dataset.categories || '').split(',').map(c => c.trim());
        const show = filter === 'all' || categories.includes(filter);

        if (show) {
          card.classList.remove('hidden');
          // Stagger reveal with GSAP if available
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(card,
              { opacity: 0, y: 20, scale: 0.97 },
              { opacity: 1, y: 0, scale: 1, duration: 0.4, delay: i * 0.05, ease: 'power2.out' }
            );
          }
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ─────────────────────────────────────────
   12. CONTACT FORM VALIDATION
───────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successMsg = document.getElementById('form-success');
  const formContent = document.getElementById('form-content');

  function getField(id) {
    return document.getElementById(id);
  }

  function showError(field, msgId, message) {
    field.classList.add('error');
    const errEl = document.getElementById(msgId);
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add('show');
    }
  }

  function clearError(field, msgId) {
    field.classList.remove('error');
    const errEl = document.getElementById(msgId);
    if (errEl) errEl.classList.remove('show');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Real-time validation clear
  ['cf-name', 'cf-email', 'cf-subject', 'cf-message'].forEach(id => {
    const el = getField(id);
    if (!el) return;
    el.addEventListener('input', () => {
      if (el.value.trim()) {
        clearError(el, id + '-error');
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name = getField('cf-name');
    const email = getField('cf-email');
    const subject = getField('cf-subject');
    const message = getField('cf-message');

    // Clear previous errors
    ['cf-name', 'cf-email', 'cf-subject', 'cf-message'].forEach(id => {
      const el = getField(id);
      if (el) clearError(el, id + '-error');
    });

    // Validate name
    if (!name || name.value.trim().length < 2) {
      showError(name, 'cf-name-error', 'Please enter your full name (at least 2 characters).');
      valid = false;
    }

    // Validate email
    if (!email || !validateEmail(email.value.trim())) {
      showError(email, 'cf-email-error', 'Please enter a valid email address.');
      valid = false;
    }

    // Validate subject
    if (!subject || subject.value.trim().length < 3) {
      showError(subject, 'cf-subject-error', 'Please enter a subject (at least 3 characters).');
      valid = false;
    }

    // Validate message
    if (!message || message.value.trim().length < 10) {
      showError(message, 'cf-message-error', 'Please enter a message (at least 10 characters).');
      valid = false;
    }

    if (valid) {
      // Simulate sending
      const submitBtn = form.querySelector('.form-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          Sending...
        `;
        // Add spin animation
        const spinIcon = submitBtn.querySelector('.spin-icon');
        if (spinIcon) spinIcon.style.animation = 'spin 1s linear infinite';
      }

      setTimeout(() => {
        if (formContent) formContent.style.display = 'none';
        if (successMsg) {
          successMsg.classList.add('show');
          if (typeof gsap !== 'undefined') {
            gsap.from(successMsg.children, {
              opacity: 0,
              y: 20,
              stagger: 0.1,
              duration: 0.5,
              ease: 'power2.out'
            });
          }
        }
      }, 1800);
    }
  });
})();

/* ─────────────────────────────────────────
   13. LUCIDE ICONS INITIALIZATION
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

/* ─────────────────────────────────────────
   14. PARTICLES BACKGROUND
───────────────────────────────────────── */
(function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  const particleData = [
    { size: 8, x: 10, y: 20, color: '#C8FF00', duration: 5, delay: 0 },
    { size: 5, x: 85, y: 15, color: '#FF6B35', duration: 4, delay: 1 },
    { size: 12, x: 70, y: 70, color: '#C8FF00', duration: 6, delay: 0.5 },
    { size: 6, x: 20, y: 80, color: '#FF6B35', duration: 5, delay: 2 },
    { size: 4, x: 50, y: 10, color: '#C8FF00', duration: 7, delay: 0.3 },
    { size: 9, x: 90, y: 55, color: '#FF6B35', duration: 4.5, delay: 1.5 },
    { size: 5, x: 30, y: 50, color: '#C8FF00', duration: 6.5, delay: 0.8 },
    { size: 7, x: 60, y: 90, color: '#FF6B35', duration: 5.5, delay: 2.5 },
  ];

  particleData.forEach(p => {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
      width: ${p.size}px;
      height: ${p.size}px;
      left: ${p.x}%;
      top: ${p.y}%;
      background: ${p.color};
      --duration: ${p.duration}s;
      --delay: ${p.delay}s;
    `;
    container.appendChild(el);
  });
})();

/* ─────────────────────────────────────────
   15. GSAP MARQUEE PAUSE ON HOVER
───────────────────────────────────────── */
(function initMarquee() {
  const strip = document.querySelector('.marquee-strip');
  if (!strip) return;
  strip.addEventListener('mouseenter', () => {
    strip.querySelectorAll('.marquee-track').forEach(t => t.style.animationPlayState = 'paused');
  });
  strip.addEventListener('mouseleave', () => {
    strip.querySelectorAll('.marquee-track').forEach(t => t.style.animationPlayState = 'running');
  });
})();

/* ─────────────────────────────────────────
   16. FOOTER YEAR
───────────────────────────────────────── */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─────────────────────────────────────────
   17. GSAP + ScrollTrigger REGISTER (if loaded)
───────────────────────────────────────── */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* Prevent cursor flicker on page hide */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (dot) dot.style.opacity = '0';
    if (ring) ring.style.opacity = '0';
  } else {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (dot) dot.style.opacity = '1';
    if (ring) ring.style.opacity = '1';
  }
});
