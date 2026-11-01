/* Shivam Pandey — portfolio behaviour.
   Dependency-free motion engine: one scroll loop, one IntersectionObserver per concern, no duplicate init.
   Every effect respects prefers-reduced-motion; pointer effects only run on fine pointers. */
(() => {
  'use strict';
  if (window.__pfBooted) return;
  window.__pfBooted = true;

  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const safe = fn => { try { return fn(); } catch (e) { return null; } };
  root.classList.add('booted');

  /* ---------- text splitting ---------- */
  function splitChars(el, cls = 'ch') {
    let i = 0;
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach(c => {
      const s = document.createElement('span');
      s.className = cls; s.style.setProperty('--i', i++); s.textContent = c;
      el.append(s);
    });
  }
  /* words wrapped in masks, characters inside — keeps the space between words */
  function splitNameChars(el, cls) {
    const words = el.textContent.trim().split(/\s+/);
    let i = 0;
    el.textContent = '';
    words.forEach((w, wi) => {
      const wrap = document.createElement('span'); wrap.className = 'ld-w';
      [...w].forEach(c => {
        const s = document.createElement('span');
        s.className = cls; s.style.setProperty('--i', i++); s.textContent = c;
        wrap.append(s);
      });
      el.append(wrap);
      if (wi < words.length - 1) el.append(' ');
    });
  }
  function splitWords(el, cls, inner) {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = cls;
          if (inner) { const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++); w.append(s); }
          else w.textContent = part;
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
    return i;
  }
  $$('.hero h1 .ln').forEach(l => splitChars(l));
  $$('[data-split]').forEach(h => { h.setAttribute('aria-label', h.textContent.trim().replace(/\s+/g, ' ')); splitWords(h, 'sw', true); $$('.sw', h).forEach(w => w.setAttribute('aria-hidden', 'true')); });
  const statement = $('[data-scrub]');
  if (statement) splitWords(statement, 'w', false);
  const sWords = statement ? $$('.w', statement) : [];
  const wordmark = $('.wordmark');
  if (wordmark) {
    const lines = wordmark.innerHTML.split(/<br\s*\/?>/i).map(t => t.trim()).filter(Boolean);
    wordmark.textContent = '';
    lines.forEach(t => {
      const ln = document.createElement('span'); ln.className = 'ln'; ln.textContent = t;
      wordmark.append(ln); splitChars(ln, 'wc');
    });
  }
  $$('.stats .stat').forEach((s, i) => s.style.setProperty('--i', i));
  $$('.menu li').forEach((li, i) => li.style.setProperty('--i', i));

  /* ---------- hero: coordinated entrance ---------- */
  let heroStarted = false;
  let wordTimer = 0;
  function startHero() {
    if (heroStarted) return; heroStarted = true;
    $$('.h-up').forEach((el, i) => el.style.setProperty('--d', (0.62 + i * 0.12) + 's'));
    root.classList.add('ready');
    startWords();
  }
  function startWords() {
    const items = $$('.words b');
    if (!items.length) return;
    let idx = 0;
    items[0].classList.add('on');
    if (reduced || items.length < 2) return;
    const tick = () => {
      const prev = items[idx]; idx = (idx + 1) % items.length;
      prev.classList.remove('on'); prev.classList.add('out');
      items[idx].classList.add('on');
      setTimeout(() => prev.classList.remove('out'), 900);
    };
    const run = () => { clearInterval(wordTimer); wordTimer = setInterval(tick, 2400); };
    run();
    document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(wordTimer) : run());
  }

  /* ---------- loader (cannot get stuck: hard timeout) ---------- */
  const loader = $('#loader');
  const ldNum = $('#ldNum');
  const seen = false; /* intro plays on every load; any click/key/scroll skips it */
  let loaderDone = false;
  function finishLoader() {
    if (loaderDone) return; loaderDone = true;
    safe(() => sessionStorage.setItem('pf-seen', '1'));
    document.body.classList.remove('lock');
    if (loader) {
      loader.classList.add('done');
      const kill = () => loader.remove();
      loader.addEventListener('animationend', kill, { once: true });
      setTimeout(kill, 1400);
    }
    setTimeout(startHero, loader ? 120 : 0);
  }
  function runLoader() {
    if (!loader || reduced || seen) { if (loader) loader.remove(); finishLoader(); return; }
    document.body.classList.add('lock');
    const nameEl = $('.ld-name', loader);
    if (nameEl) splitNameChars(nameEl, 'lc');
    loader.classList.add('split');
    let assetsReady = false, skip = false;
    /* any deliberate input skips the wait — visitors are never held back */
    const skipEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    const onSkip = () => { skip = true; };
    skipEvents.forEach(ev => addEventListener(ev, onSkip, { passive: true, once: true }));
    const img = $('.hb-img');
    Promise.all([
      document.fonts && document.fonts.ready,
      img && img.decode ? img.decode().catch(() => {}) : null
    ]).then(() => { assetsReady = true; });
    const t0 = performance.now(), MIN = 2500;
    const step = now => {
      if (loaderDone) return;
      const t = clamp((now - t0) / MIN, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const p = skip ? 1 : assetsReady ? eased : Math.min(eased, .92);
      loader.style.setProperty('--p', p.toFixed(3));
      if (ldNum) ldNum.textContent = String(Math.round(p * 100)).padStart(3, '0');
      if (p >= 1) { skipEvents.forEach(ev => removeEventListener(ev, onSkip)); return setTimeout(finishLoader, skip ? 0 : 120); }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    setTimeout(finishLoader, 5200);
  }

  /* ---------- clock ---------- */
  const clock = $('#clock');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick(); setInterval(tick, 30000);
  }

  /* ---------- nav: indicator, scroll-spy, hide-on-scroll, menu ---------- */
  const top = $('#top'), nav = $('.nav'), ind = $('.nav .ind');
  const navLinks = $$('.nav a[data-spy]');
  let activeLink = null;
  let hoverLink = null;
  function placeInd() {
    if (!ind) return;
    const t = hoverLink || activeLink;
    if (!t) { ind.style.opacity = 0; return; }
    ind.style.opacity = 1;
    ind.style.width = t.offsetWidth + 'px';
    ind.style.translate = (t.offsetLeft) + 'px 0';
  }
  const setHover = a => {
    if (a === hoverLink) return;
    hoverLink = a;
    nav && nav.classList.toggle('hov', !!a);
    navLinks.forEach(l => l.classList.toggle('hv', l === a));
    placeInd();
  };
  if (nav) {
    navLinks.forEach(a => {
      a.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') setHover(a); });
      a.addEventListener('focus', () => { if (a.matches(':focus-visible')) setHover(a); });
      a.addEventListener('blur', () => setHover(null));
    });
    nav.addEventListener('pointerleave', () => setHover(null));
  }
  const visibleSections = new Set();
  const spyEls = navLinks.map(a => document.getElementById(a.dataset.spy)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(es => {
      es.forEach(e => e.isIntersecting ? visibleSections.add(e.target.id) : visibleSections.delete(e.target.id));
      const cur = [...spyEls].reverse().find(s => visibleSections.has(s.id));
      activeLink = cur ? navLinks.find(a => a.dataset.spy === cur.id) : null;
      navLinks.forEach(a => { const on = a === activeLink; a.classList.toggle('active', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
      placeInd();
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyEls.forEach(s => spy.observe(s));
  }

  const burger = $('#burger'), menu = $('#menu');
  let menuOpen = false, lastFocus = null, menuTimer = 0;
  function setMenu(open) {
    if (!menu || open === menuOpen) return;
    menuOpen = open;
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    clearTimeout(menuTimer);
    if (open) {
      lastFocus = document.activeElement;
      menu.hidden = false; void menu.offsetWidth;
      menu.classList.add('open');
      document.body.classList.add('lock');
      top.classList.remove('hide');
      const first = $('a', menu); first && setTimeout(() => first.focus({ preventScroll: true }), 50);
    } else {
      menu.classList.remove('open');
      document.body.classList.remove('lock');
      menuTimer = setTimeout(() => { menu.hidden = true; }, reduced ? 0 : 850);
      lastFocus && lastFocus.focus && burger.focus({ preventScroll: true });
    }
  }
  if (burger && menu) {
    burger.addEventListener('click', () => setMenu(!menuOpen));
    $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => {
      if (!menuOpen) return;
      if (e.key === 'Escape') return setMenu(false);
      if (e.key === 'Tab') {
        const f = [burger, ...$$('a', menu)];
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
  }
  matchMedia('(min-width: 861px)').addEventListener('change', e => e.matches && setMenu(false));

  /* ---------- reveals (once) ---------- */
  const revealEls = $$('[data-reveal], [data-split], .card, .wordmark');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else revealEls.forEach(el => el.classList.add('in'));

  /* ---------- counters ---------- */
  const nums = $$('.num[data-count]');
  const fmtNum = (el, v) => { const d = +el.dataset.dec; el.textContent = el.dataset.pre + v.toFixed(d) + el.dataset.suf; };
  if (nums.length && 'IntersectionObserver' in window && !reduced) {
    nums.forEach(n => fmtNum(n, 0));
    const co = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, t0 = performance.now(), D = 1600;
      const step = now => {
        const t = clamp((now - t0) / D, 0, 1);
        fmtNum(el, end * (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: .6 });
    nums.forEach(n => co.observe(n));
  }

  /* ---------- scroll loop: progress, rail, statement scrub, parallax, bar ---------- */
  const progress = $('#progress'), rail = $('#railFill'), steps = $('#steps');
  const para = reduced ? [] : $$('[data-parallax]');
  const heroBg = $('.hero-bg');
  /* recognition: rail fill, lit dots, focus blur */
  const winList = $('.win-list'), wins = $$('.win');
  function winFx(vh) {
    if (!winList || !wins.length) return;
    if (reduced) { winList.style.setProperty('--p', 1); wins.forEach(w => w.classList.add('lit')); return; }
    const lr = winList.getBoundingClientRect();
    if (lr.bottom < -vh * .5 || lr.top > vh * 1.5) return;
    const fy = vh * .5;
    winList.style.setProperty('--p', clamp((fy - lr.top) / lr.height, 0, 1).toFixed(4));
    let best = null, bd = Infinity;
    wins.forEach(w => {
      const r = w.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - fy);
      w.style.setProperty('--f', clamp((d - r.height * .5) / (vh * .38), 0, 1).toFixed(2));
      w.classList.toggle('lit', r.top + 36 < fy);
      if (d < bd) { bd = d; best = w; }
    });
    wins.forEach(w => w.classList.toggle('on', w === best && bd < vh * .35));
  }
  let lastY = scrollY, ticking = false;
  function onScroll() {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const max = root.scrollHeight - vh;
    progress && progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    root.classList.toggle('scrolled', y > 80);
    if (top) {
      top.classList.toggle('solid', y > 20);
    }
    lastY = y;
    if (heroBg && !reduced) heroBg.style.setProperty('--hs', clamp(y / (vh * .9), 0, 1).toFixed(3));
    if (steps && rail) {
      const r = steps.getBoundingClientRect();
      rail.style.setProperty('--p', clamp((vh * .62 - r.top) / r.height, 0, 1).toFixed(4));
    }
    winFx(vh);
    if (sWords.length && !reduced) {
      const r = statement.getBoundingClientRect();
      const p = clamp((vh * .88 - r.top) / (r.height + vh * .38), 0, 1);
      const n = Math.round(p * sWords.length * 1.04);
      sWords.forEach((w, i) => w.classList.toggle('on', i < n));
    }
    para.forEach(img => {
      const box = img.parentElement.getBoundingClientRect();
      if (box.bottom < -50 || box.top > vh + 50) return;
      const off = box.top + box.height / 2 - vh / 2;
      const m = box.height * .045;
      img.style.setProperty('--py', clamp(-off * .035, -m, m).toFixed(1) + 'px');
    });
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', () => { req(); placeInd(); }, { passive: true });
  onScroll();

  /* ---------- contact: glass sheen follows the pointer ---------- */
  const glassForm = $('.c-form');
  if (glassForm && fine && !reduced) {
    glassForm.addEventListener('pointermove', e => {
      const r = glassForm.getBoundingClientRect();
      glassForm.style.setProperty('--gx', (e.clientX - r.left).toFixed(0) + 'px');
      glassForm.style.setProperty('--gy', (e.clientY - r.top).toFixed(0) + 'px');
      glassForm.classList.add('spot');
    }, { passive: true });
    glassForm.addEventListener('pointerleave', () => glassForm.classList.remove('spot'));
  }

  /* ---------- hero: pointer-reactive depth (fine pointers only) ---------- */
  if (heroBg && !reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const hero = heroBg.parentElement;
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      heroBg.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      heroBg.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { heroBg.style.setProperty('--mx', 0); heroBg.style.setProperty('--my', 0); });
  }

  /* ---------- journey: details toggles ---------- */
  $$('.step .more').forEach(btn => {
    const fold = document.getElementById(btn.getAttribute('aria-controls'));
    const label = $('.more-t', btn);
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open);
      fold.classList.toggle('open', open);
      label.textContent = open ? 'Close' : 'Details';
    });
  });

  /* ---------- faq (single-open accordion) ---------- */
  const qBtns = $$('#faqList .q button');
  qBtns.forEach(b => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    qBtns.forEach(o => { o.setAttribute('aria-expanded', o === b && open); document.getElementById(o.getAttribute('aria-controls')).classList.toggle('open', o === b && open); });
  }));

  /* ---------- projects: filter + last-card spans the row when the count is odd ---------- */
  const cards = $$('.card'), fbs = $$('.filters button');
  const layoutCards = () => {
    const vis = cards.filter(c => !c.hidden);
    cards.forEach(c => c.removeAttribute('data-wide'));
    if (vis.length > 1 && vis.length % 2 === 1) vis[vis.length - 1].setAttribute('data-wide', '');
  };
  layoutCards();
  fbs.forEach(b => b.addEventListener('click', () => {
    fbs.forEach(x => x.setAttribute('aria-pressed', x === b));
    const f = b.dataset.filter;
    cards.forEach(c => { c.hidden = f !== 'all' && !c.dataset.cat.split(' ').includes(f); });
    layoutCards(); req();
  }));

  /* ---------- project cards: cursor spotlight ---------- */
  if (!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    cards.forEach(c => c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
    }, { passive: true }));
  }

  /* ---------- pointer effects (fine pointers only) ---------- */
  if (fine && !reduced) {
    const bubble = document.createElement('div');
    bubble.className = 'cursor'; bubble.setAttribute('aria-hidden', 'true');
    document.body.append(bubble);
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, shown = false;
    const loop = () => {
      cx += (tx - cx) * .2; cy += (ty - cy) * .2;
      bubble.style.translate = cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px';
      raf = shown || Math.abs(tx - cx) > .5 || Math.abs(ty - cy) > .5 ? requestAnimationFrame(loop) : 0;
    };
    $$('.media[data-cursor]').forEach(m => {
      m.addEventListener('mouseenter', e => { bubble.textContent = m.dataset.cursor; tx = cx = e.clientX; ty = cy = e.clientY; shown = true; bubble.classList.add('show'); if (!raf) raf = requestAnimationFrame(loop); });
      m.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
      m.addEventListener('mouseleave', () => { shown = false; bubble.classList.remove('show'); });
    });
    addEventListener('scroll', () => { if (shown) { shown = false; bubble.classList.remove('show'); } }, { passive: true });

    $$('[data-magnet]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.translate = ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + 'px';
      });
      el.addEventListener('mouseleave', () => { el.style.translate = ''; });
    });
  }

  /* ---------- contact: validated mailto flow + copy ---------- */
  const TO = 'shivam.pandey@example.com';
  const form = $('#contactForm'), ok = $('#formOk'), bad = $('#formBad');
  if (form) {
    const rules = {
      name: v => v.trim().length >= 2 || 'Please enter your name.',
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email.',
      subject: v => v.trim().length >= 3 || 'Please add a subject.',
      message: v => v.trim().length >= 10 || 'Message should be at least 10 characters.'
    };
    const check = el => {
      const r = rules[el.name](el.value), f = el.closest('.f');
      f.classList.toggle('bad', r !== true);
      $('.err', f).textContent = r === true ? '' : r;
      el.setAttribute('aria-invalid', r !== true);
      return r === true;
    };
    const fields = $$('input,textarea', form);
    fields.forEach(el => el.addEventListener('blur', () => check(el)));
    form.addEventListener('submit', e => {
      e.preventDefault(); ok.hidden = bad.hidden = true;
      if (!fields.map(check).every(Boolean)) {
        bad.textContent = 'Please fix the highlighted fields.'; bad.hidden = false;
        fields.find(f => f.getAttribute('aria-invalid') === 'true').focus(); return;
      }
      const d = Object.fromEntries(new FormData(form));
      location.href = `mailto:${TO}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(`${d.message}\n\n— ${d.name} (${d.email})`)}`;
      ok.hidden = false; form.reset();
    });
  }
  const copyBtn = $('#copyMail');
  if (copyBtn) copyBtn.addEventListener('click', async () => {
    let done = false;
    try { await navigator.clipboard.writeText(TO); done = true; } catch (e) {}
    if (!done) { const s = getSelection(), r = document.createRange(); r.selectNodeContents($('.c-mail')); s.removeAllRanges(); s.addRange(r); }
    copyBtn.textContent = done ? 'Copied ✓' : 'Press Ctrl/⌘ + C';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
  });

  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- boot ---------- */
  runLoader();
})();
