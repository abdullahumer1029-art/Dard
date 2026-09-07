  // ---- Welcome confetti burst: falls from across the top edge on page load ----
  // Modeled on an actual screen recording of a competitor's site: confetti
  // spawns spread across the FULL top width (not just two corners), falls
  // with gravity plus a gentle sideways drift and tumble, and is fully faded
  // by roughly 1.5s in. There's also a short beat of nothing before it starts.
  // Built from plain positioned divs + a CSS keyframe (not canvas/rAF), since
  // rAF-driven canvas animation is unreliable to both throttling in inactive
  // tabs and, separately, to being drawn on the very first paint. Real DOM
  // elements animated by CSS render immediately and don't depend on a JS loop.
  // Waits for the full 'load' event so it fires once the page is visually
  // settled, not while photos are still streaming in.
  (function(){
    const DURATION = 1500; // ms, must match the CSS animation-duration set below

    function fireConfetti(){
      const colors = ['#b3392b', '#d1614a', '#8f2c20', '#1e1310', '#e0a45a'];
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:9999;';
      document.body.appendChild(container);

      const COUNT = 80;
      for (let i = 0; i < COUNT; i++){
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        const size = 5 + Math.random() * 6;
        const isCircle = Math.random() > 0.5;
        el.style.width = size + 'px';
        el.style.height = (isCircle ? size : size * 0.55) + 'px';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.borderRadius = isCircle ? '50%' : '2px';
        el.style.animationDuration = DURATION + 'ms';
        el.style.animationDelay = (Math.random() * 120) + 'ms'; // slight stagger, not instant en masse

        const onLeft = i % 2 === 0; // half from the left side, half from the right
        const dirX = onLeft ? 1 : -1; // drift inward, away from its own edge
        const originXvw = onLeft ? Math.random() * 12 : 100 - Math.random() * 12;
        el.style.setProperty('--x0', '0vw');
        el.style.setProperty('--y0', '0vh');
        el.style.setProperty('--xm', (dirX * (8 + Math.random() * 14)) + 'vw');
        el.style.setProperty('--ym', (28 + Math.random() * 18) + 'vh');
        el.style.setProperty('--x1', (dirX * (14 + Math.random() * 26)) + 'vw');
        el.style.setProperty('--y1', (58 + Math.random() * 22) + 'vh');
        el.style.setProperty('--rm', (Math.random() * 300) + 'deg');
        el.style.setProperty('--r1', (280 + Math.random() * 420) + 'deg');
        el.style.left = originXvw + 'vw';
        el.style.top = '0';

        container.appendChild(el);
      }

      setTimeout(function(){ container.remove(); }, DURATION + 250);
    }

    if (document.readyState === 'complete') {
      setTimeout(fireConfetti, 350);
    } else {
      window.addEventListener('load', function(){ setTimeout(fireConfetti, 350); });
    }
  })();

  // ---- Countdown: fixed per-visitor deadline (not a fake reset-on-reload timer) ----
  // First visit sets a real deadline N hours out, stored in localStorage, so the
  // clock is honest — it keeps counting down across refreshes instead of resetting.
  (function(){
    const COUNTDOWN_HOURS = 12;
    const KEY = 'chefbyte_offer_deadline';
    let deadline = parseInt(localStorage.getItem(KEY) || '0', 10);
    if (!deadline || deadline < Date.now()) {
      deadline = Date.now() + COUNTDOWN_HOURS * 3600 * 1000;
      localStorage.setItem(KEY, String(deadline));
    }
    function pad(n){return n.toString().padStart(2,'0');}
    function tick(){
      const remaining = Math.max(0, deadline - Date.now());
      const h = Math.floor(remaining/3600000);
      const m = Math.floor((remaining%3600000)/60000);
      const s = Math.floor((remaining%60000)/1000);
      const eh = document.getElementById('cd-h'), em = document.getElementById('cd-m'), es = document.getElementById('cd-s');
      if(eh){eh.textContent = pad(h); em.textContent = pad(m); es.textContent = pad(s);}
    }
    tick();
    setInterval(tick, 1000);
  })();

  // ---- Hero cover gallery: thumbnail clicks, desktop prev/next arrows on
  // the big picture itself, and — on mobile, where there are no arrows —
  // swiping the picture left/right to move to the next/previous image. ----
  (function(){
    const thumbs = Array.from(document.querySelectorAll('.cover-thumb'));
    const shot = document.getElementById('heroCoverShot');
    const img = document.getElementById('heroCoverImg');
    const leftArrow = document.getElementById('coverArrowLeft');
    const rightArrow = document.getElementById('coverArrowRight');
    const frame = document.querySelector('.device-frame');
    if(!thumbs.length || !shot || !img) return;

    let current = Math.max(0, thumbs.findIndex(t => t.classList.contains('active')));

    function activate(index, slideDir){
      const len = thumbs.length;
      index = ((index % len) + len) % len; // wrap around at either end
      current = index;
      const btn = thumbs[index];

      thumbs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      if (typeof btn.scrollIntoView === 'function') {
        btn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      }

      shot.classList.remove('ph');
      shot.removeAttribute('data-label');
      img.style.display = '';
      img.src = btn.getAttribute('data-src');
      img.onerror = function(){
        this.style.display='none';
        shot.classList.add('ph');
        shot.setAttribute('data-label', btn.getAttribute('data-label'));
      };

      if (slideDir) {
        img.classList.remove('slide-next', 'slide-prev');
        void img.offsetWidth; // restart the animation even on repeat taps
        img.classList.add(slideDir === 'next' ? 'slide-next' : 'slide-prev');
      }
    }

    thumbs.forEach((btn, i) => {
      btn.addEventListener('click', () => activate(i));
    });

    if (leftArrow) leftArrow.addEventListener('click', () => activate(current - 1, 'prev'));
    if (rightArrow) rightArrow.addEventListener('click', () => activate(current + 1, 'next'));

    // Mobile: swipe the picture itself (no arrows shown there — see CSS).
    if (frame) {
      let startX = 0, startY = 0, tracking = false;
      frame.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
      }, { passive: true });
      frame.addEventListener('touchend', (e) => {
        if (!tracking) return;
        tracking = false;
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        const SWIPE_THRESHOLD = 40;
        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.3) {
          if (dx < 0) activate(current + 1, 'next');
          else activate(current - 1, 'prev');
        }
      }, { passive: true });
    }
  })();

  // ---- Trust icon popups: Instant Download / Any Device / 14-Day Guarantee ----
  // Copy here is pulled straight from what's already stated elsewhere on the
  // page (FAQ + guarantee section) — nothing new is being claimed.
  (function(){
    const overlay = document.getElementById('trustModalOverlay');
    const closeBtn = document.getElementById('trustModalClose');
    const iconEl = document.getElementById('trustModalIcon');
    const titleEl = document.getElementById('trustModalTitle');
    const descEl = document.getElementById('trustModalDesc');
    const triggers = document.querySelectorAll('[data-trust]');
    if(!overlay || !triggers.length) return;

    const content = {
      'instant-download': {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16"/></svg>',
        title: 'Instant Download',
        desc: "It's a digital PDF cookbook. After checkout you'll get an instant download link by email — no waiting, no shipping."
      },
      'any-device': {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="10.5" y1="18" x2="13.5" y2="18"/></svg>',
        title: 'Any Device',
        desc: 'Read it on your phone, tablet, or laptop — or print any page at home. No app or account needed.'
      },
      'guarantee': {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z"/></svg>',
        title: '14-Day Guarantee',
        desc: "Cook from it for two weeks. If your evenings don't feel easier, email us and we'll refund you in full — no forms, no explanation required."
      }
    };

    let lastFocused = null;

    function openModal(key){
      const item = content[key];
      if(!item) return;
      iconEl.innerHTML = item.icon;
      titleEl.textContent = item.title;
      descEl.textContent = item.desc;
      lastFocused = document.activeElement;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function closeModal(){
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      if(lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    triggers.forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.getAttribute('data-trust')));
    });
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if(e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });
  })();

  // ---- Scroll reveal ----
  // NOTE: elements near the very bottom of the page (e.g. the final CTA,
  // just above a short footer) can fail to ever satisfy a negative bottom
  // rootMargin, because the page can't scroll far enough for them to
  // "clear" that margin. That left the closing CTA permanently invisible
  // on real devices. Fix: rootMargin no longer eats into the bottom of
  // the viewport, plus a safety net that force-reveals anything left
  // once the user reaches the bottom of the page.
  (function(){
    const els = document.querySelectorAll('.reveal');
    if(!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px 0px 0px' });
    els.forEach(el => obs.observe(el));

    function revealAtBottom(){
      const scrolledToBottom = (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 4);
      if(scrolledToBottom){
        document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible'));
      }
    }
    window.addEventListener('scroll', revealAtBottom, { passive: true });
    window.addEventListener('resize', revealAtBottom);
  })();

  // ---- Sticky mobile CTA: appears once the hero CTA scrolls out of view ----
  (function(){
    const stickyBar = document.querySelector('.sticky-cta');
    const heroCta = document.querySelector('.hero .btn-primary');
    if(!stickyBar || !heroCta) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => stickyBar.classList.toggle('show', !e.isIntersecting));
    }, { threshold: 0 });
    obs.observe(heroCta);
  })();

