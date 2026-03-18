/* =============================================
   ELECTRON AI — Main Script
   ============================================= */

'use strict';

// ─── NAVBAR SCROLL EFFECT ─────────────────────
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const curr = window.scrollY;
  if (curr > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  lastScroll = curr;
}, { passive: true });

// ─── MOBILE NAV TOGGLE ────────────────────────
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

navToggle.addEventListener('click', () => {
  navMobile.classList.toggle('open');
  const spans = navToggle.querySelectorAll('span');
  if (navMobile.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// Close mobile nav on link click
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMobile.classList.remove('open');
    const spans = navToggle.querySelectorAll('span');
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ─── PARTICLE CANVAS ──────────────────────────
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let W, H, particles = [];
const PARTICLE_COUNT = 80;
const PARTICLE_COLORS = ['rgba(0,212,255,', 'rgba(168,85,247,', 'rgba(59,130,246,'];

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });

class Particle {
  constructor() { this.reset(true); }

  reset(init = false) {
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : H + 10;
    this.size = Math.random() * 1.8 + 0.4;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = -(Math.random() * 0.6 + 0.2);
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    this.life = 0;
    this.maxLife = Math.random() * 200 + 100;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life++;
    if (this.y < -10 || this.life > this.maxLife) this.reset();
  }

  draw() {
    const alpha = this.opacity * (1 - this.life / this.maxLife);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `${this.color}${alpha})`;
    ctx.fill();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

// Connections between nearby particles
function drawConnections() {
  const maxDist = 100;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.06;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ─── SCROLL REVEAL ────────────────────────────
const revealElements = document.querySelectorAll(
  '.about-card, .product-card, .solution-item, .testimonial, ' +
  '.research-left, .research-right, .section-title, .section-subtitle, ' +
  '.section-label, .about-text, .about-visual, .cta-inner, ' +
  '.trust-logos, .research-topics'
);

// Add reveal class to elements
revealElements.forEach((el, i) => {
  el.classList.add('reveal');
  // Stagger siblings
  const parent = el.parentElement;
  const siblings = Array.from(parent.children).filter(c => c.classList.contains('reveal'));
  const idx = siblings.indexOf(el);
  if (idx > 0 && idx <= 4) el.classList.add(`reveal-delay-${idx}`);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── STAT COUNTER ANIMATION ───────────────────
const statNumbers = document.querySelectorAll('.stat-number[data-target]');

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(el => statObserver.observe(el));

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(update);
}

// ─── SMOOTH ACTIVE NAV ────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinksAll.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// Active nav link style (inline since it's dynamic)
const style = document.createElement('style');
style.textContent = `.nav-links a.active { color: var(--c-text); background: rgba(0,212,255,0.08); }`;
document.head.appendChild(style);

// ─── FORM SUBMISSION ──────────────────────────
const ctaForm = document.getElementById('ctaForm');

ctaForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const btn = ctaForm.querySelector('.btn-submit');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  // Simulate async
  setTimeout(() => {
    ctaForm.innerHTML = `
      <div class="form-success visible">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="27" stroke="url(#sg1)" stroke-width="1.5" fill="rgba(0,212,255,0.08)"/>
          <path d="M18 28l8 8 14-14" stroke="url(#sg1)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <defs>
            <linearGradient id="sg1" x1="0" y1="0" x2="56" y2="56">
              <stop stop-color="#00d4ff"/>
              <stop offset="1" stop-color="#a855f7"/>
            </linearGradient>
          </defs>
        </svg>
        <h3>You're on the list!</h3>
        <p>We'll be in touch within 48 hours. Welcome to the future of AI.</p>
      </div>
    `;
  }, 1200);
});

// ─── PRODUCT CARD MOUSE GLOW EFFECT ──────────
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  });
});

// Add mouse glow CSS
const glowStyle = document.createElement('style');
glowStyle.textContent = `
  .product-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      200px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(0,212,255,0.06),
      transparent
    );
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .product-card:hover::after { opacity: 1; }
`;
document.head.appendChild(glowStyle);

// ─── SMOOTH SCROLL OFFSET FOR FIXED NAV ───────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});

// ─── TOPIC PILL RANDOM HIGHLIGHT ─────────────
const pills = document.querySelectorAll('.topic-pill');
if (pills.length) {
  let pillIdx = 0;
  setInterval(() => {
    pills.forEach(p => p.style.borderColor = '');
    pills[pillIdx].style.borderColor = 'rgba(0,212,255,0.5)';
    pills[pillIdx].style.color = 'var(--c-accent-cyan)';
    pills[pillIdx].style.background = 'rgba(0,212,255,0.08)';
    setTimeout(() => {
      pills[pillIdx].style.borderColor = '';
      pills[pillIdx].style.color = '';
      pills[pillIdx].style.background = '';
    }, 1500);
    pillIdx = (pillIdx + 1) % pills.length;
  }, 2000);
}

// ─── PAGE LOAD TRANSITION ─────────────────────
document.documentElement.style.opacity = '0';
document.documentElement.style.transition = 'opacity 0.4s ease';
window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    document.documentElement.style.opacity = '1';
  });
});
