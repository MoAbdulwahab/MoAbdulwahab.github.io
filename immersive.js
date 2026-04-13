/* ═══════════════════════════════════════════════════════════════
   IMMERSIVE 3D SCROLL EXPERIENCE
   Three.js hero · GSAP ScrollTrigger · 3D tilt · Parallax depth
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Wait for GSAP + Three.js to be ready ───────────────── */
  function init() {
    setupLenis();
    setupHeroCanvas();
    setupHeroParallax();
    setupScrollAnimations();
    setupCardTilt();
    setupCounters();
    setupDiffItems();
    setupCursorTrail();
  }

  /* ════════════════════════════════════════════════════════════
     1. SMOOTH SCROLL (Lenis-style via GSAP ticker)
  ════════════════════════════════════════════════════════════ */
  function setupLenis() {
    gsap.ticker.lagSmoothing(0);
  }

  /* ════════════════════════════════════════════════════════════
     2. THREE.JS HERO CANVAS — Floating city grid + particles
  ════════════════════════════════════════════════════════════ */
  function setupHeroCanvas() {
    var hero = document.getElementById('hero');
    if (!hero || typeof THREE === 'undefined') return;

    /* Skip Three.js on very small phones to preserve performance */
    if (window.innerWidth < 480) return;

    var isMobile = window.matchMedia('(max-width: 768px)').matches;

    var canvas = document.createElement('canvas');
    canvas.id = 'hero-canvas';
    hero.insertBefore(canvas, hero.firstChild);

    var W = canvas.offsetWidth  = hero.offsetWidth;
    var H = canvas.offsetHeight = hero.offsetHeight;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !isMobile, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.set(0, 0, 40);

    /* ── Grid lines (city skyline feel) ── */
    var gridGeo = new THREE.BufferGeometry();
    var gridVerts = [];
    var size = 80, step = 8;
    for (var i = -size; i <= size; i += step) {
      gridVerts.push(i, -30, -60,  i, 20, -60);
      gridVerts.push(-size, -30 + ((i + size) / (size * 2)) * 50, -60,
                      size, -30 + ((i + size) / (size * 2)) * 50, -60);
    }
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridVerts, 3));
    var gridMat = new THREE.LineBasicMaterial({ color: 0xb89b5e, transparent: true, opacity: 0.08 });
    scene.add(new THREE.LineSegments(gridGeo, gridMat));

    /* ── Particle field (fewer on mobile for performance) ── */
    var pCount = isMobile ? 280 : 900;
    var pPos   = new Float32Array(pCount * 3);
    var pSizes = new Float32Array(pCount);
    for (var p = 0; p < pCount; p++) {
      pPos[p * 3]     = (Math.random() - 0.5) * 200;
      pPos[p * 3 + 1] = (Math.random() - 0.5) * 100;
      pPos[p * 3 + 2] = (Math.random() - 0.5) * 80 - 30;
      pSizes[p]       = Math.random() * 2.4 + 0.4;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
    pGeo.setAttribute('size', new THREE.Float32BufferAttribute(pSizes, 1));

    var pMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uColor:   { value: new THREE.Color(0xb89b5e) },
        uOpacity: { value: 0.55 }
      },
      vertexShader: `
        attribute float size;
        uniform float uTime;
        void main() {
          vec3 p = position;
          p.y += sin(uTime * 0.4 + position.x * 0.05) * 0.6;
          p.x += cos(uTime * 0.3 + position.z * 0.04) * 0.4;
          vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = size * (260.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = (1.0 - d * 2.0) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    /* ── Floating diamond accent shapes ── */
    for (var d = 0; d < 7; d++) {
      var dGeo = new THREE.OctahedronGeometry(Math.random() * 1.2 + 0.4, 0);
      var dMat = new THREE.MeshBasicMaterial({
        color: 0xb89b5e,
        wireframe: true,
        transparent: true,
        opacity: 0.12 + Math.random() * 0.1
      });
      var mesh = new THREE.Mesh(dGeo, dMat);
      mesh.position.set(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40 - 20
      );
      mesh.userData.rotSpeed = { x: (Math.random() - 0.5) * 0.008, y: (Math.random() - 0.5) * 0.012 };
      scene.add(mesh);
    }

    /* ── Mouse parallax ── */
    var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    document.addEventListener('mousemove', function (e) {
      mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    /* ── Scroll fade ── */
    var scrollY = 0;
    window.addEventListener('scroll', function () { scrollY = window.scrollY; }, { passive: true });

    /* ── Resize ── */
    window.addEventListener('resize', function () {
      W = hero.offsetWidth; H = hero.offsetHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    });

    /* ── Animate ── */
    var clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      pMat.uniforms.uTime.value = t;

      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      camera.position.x = mouse.x * 3;
      camera.position.y = -mouse.y * 2;
      camera.lookAt(0, 0, 0);

      /* Rotate diamonds */
      scene.children.forEach(function (obj) {
        if (obj.userData.rotSpeed) {
          obj.rotation.x += obj.userData.rotSpeed.x;
          obj.rotation.y += obj.userData.rotSpeed.y;
        }
      });

      /* Fade out on scroll */
      var fadeEnd = hero.offsetHeight * 0.8;
      var opacity = Math.max(0, 1 - scrollY / fadeEnd);
      renderer.domElement.style.opacity = opacity;

      renderer.render(scene, camera);
    }
    animate();
  }

  /* ════════════════════════════════════════════════════════════
     3. HERO PARALLAX DEPTH LAYERS
  ════════════════════════════════════════════════════════════ */
  function setupHeroParallax() {
    var hero = document.getElementById('hero');
    if (!hero) return;

    /* Tag elements with depth */
    var title   = hero.querySelector('.hero-title');
    var sub     = hero.querySelector('.hero-sub');
    var actions = hero.querySelector('.hero-actions');

    if (title)   title.classList.add('depth-near');
    if (sub)     sub.classList.add('depth-mid');
    if (actions) actions.classList.add('depth-far');

    /* Skip mouse parallax on touch devices — no mouse events fire */
    if (!window.matchMedia('(pointer: coarse)').matches) {
      document.addEventListener('mousemove', function (e) {
        var cx = window.innerWidth  / 2;
        var cy = window.innerHeight / 2;
        var dx = (e.clientX - cx) / cx;
        var dy = (e.clientY - cy) / cy;

        if (title)   gsap.to(title,   { x: dx * -14, y: dy * -10, duration: 0.8, ease: 'power2.out' });
        if (sub)     gsap.to(sub,     { x: dx *  -7, y: dy *  -5, duration: 0.9, ease: 'power2.out' });
        if (actions) gsap.to(actions, { x: dx *  -3, y: dy *  -2, duration: 1.0, ease: 'power2.out' });
      });
    }

    /* Scroll: hero text rises out of frame with depth */
    gsap.to('.hero-text', {
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      y: -120,
      opacity: 0,
      scale: 0.96,
      ease: 'none'
    });
  }

  /* ════════════════════════════════════════════════════════════
     4. SCROLL ANIMATIONS — Sequential, staggered reveals
        Uses ScrollTrigger.batch() so cards in the same visible
        row animate in clean left→right order, not randomly.
  ════════════════════════════════════════════════════════════ */
  function setupScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    /* Trigger threshold: when top of element hits 75% down the viewport */
    var T = 'top 75%';

    /* ── 4a. Section labels — slide + line-reveal ── */
    gsap.utils.toArray('.section-label').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: T, once: true },
        opacity: 0,
        x: -28,
        duration: 0.65,
        ease: 'power3.out'
      });
    });

    /* ── 4b. Section titles — 3D word cascade ── */
    gsap.utils.toArray('.section-title').forEach(function (el) {
      /* Don't re-split if already split */
      if (el.querySelector('.word')) return;

      var html = el.innerHTML.replace(/<br\s*\/?>/gi, ' §BR§ ');
      var parts = html.split(' ');
      el.innerHTML = parts.map(function (w) {
        if (w === '§BR§') return '<br>';
        return '<span class="word-wrap"><span class="word">' + w + '</span></span>';
      }).join(' ');

      gsap.from(el.querySelectorAll('.word'), {
        scrollTrigger: { trigger: el, start: T, once: true },
        opacity: 0,
        y: 48,
        rotationX: 55,
        stagger: { each: 0.065, ease: 'power1.in' },
        duration: 0.85,
        ease: 'back.out(1.6)'
      });
    });

    /* ── 4c. Sub headings — blur + fade up (sequential) ── */
    gsap.utils.toArray('.section-sub, .section-sub-light').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: T, once: true },
        opacity: 0,
        y: 22,
        filter: 'blur(4px)',
        duration: 0.75,
        ease: 'power2.out',
        clearProps: 'filter'
      });
    });

    /* ── 4d. Trust bar ── */
    var trustBar = document.querySelector('.trust-bar');
    if (trustBar) {
      gsap.from(trustBar.children, {
        scrollTrigger: { trigger: trustBar, start: T, once: true },
        opacity: 0,
        y: 18,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power2.out'
      });
    }

    /* ── 4e. BATCH function — groups cards entering same viewport frame ── */
    function batchAnimate(selector, fromVars, batchSize) {
      batchSize = batchSize || 4;
      ScrollTrigger.batch(selector, {
        interval: 0.08,     // time window to collect a batch (seconds)
        batchSize: batchSize,
        start: T,
        once: true,
        onEnter: function (elements) {
          gsap.from(elements, Object.assign({
            stagger: { each: 0.1, from: 'start' },
            clearProps: 'all'
          }, fromVars));
        }
      });
    }

    /* ── 4f. Service cards — rise up in order ── */
    batchAnimate('.service-card', {
      opacity: 0, y: 44, duration: 0.7, ease: 'power3.out'
    }, 4);

    /* ── 4g. Process steps — cascade left→right ── */
    batchAnimate('.process-step', {
      opacity: 0, y: 38, duration: 0.65, ease: 'power3.out'
    }, 4);

    /* ── 4h. Developer cards — Z-depth fly-in ── */
    batchAnimate('.developer-card', {
      opacity: 0, y: 50, z: -60, duration: 0.75, ease: 'power3.out'
    }, 3);

    /* ── 4i. Blog / playbook / insight cards ── */
    batchAnimate('.blog-card', {
      opacity: 0, y: 40, duration: 0.65, ease: 'power2.out'
    }, 3);
    batchAnimate('.playbook-card', {
      opacity: 0, y: 40, duration: 0.65, ease: 'power2.out'
    }, 3);
    batchAnimate('.insight-card', {
      opacity: 0, y: 36, duration: 0.65, ease: 'power2.out'
    }, 3);

    /* ── 4j. Testimonial cards — scale + rise ── */
    batchAnimate('.testimonial-card', {
      opacity: 0, scale: 0.94, y: 28, duration: 0.7, ease: 'power2.out'
    }, 3);

    /* ── 4k. Area cards (areas page) ── */
    batchAnimate('.area-index-card', {
      opacity: 0, y: 40, duration: 0.65, ease: 'power2.out'
    }, 3);
    batchAnimate('.area-highlight-card', {
      opacity: 0, y: 36, duration: 0.6, ease: 'power2.out'
    }, 4);
    batchAnimate('.area-project-card', {
      opacity: 0, y: 32, duration: 0.6, ease: 'power2.out'
    }, 3);

    /* ── 4l. Diff compare items ── */
    batchAnimate('.diff-item', {
      opacity: 0, y: 56, rotationX: 28, transformOrigin: '50% 0%',
      duration: 0.85, ease: 'power3.out'
    }, 2);
    batchAnimate('.diff-them, .diff-me', {
      opacity: 0, y: 28, duration: 0.65, ease: 'power3.out'
    }, 2);

    /* ── 4m. Stats / metrics — elastic pop ── */
    batchAnimate('.metric, .stat-item, .proof-stat, .hs-stat', {
      opacity: 0, scale: 0.72, y: 24, duration: 0.65, ease: 'back.out(2.2)'
    }, 4);

    /* ── 4n. Form section — depth zoom ── */
    var formSection = document.querySelector('.section-form');
    if (formSection) {
      gsap.from('.form-card', {
        scrollTrigger: { trigger: formSection, start: T, once: true },
        opacity: 0,
        y: 72,
        z: -100,
        rotationX: 12,
        transformOrigin: '50% 100%',
        duration: 1.05,
        ease: 'expo.out'
      });
      gsap.from('.form-info > *', {
        scrollTrigger: { trigger: formSection, start: T, once: true },
        opacity: 0,
        x: -44,
        stagger: 0.13,
        duration: 0.85,
        ease: 'power3.out'
      });
    }

    /* ── 4o. Area stats bar (area detail pages) ── */
    batchAnimate('.area-stat', {
      opacity: 0, y: 22, scale: 0.92, duration: 0.55, ease: 'power2.out'
    }, 4);

    /* ── 4p. Buttons / CTAs in sections ── */
    gsap.utils.toArray('.section > .container > .btn, .section > .container > div > .btn').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: T, once: true },
        opacity: 0,
        y: 16,
        scale: 0.95,
        duration: 0.55,
        ease: 'back.out(1.5)'
      });
    });

    /* ── 4q. Footer — fade up ── */
    gsap.from('.footer', {
      scrollTrigger: { trigger: '.footer', start: 'top 92%', once: true },
      opacity: 0,
      y: 28,
      duration: 0.7,
      ease: 'power2.out'
    });

    /* ── 4r. Scrub parallax on section backgrounds (subtle depth) ── */
    gsap.utils.toArray('.section-dark').forEach(function (el) {
      gsap.fromTo(el,
        { backgroundPositionY: '0%' },
        {
          backgroundPositionY: '15%',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8
          }
        }
      );
    });
  }

  /* ════════════════════════════════════════════════════════════
     5. 3D CARD TILT — Developer cards + diff items
  ════════════════════════════════════════════════════════════ */
  function setupCardTilt() {
    /* No tilt on touch/mobile — no hover events, would break tap UX */
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var cards = document.querySelectorAll('.developer-card, .diff-compare, .form-card');

    cards.forEach(function (card) {
      var rect, cx, cy;

      card.addEventListener('mouseenter', function () {
        rect = card.getBoundingClientRect();
        cx   = rect.left + rect.width  / 2;
        cy   = rect.top  + rect.height / 2;
        gsap.to(card, { duration: 0.3, transformPerspective: 800, ease: 'power2.out' });
      });

      card.addEventListener('mousemove', function (e) {
        if (!rect) { rect = card.getBoundingClientRect(); cx = rect.left + rect.width/2; cy = rect.top + rect.height/2; }
        var dx = (e.clientX - cx) / (rect.width  / 2);
        var dy = (e.clientY - cy) / (rect.height / 2);
        var maxTilt = 12;
        gsap.to(card, {
          duration: 0.25,
          rotationY:  dx * maxTilt,
          rotationX: -dy * maxTilt,
          scale: 1.03,
          z: 30,
          boxShadow: '0 ' + (20 + Math.abs(dy) * 20) + 'px ' + (60 + Math.abs(dx) * 20) + 'px rgba(0,0,0,0.18)',
          ease: 'power2.out',
          transformPerspective: 800,
          transformOrigin: '50% 50%'
        });
      });

      card.addEventListener('mouseleave', function () {
        rect = null;
        gsap.to(card, {
          duration: 0.6,
          rotationY: 0, rotationX: 0, scale: 1, z: 0,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     6. COUNTERS — Animate numbers when scrolled into view
  ════════════════════════════════════════════════════════════ */
  function setupCounters() {
    var counterEls = document.querySelectorAll('[data-count]');
    counterEls.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      var decimals = el.getAttribute('data-decimals') || 0;

      ScrollTrigger && ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: function () {
          gsap.fromTo({ val: 0 }, { val: target }, {
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = prefix + this.targets()[0].val.toFixed(decimals) + suffix;
            }
          });
        }
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     7. DIFF ITEMS — Stagger the comparison panels
  ════════════════════════════════════════════════════════════ */
  function setupDiffItems() {
    gsap.utils && gsap.utils.toArray('.diff-them, .diff-me').forEach(function (el, i) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%' },
        opacity: 0,
        x: el.classList.contains('diff-me') ? 30 : -30,
        duration: 0.65,
        ease: 'power3.out'
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     8. CURSOR GLOW TRAIL (desktop only)
  ════════════════════════════════════════════════════════════ */
  function setupCursorTrail() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var dot = document.createElement('div');
    dot.id = 'cursor-glow';
    document.body.appendChild(dot);

    var mx = 0, my = 0, dx = 0, dy = 0;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
    });

    (function loop() {
      dx += (mx - dx) * 0.12;
      dy += (my - dy) * 0.12;
      dot.style.transform = 'translate(' + (dx - 10) + 'px, ' + (dy - 10) + 'px)';
      requestAnimationFrame(loop);
    })();

    /* Grow on interactive elements */
    document.querySelectorAll('a, button, .strategy-card, .developer-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () { dot.classList.add('cursor-hover'); });
      el.addEventListener('mouseleave', function () { dot.classList.remove('cursor-hover'); });
    });
  }

  /* ── Boot ───────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
