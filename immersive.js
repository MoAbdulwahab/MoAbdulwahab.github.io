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

    var canvas = document.createElement('canvas');
    canvas.id = 'hero-canvas';
    hero.insertBefore(canvas, hero.firstChild);

    var W = canvas.offsetWidth  = hero.offsetWidth;
    var H = canvas.offsetHeight = hero.offsetHeight;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

    /* ── Particle field ── */
    var pCount = 900;
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

    document.addEventListener('mousemove', function (e) {
      var cx = window.innerWidth  / 2;
      var cy = window.innerHeight / 2;
      var dx = (e.clientX - cx) / cx;
      var dy = (e.clientY - cy) / cy;

      if (title)   gsap.to(title,   { x: dx * -14, y: dy * -10, duration: 0.8, ease: 'power2.out' });
      if (sub)     gsap.to(sub,     { x: dx *  -7, y: dy *  -5, duration: 0.9, ease: 'power2.out' });
      if (actions) gsap.to(actions, { x: dx *  -3, y: dy *  -2, duration: 1.0, ease: 'power2.out' });
    });

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
     4. SCROLL ANIMATIONS — 3D depth reveals for every section
  ════════════════════════════════════════════════════════════ */
  function setupScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    /* Section labels */
    gsap.utils.toArray('.section-label').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%' },
        opacity: 0, x: -30, duration: 0.7, ease: 'power3.out'
      });
    });

    /* Section titles — split words */
    gsap.utils.toArray('.section-title').forEach(function (el) {
      var words = el.innerHTML.replace(/<br\s*\/?>/gi, ' <br> ').split(' ');
      el.innerHTML = words.map(function (w) {
        return w === '<br>' ? '<br>' : '<span class="word-wrap"><span class="word">' + w + '</span></span>';
      }).join(' ');

      gsap.from(el.querySelectorAll('.word'), {
        scrollTrigger: { trigger: el, start: 'top 85%' },
        opacity: 0,
        y: 50,
        rotationX: 60,
        stagger: 0.07,
        duration: 0.9,
        ease: 'back.out(1.4)'
      });
    });

    /* Trust bar — slide + fade */
    gsap.from('.trust-bar', {
      scrollTrigger: { trigger: '.trust-bar', start: 'top 92%' },
      opacity: 0, y: 20, duration: 0.6
    });

    /* Diff compare items — 3D card flip from depth */
    gsap.utils.toArray('.diff-item').forEach(function (el, i) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%' },
        opacity: 0,
        y: 60,
        rotationX: 30,
        transformOrigin: '50% 0%',
        duration: 0.85,
        delay: i * 0.12,
        ease: 'power3.out'
      });
    });

    /* Developer cards — fly in from alternating sides with Z depth */
    gsap.utils.toArray('.developer-card').forEach(function (el, i) {
      var dir = i % 2 === 0 ? -1 : 1;
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 90%' },
        opacity: 0,
        x: dir * 40,
        z: -80,
        rotationY: dir * 20,
        duration: 0.75,
        delay: (i % 3) * 0.1,
        ease: 'power3.out'
      });
    });

    /* Form section — depth zoom in */
    var formSection = document.querySelector('.section-form');
    if (formSection) {
      gsap.from('.form-card', {
        scrollTrigger: { trigger: formSection, start: 'top 75%' },
        opacity: 0,
        y: 80,
        z: -120,
        rotationX: 15,
        transformOrigin: '50% 100%',
        duration: 1.1,
        ease: 'expo.out'
      });
      gsap.from('.form-info > *', {
        scrollTrigger: { trigger: formSection, start: 'top 80%' },
        opacity: 0,
        x: -50,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power3.out'
      });
    }

    /* Stats / metric items */
    gsap.utils.toArray('.metric, .stat-item, .proof-stat').forEach(function (el, i) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 90%' },
        opacity: 0,
        scale: 0.7,
        y: 30,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'back.out(2)'
      });
    });

    /* Footer */
    gsap.from('.footer', {
      scrollTrigger: { trigger: '.footer', start: 'top 95%' },
      opacity: 0,
      y: 30,
      duration: 0.7
    });

    /* Ambient section background parallax */
    gsap.utils.toArray('.section').forEach(function (el) {
      gsap.fromTo(el,
        { backgroundPositionY: '0%' },
        {
          backgroundPositionY: '20%',
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        }
      );
    });
  }

  /* ════════════════════════════════════════════════════════════
     5. 3D CARD TILT — Developer cards + diff items
  ════════════════════════════════════════════════════════════ */
  function setupCardTilt() {
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
