/* ─── CURSOR ─── */
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top  = mouseY + 'px';
});

(function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
})();

/* ─── CARD MOUSE GLOW ─── */
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%';
    const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%';
    card.style.setProperty('--mx', x);
    card.style.setProperty('--my', y);
  });
});

/* ─── PROGRESS BAR ─── */
const bar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (window.scrollY / max * 100) + '%';
});

/* ─── PARTICLES CANVAS ─── */
const canvas = document.getElementById('canvas-bg');
const ctx    = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() { this.reset(true); }
  reset(init) {
    this.x  = Math.random() * W;
    this.y  = init ? Math.random() * H : H + 10;
    this.vy = -(Math.random() * 0.4 + 0.1);
    this.vx = (Math.random() - 0.5) * 0.15;
    this.r  = Math.random() * 1.5 + 0.3;
    this.a  = Math.random() * 0.5 + 0.1;
    this.life = 0;
    this.maxLife = Math.random() * 300 + 200;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.y < -10 || this.life > this.maxLife) this.reset(false);
  }
  draw() {
    const prog = this.life / this.maxLife;
    const fade = prog < 0.1 ? prog * 10 : prog > 0.85 ? (1 - prog) / 0.15 : 1;
    ctx.save();
    ctx.globalAlpha = this.a * fade;
    ctx.fillStyle = '#4A9EFF';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#4A9EFF';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < 120; i++) particles.push(new Particle());

/* connections */
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        ctx.save();
        ctx.globalAlpha = (1 - dist/100) * 0.06;
        ctx.strokeStyle = '#4A9EFF';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function loop() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(loop);
}
loop();

/* ─── SCROLL REVEAL ─── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      updateNavDots();
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.section').forEach(s => observer.observe(s));

/* ─── SIDE NAV DOTS ─── */
const sections = document.querySelectorAll('.section[id]');
const navDots  = document.querySelectorAll('.nav-dot');

function updateNavDots() {
  let current = '';
  sections.forEach(s => {
    const top = s.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.5) current = s.id;
  });
  navDots.forEach(d => {
    d.classList.toggle('active', d.dataset.section === current);
  });
}
window.addEventListener('scroll', updateNavDots);
navDots.forEach(d => {
  d.addEventListener('click', () => {
    document.getElementById(d.dataset.section)?.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ─── COUNTER ANIMATION ─── */
function animateCount(el, target, suffix = '') {
  let start = 0;
  const dur = 1800;
  const step = ts => {
    if (!start) start = ts;
    const prog = Math.min((ts - start) / dur, 1);
    const ease = 1 - Math.pow(1 - prog, 3);
    el.textContent = Math.round(ease * target) + suffix;
    if (prog < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statsObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCount(document.getElementById('stat-days'), 365, '+');
      animateCount(document.getElementById('stat-enc'), 100, '%');
      animateCount(document.getElementById('stat-del'), 48, 'h');
      statsObs.disconnect();
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObs.observe(statsEl);

/* ─── TILT ON SECTION CARDS ─── */
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r   = card.getBoundingClientRect();
    const cx  = r.left + r.width  / 2;
    const cy  = r.top  + r.height / 2;
    const rx  = (e.clientY - cy) / (r.height / 2) * 5;
    const ry  = (e.clientX - cx) / (r.width  / 2) * -5;
    card.style.transform = `translateY(-4px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    card.style.perspective = '600px';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});