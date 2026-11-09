// === VAULT PARTICLES ===
(function spawnParticles() {
  const container = document.getElementById("particles");
  if (!container) return;
  for (let i = 0; i < 60; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --dur: ${2 + Math.random() * 4}s;
      --delay: ${Math.random() * 5}s;
      width: ${1 + Math.random() * 3}px;
      height: ${1 + Math.random() * 3}px;
    `;
    container.appendChild(p);
  }
})();

document.getElementById("passwordInput")?.addEventListener("keydown", function(e) {
  if (e.key === "Enter") tryUnlock();
});

// === UNLOCK LOGIC ===
async function tryUnlock() {
  const input = document.getElementById("passwordInput");
  const btn = document.getElementById("unlockBtn");
  const errorMsg = document.getElementById("errorMsg");
  const dial = document.getElementById("dial");
  const vaultDoor = document.getElementById("vaultDoor");

  const password = input.value.trim();
  if (!password) { showError("Please enter the password 😊"); return; }

  btn.disabled = true;
  btn.textContent = "...";
  errorMsg.textContent = "";

  dial.classList.add("stopped");
  vaultDoor.classList.add("spinning");
  setTimeout(() => vaultDoor.classList.remove("spinning"), 700);

  try {
    const res = await fetch("/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json();

    if (data.success) {
      vaultDoor.classList.add("opened");
      setTimeout(() => {
        document.getElementById("vault-screen").style.display = "none";
        showBloomAnimation();
      }, 1100);
    } else {
      showError(data.error || "Wrong password 💔");
      vaultDoor.classList.remove("spinning");
      dial.classList.remove("stopped");
      btn.disabled = false;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg> Open`;
      input.value = "";
      input.focus();
    }
  } catch {
    showError("Something went wrong, please try again.");
    btn.disabled = false;
  }
}

function showError(msg) {
  const el = document.getElementById("errorMsg");
  el.textContent = msg;
  el.style.animation = "none";
  requestAnimationFrame(() => el.style.animation = "shake 0.3s ease");
}

// ========================
// PAGE NAVIGATION SYSTEM
// ========================
const TOTAL_PAGES = 7;
let currentPage = 0;
let isAnimating = false;
let touchStartX = 0;
let touchStartY = 0;

function buildPageDots() {
  const dots = document.getElementById("pageDots");
  dots.innerHTML = "";
  for (let i = 0; i < TOTAL_PAGES; i++) {
    const d = document.createElement("div");
    d.className = "page-dot" + (i === 0 ? " active" : "");
    d.onclick = () => goToPage(i);
    dots.appendChild(d);
  }
}

function updateDots() {
  document.querySelectorAll(".page-dot").forEach((d, i) => {
    d.classList.toggle("active", i === currentPage);
  });
}

function updateArrows() {
  const prev = document.getElementById("navPrev");
  const next = document.getElementById("navNext");
  if (prev) prev.disabled = currentPage === 0;
  if (next) next.disabled = currentPage === TOTAL_PAGES - 1;
}

function goToPage(idx) {
  if (isAnimating || idx === currentPage) return;
  if (idx < 0 || idx >= TOTAL_PAGES) return;
  isAnimating = true;
  currentPage = idx;

  const wrapper = document.getElementById("pagesWrapper");
  wrapper.style.transform = `translateX(-${currentPage * 100}vw)`;

  updateDots();
  updateArrows();
  onPageEnter(currentPage);

  setTimeout(() => { isAnimating = false; }, 700);
}

function changePage(dir) {
  goToPage(currentPage + dir);
}

function onPageEnter(page) {
  if (page === 2) {
    // Gallery — trigger visible animations
    setTimeout(() => {
      document.querySelectorAll(".gallery-item").forEach((el, i) => {
        setTimeout(() => el.classList.add("visible"), i * 80);
      });
    }, 200);
  }
  if (page === 3) {
    // Do You Love Me page
    initLoveQuestionPage();
  }
  if (page === 4) {
    // XOXO Game page
    initXoxoGame();
  }
  if (page === 5) {
    // Catch Game page
    initCatchGameCanvas();
  }
  if (page === 6) {
    // Blue flower — start animation
    setTimeout(startBlueFlowerAnimation, 200);
  }
}

// Touch/swipe support
function setupSwipe() {
  const wrapper = document.getElementById("birthday-screen");
  wrapper.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  wrapper.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      changePage(dx < 0 ? 1 : -1);
    }
  }, { passive: true });
}

// Keyboard arrow keys
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight" || e.key === "ArrowDown") changePage(1);
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") changePage(-1);
});

// === BIRTHDAY SCREEN ===
function showBirthdayScreen() {
  const screen = document.getElementById("birthday-screen");
  screen.classList.remove("hidden");
  initRomanceCanvas();
  spawnPetals();
  spawnHeroStars();
  setupLightbox();
  buildPageDots();
  updateArrows();
  setupSwipe();
  window.scrollTo(0, 0);
  // Auto-attempt gentle background melody
  tryStartMusic();
}

// =============================================
// ROMANTIC AMBIENT CANVAS (ROSE PETALS & FIREFLIES)
// =============================================
let romanceCanvasInit = false;
function initRomanceCanvas() {
  if (romanceCanvasInit) return;
  romanceCanvasInit = true;

  const canvas = document.getElementById("romanceCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Realistic 3D Tumbling Blue & Sky Rose Petals
  class RomanticBluePetal {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : -30;
      this.size = 14 + Math.random() * 18;
      this.speedY = 0.6 + Math.random() * 1.1;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.015 + Math.random() * 0.02;
      this.swayWidth = 25 + Math.random() * 35;
      this.flipAngle = Math.random() * Math.PI * 2;
      this.flipSpeed = 0.02 + Math.random() * 0.03;
      this.rotation = (Math.random() - 0.5) * 0.8;
      this.rotSpeed = (Math.random() - 0.5) * 0.01;
      this.opacity = 0.45 + Math.random() * 0.45;
      // Romantic blue & soft sky color variations
      this.colors = [
        ["#bfdbfe", "#60a5fa", "#1d4ed8"],
        ["#93c5fd", "#3b82f6", "#1e40af"],
        ["#bae6fd", "#38bdf8", "#0284c7"],
        ["#e0f2fe", "#7ec8ff", "#2563eb"],
      ][Math.floor(Math.random() * 4)];
    }
    update() {
      this.y += this.speedY;
      this.swayAngle += this.swaySpeed;
      this.flipAngle += this.flipSpeed;
      this.rotation += this.rotSpeed;
      this.currentX = this.x + Math.sin(this.swayAngle) * this.swayWidth;
      if (this.y > canvas.height + 40) this.reset();
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.currentX, this.y);
      ctx.rotate(this.rotation);
      const flipScale = Math.cos(this.flipAngle);
      ctx.scale(flipScale, 1);
      ctx.globalAlpha = this.opacity * (0.6 + 0.4 * Math.abs(flipScale));

      const grad = ctx.createLinearGradient(0, -this.size * 0.5, 0, this.size * 0.5);
      grad.addColorStop(0, this.colors[0]);
      grad.addColorStop(0.5, this.colors[1]);
      grad.addColorStop(1, this.colors[2]);
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(0, -this.size * 0.55);
      ctx.bezierCurveTo(
        this.size * 0.6, -this.size * 0.45,
        this.size * 0.7, this.size * 0.35,
        0, this.size * 0.55
      );
      ctx.bezierCurveTo(
        -this.size * 0.7, this.size * 0.35,
        -this.size * 0.6, -this.size * 0.45,
        0, -this.size * 0.55
      );
      ctx.fill();

      // Subtle curved highlight on petal edge
      ctx.strokeStyle = "rgba(224, 242, 254, 0.45)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -this.size * 0.5);
      ctx.quadraticCurveTo(this.size * 0.45, -this.size * 0.1, 0, this.size * 0.45);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Cute Floating Glowing Hearts (Blue & Soft Moonlight)
  class CuteGlowingHeart {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : canvas.height + 25;
      this.size = 10 + Math.random() * 12;
      this.speedY = 0.45 + Math.random() * 0.75;
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.012 + Math.random() * 0.018;
      this.pulseAngle = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.03 + Math.random() * 0.03;
      this.baseAlpha = 0.35 + Math.random() * 0.45;
      this.color = ["#7ec8ff", "#93c5fd", "#a5d8ff", "#c7d2fe", "#fde68a"][Math.floor(Math.random() * 5)];
    }
    update() {
      this.y -= this.speedY;
      this.swayAngle += this.swaySpeed;
      this.pulseAngle += this.pulseSpeed;
      this.currentX = this.x + Math.sin(this.swayAngle) * 24;
      if (this.y < -35) this.reset();
    }
    draw(ctx) {
      const pulse = 1 + 0.12 * Math.sin(this.pulseAngle);
      const alpha = this.baseAlpha * (0.7 + 0.3 * Math.sin(this.pulseAngle));
      ctx.save();
      ctx.translate(this.currentX, this.y);
      ctx.scale(pulse, pulse);
      ctx.globalAlpha = Math.max(0, alpha);

      // Cute Heart shape path
      const s = this.size;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.2, 0, s);
      ctx.bezierCurveTo(s, s * 0.2, s * 0.5, -s * 0.3, 0, s * 0.3);
      ctx.fill();

      ctx.restore();
    }
  }

  // Warm Glowing Stardust Fireflies
  class CandleFirefly {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
      this.size = 1.2 + Math.random() * 2.6;
      this.speedY = 0.35 + Math.random() * 0.75;
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.01 + Math.random() * 0.015;
      this.pulseAngle = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.03 + Math.random() * 0.04;
      this.baseAlpha = 0.3 + Math.random() * 0.45;
      this.color = Math.random() < 0.6 ? "#7ec8ff" : "#fde68a";
    }
    update() {
      this.y -= this.speedY;
      this.swayAngle += this.swaySpeed;
      this.pulseAngle += this.pulseSpeed;
      this.currentX = this.x + Math.sin(this.swayAngle) * 20;
      if (this.y < -30) this.reset();
    }
    draw(ctx) {
      const alpha = this.baseAlpha * (0.6 + 0.4 * Math.sin(this.pulseAngle));
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      const glow = ctx.createRadialGradient(this.currentX, this.y, 0, this.currentX, this.y, this.size * 4);
      glow.addColorStop(0, this.color);
      glow.addColorStop(0.5, this.color + "66");
      glow.addColorStop(1, "rgba(126, 200, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(this.currentX, this.y, this.size * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(this.currentX, this.y, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const petals = [];
  const hearts = [];
  const fireflies = [];
  for (let i = 0; i < 24; i++) petals.push(new RomanticBluePetal());
  for (let i = 0; i < 16; i++) hearts.push(new CuteGlowingHeart());
  for (let i = 0; i < 35; i++) fireflies.push(new CandleFirefly());

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fireflies.forEach(f => { f.update(); f.draw(ctx); });
    hearts.forEach(h => { h.update(); h.draw(ctx); });
    petals.forEach(p => { p.update(); p.draw(ctx); });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

// =============================================
// ROMANTIC ACOUSTIC PIANO SYNTHESIZER (WEB AUDIO API)
// =============================================
let romanticAudioCtx = null;
let romanticGain = null;
let musicInterval = null;
let isMusicPlaying = false;

function toggleRomanticMusic() {
  if (isMusicPlaying) {
    stopRomanticMusic();
  } else {
    startRomanticMusic();
  }
}

function tryStartMusic() {
  if (!isMusicPlaying) {
    startRomanticMusic();
  }
}

function startRomanticMusic() {
  try {
    if (!romanticAudioCtx) {
      romanticAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (romanticAudioCtx.state === "suspended") {
      romanticAudioCtx.resume();
    }

    romanticGain = romanticAudioCtx.createGain();
    romanticGain.gain.setValueAtTime(0.18, romanticAudioCtx.currentTime);
    romanticGain.connect(romanticAudioCtx.destination);

    isMusicPlaying = true;
    updateMusicBtnUI();

    // Romantic Chord Progression: Cmaj7 -> Am9 -> Fmaj7 -> G6
    const chordProgressions = [
      // Cmaj7
      [261.63, 329.63, 392.00, 493.88, 523.25],
      // Am9
      [220.00, 261.63, 329.63, 493.88, 523.25],
      // Fmaj7
      [174.61, 261.63, 329.63, 349.23, 440.00],
      // G6 / Gsus
      [196.00, 293.66, 329.63, 392.00, 493.88]
    ];

    let chordIdx = 0;
    let step = 0;

    function playNote(freq, delay, dur = 1.8, velocity = 0.12) {
      if (!isMusicPlaying || !romanticAudioCtx) return;
      const t = romanticAudioCtx.currentTime + delay;

      const osc = romanticAudioCtx.createOscillator();
      const osc2 = romanticAudioCtx.createOscillator();
      const noteGain = romanticAudioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq * 2, t);

      const filter = romanticAudioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, t);

      noteGain.gain.setValueAtTime(0.0001, t);
      noteGain.gain.linearRampToValueAtTime(velocity, t + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(velocity * 0.4, t + 0.4);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(romanticGain);

      osc.start(t);
      osc2.start(t);
      osc.stop(t + dur + 0.1);
      osc2.stop(t + dur + 0.1);
    }

    function stepMusic() {
      if (!isMusicPlaying) return;
      const currentChord = chordProgressions[chordIdx];
      const noteIdx = step % currentChord.length;
      playNote(currentChord[noteIdx], 0, 2.2, 0.13);

      if (step === 0) {
        playNote(currentChord[0] * 0.5, 0, 3.0, 0.16);
      }
      if (step === 2 || step === 5) {
        playNote(currentChord[currentChord.length - 1] * 1.5, 0.15, 1.8, 0.08);
      }

      step++;
      if (step >= 8) {
        step = 0;
        chordIdx = (chordIdx + 1) % chordProgressions.length;
      }
    }

    stepMusic();
    musicInterval = setInterval(stepMusic, 420);

  } catch { }
}

function stopRomanticMusic() {
  isMusicPlaying = false;
  if (musicInterval) { clearInterval(musicInterval); musicInterval = null; }
  if (romanticGain && romanticAudioCtx) {
    try {
      romanticGain.gain.linearRampToValueAtTime(0.0001, romanticAudioCtx.currentTime + 0.5);
    } catch { }
  }
  updateMusicBtnUI();
}

function updateMusicBtnUI() {
  const btn = document.getElementById("musicToggleBtn");
  if (!btn) return;
  if (isMusicPlaying) {
    btn.classList.add("playing");
    btn.querySelector(".music-icon").textContent = "🩵";
    btn.querySelector(".music-label").textContent = "Melody Playing ✨";
  } else {
    btn.classList.remove("playing");
    btn.querySelector(".music-icon").textContent = "✨";
    btn.querySelector(".music-label").textContent = "Sweet Melody";
  }
}

function spawnPetals() {
  const container = document.getElementById("petals-container");
  const emojis = ["🩵", "💙", "✨", "⭐", "🦋", "🌸", "🤍", "🌟"];
  let count = 0;
  function drop() {
    if (count > 80) return;
    const p = document.createElement("div");
    p.className = "petal";
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${12 + Math.random() * 18}px;
      animation-duration: ${4 + Math.random() * 5}s;
      animation-delay: ${Math.random() * 2}s;
    `;
    container.appendChild(p);
    count++;
    setTimeout(() => p.remove(), 9000);
    setTimeout(drop, 150 + Math.random() * 300);
  }
  drop();
  setTimeout(() => {
    setInterval(() => {
      const p = document.createElement("div");
      p.className = "petal";
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        font-size: ${10 + Math.random() * 14}px;
        animation-duration: ${5 + Math.random() * 6}s;
        animation-delay: 0s;
      `;
      container.appendChild(p);
      setTimeout(() => p.remove(), 12000);
    }, 800);
  }, 8000);
}

function spawnHeroStars() {
  const container = document.getElementById("heroStars");
  if (!container) return;
  const symbols = ["✦", "✧", "⋆", "★", "✩"];
  for (let i = 0; i < 40; i++) {
    const s = document.createElement("div");
    s.className = "hero-star";
    s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    s.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      font-size: ${8 + Math.random() * 12}px;
      animation-delay: ${Math.random() * 1.5}s;
      color: ${Math.random() > 0.5 ? "#fde68a" : "#7ec8ff"};
    `;
    container.appendChild(s);
  }
}

function setupLightbox() {
  document.querySelectorAll(".polaroid").forEach(polaroid => {
    polaroid.addEventListener("click", () => {
      const src = polaroid.dataset.src;
      const caption = polaroid.dataset.caption;
      const message = polaroid.dataset.message;
      document.getElementById("modalImg").src = src;
      document.getElementById("modalTitle").textContent = caption;
      document.getElementById("modalMessage").textContent = message;
      document.getElementById("photoModal").classList.add("open");
    });
    const tilt = (Math.random() - 0.5) * 8;
    polaroid.style.transform = `rotate(${tilt}deg)`;
  });
}

function closePhotoModal() {
  document.getElementById("photoModal").classList.remove("open");
}
document.addEventListener("keydown", e => { if (e.key === "Escape") closePhotoModal(); });

// === BLOOM FLOWER ANIMATION ===
function showBloomAnimation() {
  const overlay = document.getElementById("bloom-overlay");
  const canvas = document.getElementById("bloomCanvas");
  const bloomText = document.getElementById("bloomText");
  overlay.classList.remove("hidden");

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  const flowers = [];
  const COLORS = [
    ["#1e3a8a", "#2563eb", "#60a5fa", "#bfdbfe"],
    ["#1d4ed8", "#3b82f6", "#93c5fd", "#dbeafe"],
    ["#0369a1", "#0284c7", "#38bdf8", "#bae6fd"],
    ["#1e40af", "#3b82f6", "#7ec8ff", "#e0f2fe"],
    ["#0f172a", "#1d4ed8", "#60a5fa", "#ffffff"],
  ];

  class RealisticFlower {
    constructor(x, y, delay, scale, colorSet) {
      this.x = x; this.y = y; this.delay = delay; this.scale = scale; this.colors = colorSet;
      this.progress = 0; this.petals = 5 + Math.floor(Math.random() * 3);
      this.rotation = Math.random() * Math.PI * 2; this.started = false; this.done = false;
      this.alpha = 0; this.fadeOut = false;
      this.swayAngle = 0; this.swaySpeed = 0.01 + Math.random() * 0.01;
      this.swayAmp = (Math.random() - 0.5) * 0.08;
      this.startTime = 0;
    }
    update(t) {
      if (t < this.delay) return;
      if (!this.started) { this.started = true; this.startTime = t; }
      this.swayAngle += this.swaySpeed;
      if (!this.fadeOut) {
        this.progress = Math.min(1, (t - this.delay) / 2000);
        this.alpha = Math.min(1, this.progress * 3);
      } else {
        this.alpha -= 0.007;
        if (this.alpha <= 0) this.done = true;
      }
    }
    draw(ctx) {
      if (!this.started || this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation + Math.sin(this.swayAngle) * this.swayAmp);
      ctx.scale(this.scale, this.scale);

      const p = this.progress;
      const petalLen = 46 * p;
      const petalW  = 20 * p;

      // Stem
      if (this.scale > 0.8 && p > 0.3) {
        const stemH = 28 * p;
        ctx.save();
        const stemGrad = ctx.createLinearGradient(0, 0, 0, stemH);
        stemGrad.addColorStop(0, "#3a7a3a");
        stemGrad.addColorStop(1, "#2a5a2a");
        ctx.strokeStyle = stemGrad;
        ctx.lineWidth = 2.5 * p;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(3, stemH * 0.5, 0, stemH);
        ctx.stroke();

        // Small leaf
        if (p > 0.6) {
          ctx.globalAlpha = this.alpha * (p - 0.6) * 2.5;
          ctx.fillStyle = "#4a9a4a";
          ctx.beginPath();
          ctx.ellipse(6, stemH * 0.5, 7, 3.5, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Outer petals (realistic shape with curvature)
      for (let i = 0; i < this.petals; i++) {
        const angle = (i / this.petals) * Math.PI * 2;
        ctx.save();
        ctx.rotate(angle);
        const petalOpenProgress = Math.min(1, p * 1.5);
        const petalAngle = (1 - petalOpenProgress) * Math.PI * 0.4;

        const grad = ctx.createLinearGradient(0, 0, 0, -petalLen);
        grad.addColorStop(0, this.colors[2]);
        grad.addColorStop(0.4, this.colors[1]);
        grad.addColorStop(0.8, this.colors[0]);
        grad.addColorStop(1, this.colors[0] + "aa");
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        // Left side of petal with realistic curve
        ctx.bezierCurveTo(
          -petalW * 0.5, -petalLen * 0.2,
          -petalW * 0.6, -petalLen * 0.6,
          0, -petalLen
        );
        // Right side
        ctx.bezierCurveTo(
          petalW * 0.6, -petalLen * 0.6,
          petalW * 0.5, -petalLen * 0.2,
          0, 0
        );
        ctx.fill();

        // Petal vein (central line detail)
        if (p > 0.5) {
          ctx.strokeStyle = this.colors[0] + "55";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(0, -4);
          ctx.lineTo(0, -petalLen * 0.75);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Inner smaller petals
      for (let i = 0; i < this.petals; i++) {
        const angle = (i / this.petals) * Math.PI * 2 + Math.PI / this.petals;
        ctx.save();
        ctx.rotate(angle);
        const grad2 = ctx.createLinearGradient(0, 0, 0, -petalLen * 0.52);
        grad2.addColorStop(0, this.colors[3] || this.colors[2]);
        grad2.addColorStop(1, this.colors[2] + "cc");
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
          -petalW * 0.3, -petalLen * 0.15,
          -petalW * 0.35, -petalLen * 0.4,
          0, -petalLen * 0.52
        );
        ctx.bezierCurveTo(
          petalW * 0.35, -petalLen * 0.4,
          petalW * 0.3, -petalLen * 0.15,
          0, 0
        );
        ctx.fill();
        ctx.restore();
      }

      // Center disc — realistic yellow/gold with texture
      const discR = 13 * p;
      const cGrad = ctx.createRadialGradient(-2 * p, -2 * p, 0, 0, 0, discR);
      cGrad.addColorStop(0, "#fff8c0");
      cGrad.addColorStop(0.3, "#F5C518");
      cGrad.addColorStop(0.65, "#d4a010");
      cGrad.addColorStop(1, "#9a6a05");
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(0, 0, discR, 0, Math.PI * 2);
      ctx.fill();

      // Stamen dots around center disc
      if (p > 0.55) {
        const stamens = 12;
        for (let i = 0; i < stamens; i++) {
          const da = (i / stamens) * Math.PI * 2;
          const sr = discR * 0.75;
          ctx.fillStyle = i % 2 === 0 ? "#fde68a" : "#1d4ed8";
          ctx.beginPath();
          ctx.arc(Math.cos(da) * sr, Math.sin(da) * sr, 1.3 * p, 0, Math.PI * 2);
          ctx.fill();
        }
        // Tiny highlight on center
        ctx.fillStyle = "rgba(255,255,220,0.6)";
        ctx.beginPath();
        ctx.arc(-3 * p, -3 * p, 4 * p, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  const positions = [
    { x: cx, y: cy, delay: 0, scale: 1.6 }, { x: cx-120, y: cy+80, delay: 300, scale: 1.1 },
    { x: cx+130, y: cy+60, delay: 450, scale: 1.2 }, { x: cx-80, y: cy-130, delay: 550, scale: 1.0 },
    { x: cx+100, y: cy-120, delay: 650, scale: 0.9 }, { x: cx-220, y: cy-30, delay: 750, scale: 0.85 },
    { x: cx+230, y: cy-10, delay: 800, scale: 0.9 }, { x: cx+40, y: cy+200, delay: 900, scale: 0.8 },
    { x: cx-160, y: cy+200, delay: 950, scale: 0.75 }, { x: cx+180, y: cy+190, delay: 1000, scale: 0.7 },
    { x: cx-300, y: cy+150, delay: 1100, scale: 0.65 }, { x: cx+300, y: cy+130, delay: 1150, scale: 0.6 },
    { x: cx-250, y: cy-180, delay: 1200, scale: 0.65 }, { x: cx+260, y: cy-170, delay: 1250, scale: 0.6 },
    { x: cx, y: cy-260, delay: 1300, scale: 0.7 }, { x: cx, y: cy+300, delay: 1350, scale: 0.65 },
  ];
  positions.forEach((pos, i) => flowers.push(new RealisticFlower(pos.x, pos.y, pos.delay, pos.scale, COLORS[i % COLORS.length])));

  // Golden sparkle dust
  const sparkles = [];
  class Sparkle {
    constructor() { this.reset(); }
    reset() {
      this.x = cx + (Math.random()-0.5)*canvas.width*0.9;
      this.y = cy + (Math.random()-0.5)*canvas.height*0.9;
      this.size = 1+Math.random()*3;
      this.alpha = 0; this.maxAlpha = 0.4+Math.random()*0.5;
      this.speed = 0.02+Math.random()*0.03; this.growing = true;
      this.color = Math.random() < 0.5 ? "#fde68a" : "#7ec8ff";
    }
    update() {
      if (this.growing) { this.alpha+=this.speed; if(this.alpha>=this.maxAlpha) this.growing=false; }
      else { this.alpha-=this.speed*0.7; if(this.alpha<=0) this.reset(); }
    }
    draw(ctx) {
      ctx.save(); ctx.globalAlpha=this.alpha; ctx.fillStyle=this.color;
      ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }
  for (let i = 0; i < 50; i++) sparkles.push(new Sparkle());

  const startTime = performance.now();
  let fadeStarted = false;

  function animate(now) {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Deep midnight navy background gradient
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(canvas.width, canvas.height) * 0.7);
    bgGrad.addColorStop(0, "#08132b");
    bgGrad.addColorStop(0.4, "#050b1c");
    bgGrad.addColorStop(1, "#030612");
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Warm celestial sky glow
    if (elapsed > 200) {
      const gp = Math.min(1, (elapsed - 200) / 1800);
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 340 * gp);
      glowGrad.addColorStop(0, `rgba(96, 165, 250, ${0.28 * gp})`);
      glowGrad.addColorStop(0.5, `rgba(29, 78, 216, ${0.12 * gp})`);
      glowGrad.addColorStop(1, "rgba(29, 78, 216, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    sparkles.forEach(s => { s.update(); s.draw(ctx); });
    flowers.forEach(f => { f.update(elapsed); f.draw(ctx); });

    if (elapsed > 1500 && !bloomText.classList.contains("visible")) bloomText.classList.add("visible");
    if (elapsed > 4000 && !fadeStarted) {
      fadeStarted = true;
      flowers.forEach(f => { if (f.started) f.fadeOut = true; });
      bloomText.style.transition = "opacity 1.2s ease";
      bloomText.style.opacity = "0";
    }
    if (elapsed > 5500) { overlay.classList.add("hidden"); showBirthdayScreen(); return; }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// =============================================
// =============================================
// INTERACTIVE COMPONENT 1: DO YOU LOVE ME?
// =============================================
let loveDodgeAttempts = 0;
const NO_BUTTON_TEXTS = [
  "Enggak 😒",
  "Yakin nih? 🥺",
  "Eits gak kena! 😜",
  "Gabisa dipencet wlee 😝",
  "Tombol ini rusak loh! 😂",
  "Pencet yang IYA aja sayang! 🥰",
  "Gamau ah kabur terus 🏃💨",
  "Gak bakal bisa diklik! 💖",
  "Masih maksa aja sihh 🤣",
  "Udah klik yang IYA aja deh! 💍"
];

function initLoveQuestionPage() {
  const btnNo = document.getElementById("btnLoveNo");
  const btnYes = document.getElementById("btnLoveYes");
  const hint = document.getElementById("dodgeHint");
  loveDodgeAttempts = 0;

  if (btnNo) {
    btnNo.classList.remove("runaway");
    btnNo.style.position = "";
    btnNo.style.left = "";
    btnNo.style.top = "";
    btnNo.textContent = NO_BUTTON_TEXTS[0];

    btnNo.onmouseenter = moveLoveNoButton;
    btnNo.ontouchstart = (e) => {
      e.preventDefault();
      moveLoveNoButton();
    };
    btnNo.onclick = (e) => {
      e.preventDefault();
      moveLoveNoButton();
    };
  }

  if (btnYes) {
    btnYes.style.transform = "scale(1)";
  }
  if (hint) {
    hint.textContent = "Ayo coba pencet kalau bisa~ 😜";
  }
}

function moveLoveNoButton() {
  const btnNo = document.getElementById("btnLoveNo");
  const btnYes = document.getElementById("btnLoveYes");
  const hint = document.getElementById("dodgeHint");
  if (!btnNo) return;

  loveDodgeAttempts++;
  btnNo.classList.add("runaway");

  const margin = 40;
  const btnW = btnNo.offsetWidth || 100;
  const btnH = btnNo.offsetHeight || 44;
  const maxX = window.innerWidth - btnW - margin;
  const maxY = window.innerHeight - btnH - margin;

  const randX = Math.max(margin, Math.floor(Math.random() * maxX));
  const randY = Math.max(margin, Math.floor(Math.random() * maxY));

  btnNo.style.left = randX + "px";
  btnNo.style.top = randY + "px";

  const textIdx = Math.min(loveDodgeAttempts, NO_BUTTON_TEXTS.length - 1);
  btnNo.textContent = NO_BUTTON_TEXTS[textIdx];

  if (btnYes) {
    const scale = Math.min(1.6, 1 + loveDodgeAttempts * 0.08);
    btnYes.style.transform = "scale(" + scale + ")";
  }

  if (hint) {
    hint.textContent = "Hahaha tombol ini gabisa dipencet! Pencet yang IYA ajaa~ 🥰 (" + loveDodgeAttempts + "x kabur)";
  }
}

function handleLoveYes() {
  const modal = document.getElementById("loveYesModal");
  if (modal) modal.classList.remove("hidden");
  triggerHeartShower(50);
}

function closeLoveYesModal() {
  const modal = document.getElementById("loveYesModal");
  if (modal) modal.classList.add("hidden");
}

// =============================================
// INTERACTIVE COMPONENT 2: GAME XOXO (TIC-TAC-TOE)
// =============================================
let xoxoBoard = Array(9).fill(null);
let xoxoTurn = "X"; // X = Laura (💖), O = Hapis (💙)
let xoxoMode = "ai"; // 'ai' or '2p'
let xoxoScores = { X: 0, O: 0, tie: 0 };
let xoxoGameOver = false;
let xoxoAiThinking = false;

const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function initXoxoGame() {
  const cells = document.querySelectorAll(".xoxo-cell");
  cells.forEach((cell, idx) => {
    cell.onclick = () => handleXoxoCellClick(idx);
  });
  updateXoxoUI();
}

function setXoxoMode(mode) {
  xoxoMode = mode;
  const btnAI = document.getElementById("btnModeAI");
  const btn2P = document.getElementById("btnMode2P");
  if (btnAI) btnAI.classList.toggle("active", mode === "ai");
  if (btn2P) btn2P.classList.toggle("active", mode === "2p");
  resetXoxoBoard();
}

function handleXoxoCellClick(idx) {
  if (xoxoGameOver || xoxoBoard[idx] !== null || xoxoAiThinking) return;

  makeXoxoMove(idx, xoxoTurn);

  if (checkXoxoEnd()) return;

  xoxoTurn = xoxoTurn === "X" ? "O" : "X";
  updateXoxoUI();

  if (xoxoMode === "ai" && xoxoTurn === "O" && !xoxoGameOver) {
    xoxoAiThinking = true;
    const status = document.getElementById("xoxoStatus");
    if (status) status.textContent = "Hapis lagi mikir... 💙";

    setTimeout(() => {
      const aiMove = getBestAiMove();
      if (aiMove !== -1) {
        makeXoxoMove(aiMove, "O");
        checkXoxoEnd();
        xoxoTurn = "X";
      }
      xoxoAiThinking = false;
      updateXoxoUI();
    }, 450);
  }
}

function makeXoxoMove(idx, player) {
  xoxoBoard[idx] = player;
  const cell = document.querySelector('.xoxo-cell[data-idx="' + idx + '"]');
  if (cell) {
    cell.textContent = player === "X" ? "💖" : "💙";
    cell.disabled = true;
  }
}

function checkXoxoEnd() {
  for (let combo of WIN_COMBOS) {
    const [a, b, c] = combo;
    if (xoxoBoard[a] && xoxoBoard[a] === xoxoBoard[b] && xoxoBoard[a] === xoxoBoard[c]) {
      xoxoGameOver = true;
      highlightWinningCells(combo);
      const winner = xoxoBoard[a];
      xoxoScores[winner]++;
      updateXoxoScores();

      const status = document.getElementById("xoxoStatus");
      if (winner === "X") {
        if (status) status.textContent = "Laura Menang! Kamu yang paling hebat! 🏆💖";
        triggerHeartShower(40);
      } else {
        if (status) status.textContent = "Hapis Menang! Tapi hadiahnya tetap buat kamu! 🎁💙";
      }
      return true;
    }
  }

  if (!xoxoBoard.includes(null)) {
    xoxoGameOver = true;
    xoxoScores.tie++;
    updateXoxoScores();
    const status = document.getElementById("xoxoStatus");
    if (status) status.textContent = "Seri! Memang jodoh kita seimbang banget! 🥰✨";
    return true;
  }

  return false;
}

function highlightWinningCells(combo) {
  combo.forEach(idx => {
    const cell = document.querySelector('.xoxo-cell[data-idx="' + idx + '"]');
    if (cell) cell.classList.add("win-cell");
  });
}

function getBestAiMove() {
  for (let combo of WIN_COMBOS) {
    const [a, b, c] = combo;
    if (xoxoBoard[a] === "O" && xoxoBoard[b] === "O" && xoxoBoard[c] === null) return c;
    if (xoxoBoard[a] === "O" && xoxoBoard[c] === "O" && xoxoBoard[b] === null) return b;
    if (xoxoBoard[b] === "O" && xoxoBoard[c] === "O" && xoxoBoard[a] === null) return a;
  }
  for (let combo of WIN_COMBOS) {
    const [a, b, c] = combo;
    if (xoxoBoard[a] === "X" && xoxoBoard[b] === "X" && xoxoBoard[c] === null) return c;
    if (xoxoBoard[a] === "X" && xoxoBoard[c] === "X" && xoxoBoard[b] === null) return b;
    if (xoxoBoard[b] === "X" && xoxoBoard[c] === "X" && xoxoBoard[a] === null) return a;
  }
  if (xoxoBoard[4] === null) return 4;
  const available = xoxoBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  return -1;
}

function updateXoxoScores() {
  const elX = document.getElementById("scoreX");
  const elO = document.getElementById("scoreO");
  const elTie = document.getElementById("scoreTie");
  if (elX) elX.textContent = xoxoScores.X;
  if (elO) elO.textContent = xoxoScores.O;
  if (elTie) elTie.textContent = xoxoScores.tie;
}

function updateXoxoUI() {
  const cardX = document.getElementById("scoreCardX");
  const cardO = document.getElementById("scoreCardO");
  if (cardX) cardX.classList.toggle("active", xoxoTurn === "X" && !xoxoGameOver);
  if (cardO) cardO.classList.toggle("active", xoxoTurn === "O" && !xoxoGameOver);

  if (!xoxoGameOver && !xoxoAiThinking) {
    const status = document.getElementById("xoxoStatus");
    if (status) {
      status.textContent = xoxoTurn === "X" ? "Giliran Laura 💖" : (xoxoMode === "ai" ? "Giliran Hapis AI 🤖" : "Giliran Hapis 💙");
    }
  }
}

function resetXoxoBoard() {
  xoxoBoard = Array(9).fill(null);
  xoxoTurn = "X";
  xoxoGameOver = false;
  xoxoAiThinking = false;

  const cells = document.querySelectorAll(".xoxo-cell");
  cells.forEach(cell => {
    cell.textContent = "";
    cell.disabled = false;
    cell.classList.remove("win-cell");
  });

  updateXoxoUI();
}

// =============================================
// INTERACTIVE COMPONENT 3: GAME LUCU (TANGKAP HATIKU)
// =============================================
let catchCanvas = null;
let catchCtx = null;
let catchAnimFrame = null;
let catchTimerInterval = null;
let catchScore = 0;
const CATCH_TARGET_SCORE = 100;
let catchTimeLeft = 30;
let catchGameRunning = false;

let catchPlayer = {
  x: 180,
  y: 330,
  width: 70,
  height: 38,
  speed: 8
};

let catchItems = [];
let catchFloatTexts = [];
let keyMoveLeft = false;
let keyMoveRight = false;

const CATCH_ITEM_TYPES = [
  { type: "heart", emoji: "💖", points: 10, speed: 2.2, chance: 0.45 },
  { type: "star", emoji: "⭐", points: 15, speed: 2.8, chance: 0.20 },
  { type: "letter", emoji: "💌", points: 20, speed: 1.8, chance: 0.15 },
  { type: "rose", emoji: "🌹", points: 25, speed: 2.4, chance: 0.10 },
  { type: "cloud", emoji: "🌧️", points: -5, speed: 3.0, chance: 0.10 }
];

function initCatchGameCanvas() {
  catchCanvas = document.getElementById("catchCanvas");
  if (!catchCanvas) return;
  catchCtx = catchCanvas.getContext("2d");

  window.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keyMoveLeft = true;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keyMoveRight = true;
  });
  window.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keyMoveLeft = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keyMoveRight = false;
  });

  const updatePointer = (clientX) => {
    if (!catchCanvas) return;
    const rect = catchCanvas.getBoundingClientRect();
    const scaleX = catchCanvas.width / rect.width;
    const canvasX = (clientX - rect.left) * scaleX;
    catchPlayer.x = Math.max(catchPlayer.width / 2, Math.min(catchCanvas.width - catchPlayer.width / 2, canvasX));
  };

  catchCanvas.addEventListener("mousemove", e => {
    if (catchGameRunning) updatePointer(e.clientX);
  });
  catchCanvas.addEventListener("touchmove", e => {
    if (catchGameRunning && e.touches.length > 0) {
      updatePointer(e.touches[0].clientX);
    }
  }, { passive: true });

  const btnLeft = document.getElementById("btnMoveLeft");
  const btnRight = document.getElementById("btnMoveRight");
  if (btnLeft && btnRight) {
    const bindBtn = (el, isLeft) => {
      const setTrue = (e) => { e.preventDefault(); if (isLeft) keyMoveLeft = true; else keyMoveRight = true; };
      const setFalse = (e) => { e.preventDefault(); if (isLeft) keyMoveLeft = false; else keyMoveRight = false; };
      el.onmousedown = setTrue; el.onmouseup = setFalse; el.onmouseleave = setFalse;
      el.ontouchstart = setTrue; el.ontouchend = setFalse;
    };
    bindBtn(btnLeft, true);
    bindBtn(btnRight, false);
  }

  drawCatchStatic();
}

function drawCatchStatic() {
  if (!catchCtx || !catchCanvas) return;
  catchCtx.clearRect(0, 0, catchCanvas.width, catchCanvas.height);
  drawCatchPlayer();
}

function startCatchGame() {
  const startOv = document.getElementById("catchStartOverlay");
  const winOv = document.getElementById("catchWinOverlay");
  const loseOv = document.getElementById("catchLoseOverlay");
  if (startOv) startOv.classList.add("hidden");
  if (winOv) winOv.classList.add("hidden");
  if (loseOv) loseOv.classList.add("hidden");

  catchScore = 0;
  catchTimeLeft = 30;
  catchItems = [];
  catchFloatTexts = [];
  catchGameRunning = true;
  catchPlayer.x = catchCanvas.width / 2;

  updateCatchStats();

  if (catchTimerInterval) clearInterval(catchTimerInterval);
  catchTimerInterval = setInterval(() => {
    if (!catchGameRunning) return;
    catchTimeLeft--;
    updateCatchStats();

    if (catchTimeLeft <= 0) {
      endCatchGame(false);
    }
  }, 1000);

  if (catchAnimFrame) cancelAnimationFrame(catchAnimFrame);
  catchAnimFrame = requestAnimationFrame(catchGameLoop);
}

function catchGameLoop() {
  if (!catchGameRunning || !catchCtx || !catchCanvas) return;

  if (keyMoveLeft) catchPlayer.x = Math.max(catchPlayer.width / 2, catchPlayer.x - catchPlayer.speed);
  if (keyMoveRight) catchPlayer.x = Math.min(catchCanvas.width - catchPlayer.width / 2, catchPlayer.x + catchPlayer.speed);

  if (Math.random() < 0.045 && catchItems.length < 8) {
    spawnCatchItem();
  }

  catchCtx.clearRect(0, 0, catchCanvas.width, catchCanvas.height);
  drawCatchBackground();

  for (let i = catchItems.length - 1; i >= 0; i--) {
    const item = catchItems[i];
    item.y += item.speed;

    const basketTop = catchPlayer.y - catchPlayer.height / 2;
    const basketBottom = catchPlayer.y + catchPlayer.height / 2;
    const basketLeft = catchPlayer.x - catchPlayer.width / 2;
    const basketRight = catchPlayer.x + catchPlayer.width / 2;

    if (item.y >= basketTop && item.y <= basketBottom + 10 && item.x >= basketLeft - 10 && item.x <= basketRight + 10) {
      catchScore = Math.max(0, catchScore + item.points);
      catchFloatTexts.push({
        text: (item.points > 0 ? "+" + item.points : "" + item.points),
        color: item.points > 0 ? "#f472b6" : "#60a5fa",
        x: item.x,
        y: item.y,
        life: 1.0
      });
      catchItems.splice(i, 1);
      updateCatchStats();

      if (catchScore >= CATCH_TARGET_SCORE) {
        endCatchGame(true);
        return;
      }
      continue;
    }

    if (item.y > catchCanvas.height + 20) {
      catchItems.splice(i, 1);
      continue;
    }

    catchCtx.font = "24px sans-serif";
    catchCtx.textAlign = "center";
    catchCtx.textBaseline = "middle";
    catchCtx.fillText(item.emoji, item.x, item.y);
  }

  drawCatchPlayer();

  for (let i = catchFloatTexts.length - 1; i >= 0; i--) {
    const ft = catchFloatTexts[i];
    ft.y -= 1.2;
    ft.life -= 0.025;
    if (ft.life <= 0) {
      catchFloatTexts.splice(i, 1);
      continue;
    }
    catchCtx.save();
    catchCtx.globalAlpha = Math.max(0, ft.life);
    catchCtx.font = "bold 16px 'Raleway', sans-serif";
    catchCtx.fillStyle = ft.color;
    catchCtx.textAlign = "center";
    catchCtx.fillText(ft.text, ft.x, ft.y);
    catchCtx.restore();
  }

  catchAnimFrame = requestAnimationFrame(catchGameLoop);
}

function spawnCatchItem() {
  const rand = Math.random();
  let cumulative = 0;
  let chosen = CATCH_ITEM_TYPES[0];
  for (let it of CATCH_ITEM_TYPES) {
    cumulative += it.chance;
    if (rand <= cumulative) {
      chosen = it;
      break;
    }
  }

  catchItems.push({
    x: 25 + Math.random() * (catchCanvas.width - 50),
    y: -20,
    type: chosen.type,
    emoji: chosen.emoji,
    points: chosen.points,
    speed: chosen.speed + Math.random() * 0.8
  });
}

function drawCatchPlayer() {
  if (!catchCtx) return;
  const px = catchPlayer.x;
  const py = catchPlayer.y;

  catchCtx.save();
  catchCtx.font = "32px sans-serif";
  catchCtx.textAlign = "center";
  catchCtx.textBaseline = "middle";
  catchCtx.fillText("🧺", px, py);

  catchCtx.font = "14px sans-serif";
  catchCtx.fillText("💖", px, py - 6);
  catchCtx.restore();
}

function drawCatchBackground() {
  if (!catchCtx) return;
  catchCtx.save();
  catchCtx.fillStyle = "rgba(255, 255, 255, 0.25)";
  catchCtx.fillRect(40, 50, 2, 2);
  catchCtx.fillRect(120, 80, 1.5, 1.5);
  catchCtx.fillRect(280, 40, 2, 2);
  catchCtx.fillRect(320, 110, 1.5, 1.5);
  catchCtx.fillRect(200, 140, 2, 2);
  catchCtx.restore();
}

function updateCatchStats() {
  const elScore = document.getElementById("catchScore");
  const elTimer = document.getElementById("catchTimer");
  const elProgress = document.getElementById("catchProgress");

  if (elScore) elScore.textContent = catchScore + " / " + CATCH_TARGET_SCORE;
  if (elTimer) elTimer.textContent = catchTimeLeft + "s";
  if (elProgress) {
    const pct = Math.min(100, Math.floor((catchScore / CATCH_TARGET_SCORE) * 100));
    elProgress.style.width = pct + "%";
  }
}

function endCatchGame(won) {
  catchGameRunning = false;
  if (catchTimerInterval) clearInterval(catchTimerInterval);
  if (catchAnimFrame) cancelAnimationFrame(catchAnimFrame);

  if (won) {
    const winOv = document.getElementById("catchWinOverlay");
    if (winOv) winOv.classList.remove("hidden");
    triggerHeartShower(60);
  } else {
    const loseOv = document.getElementById("catchLoseOverlay");
    if (loseOv) loseOv.classList.remove("hidden");
  }
}

function triggerHeartShower(count = 40) {
  const container = document.getElementById("petals-container");
  if (!container) return;
  const emojis = ["💖", "💕", "🥰", "✨", "⭐", "🌸", "🤍", "🎉", "👑"];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const p = document.createElement("div");
      p.className = "petal";
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.cssText = "left:" + (Math.random() * 100) + "%;font-size:" + (16 + Math.random() * 22) + "px;animation-duration:" + (2.5 + Math.random() * 3.5) + "s;animation-delay:0s;z-index:9999;";
      container.appendChild(p);
      setTimeout(() => p.remove(), 7000);
    }, i * 60);
  }
}


// === LAVENDER FLOWER CLOSING PAGE ===
let blueFlowerStarted = false;
function startBlueFlowerAnimation() {
  if (blueFlowerStarted) return;
  blueFlowerStarted = true;

  const canvas = document.getElementById("blueFlowerCanvas");
  if (!canvas) return;
  canvas.width = canvas.offsetWidth || window.innerWidth;
  canvas.height = canvas.offsetHeight || window.innerHeight;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;

  // Lavender color palette
  const LAV_COLORS = [
    ["#6a2fa0", "#9b72cf", "#c9a0f5", "#e8d5ff"],
    ["#5a1f90", "#8b5abf", "#b490e8", "#dcc8ff"],
    ["#7a3fb0", "#aa70df", "#d4a8f8", "#f0e0ff"],
    ["#4a1878", "#7a4ab8", "#b080e0", "#dac0f8"],
    ["#8040b8", "#b070d8", "#d8a8f4", "#f4e4ff"],
  ];

  // Botanical Lavender Stalk with floret whorls
  class LavenderStalk {
    constructor(x, baseY, height, delay, swaySpeed, swayAmp) {
      this.x = x;
      this.baseY = baseY;
      this.targetH = height;
      this.currentH = 0;
      this.delay = delay;
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = swaySpeed;
      this.swayAmp = swayAmp;
      this.alpha = 0;
      this.started = false;
    }
    update(t) {
      if (t < this.delay) return;
      this.started = true;
      this.swayAngle += this.swaySpeed;
      const progress = Math.min(1, (t - this.delay) / 1800);
      this.currentH = this.targetH * progress;
      this.alpha = Math.min(0.85, progress * 1.2);
    }
    draw(ctx) {
      if (!this.started || this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;

      const sway = Math.sin(this.swayAngle) * this.swayAmp;
      const tipX = this.x + sway;
      const tipY = this.baseY - this.currentH;

      // Stem
      const sg = ctx.createLinearGradient(this.x, this.baseY, tipX, tipY);
      sg.addColorStop(0, "#2d3e2d");
      sg.addColorStop(0.5, "#436143");
      sg.addColorStop(1, "#5b4a70");
      ctx.strokeStyle = sg;
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(this.x, this.baseY);
      ctx.quadraticCurveTo(this.x + sway * 0.4, this.baseY - this.currentH * 0.5, tipX, tipY);
      ctx.stroke();

      // Narrow linear lavender leaves
      const leafCount = 4;
      for (let i = 1; i <= leafCount; i++) {
        const ly = this.baseY - this.currentH * (0.2 + i * 0.12);
        const lx = this.x + sway * (0.2 + i * 0.12);
        const lSide = i % 2 === 0 ? 1 : -1;
        ctx.fillStyle = "#3e563e";
        ctx.beginPath();
        ctx.ellipse(lx + lSide * 8, ly, 10, 2.2, lSide * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // Florets whorled along upper stalk
      if (this.currentH > this.targetH * 0.4) {
        const whorlStart = this.baseY - this.currentH * 0.5;
        const whorls = 12;
        for (let j = 0; j < whorls; j++) {
          const frac = j / whorls;
          const wy = whorlStart - frac * (this.currentH * 0.48);
          const wx = this.x + sway * (0.5 + frac * 0.5);
          const floretW = 5 + (1 - frac) * 3;
          const floretH = 3.5 + (1 - frac) * 2;

          // Left and right bud/calyx
          const shades = ["#8a5eb8", "#a678d4", "#c094eb", "#7446a3"];
          ctx.fillStyle = shades[j % shades.length];

          ctx.beginPath();
          ctx.ellipse(wx - floretW * 0.6, wy, floretW * 0.7, floretH * 0.6, -0.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.ellipse(wx + floretW * 0.6, wy, floretW * 0.7, floretH * 0.6, 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Center tip
          ctx.fillStyle = "#d8b6f8";
          ctx.beginPath();
          ctx.ellipse(wx, wy - 1.5, floretW * 0.5, floretH * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  // Realistic layered Lavender Bloom flower
  class LavenderFlower {
    constructor(x, y, delay, scale, colorSet) {
      this.x = x; this.y = y; this.delay = delay; this.scale = scale; this.colors = colorSet;
      this.progress = 0; this.petals = 5 + Math.floor(Math.random() * 3);
      this.rotation = Math.random() * Math.PI * 2;
      this.started = false; this.alpha = 0;
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.008 + Math.random() * 0.008;
      this.swayAmp = (Math.random() - 0.5) * 0.06;
    }
    update(t) {
      if (t < this.delay) return;
      this.started = true;
      this.swayAngle += this.swaySpeed;
      this.progress = Math.min(1, (t - this.delay) / 2400);
      this.alpha = Math.min(1, this.progress * 2.5);
    }
    draw(ctx) {
      if (!this.started || this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation + Math.sin(this.swayAngle) * this.swayAmp);
      ctx.scale(this.scale, this.scale);

      const p = this.progress;
      const petalLen = 50 * p;
      const petalW  = 22 * p;

      // Stem
      if (this.scale > 0.75 && p > 0.3) {
        const stemH = 32 * p;
        ctx.save();
        const sg = ctx.createLinearGradient(0, 0, 0, stemH);
        sg.addColorStop(0, "#4a5a40");
        sg.addColorStop(1, "#2e3a28");
        ctx.strokeStyle = sg;
        ctx.lineWidth = 2.5 * p;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(2, stemH * 0.5, 0, stemH);
        ctx.stroke();

        // Small leaf
        if (p > 0.5) {
          ctx.globalAlpha = this.alpha * (p - 0.5) * 2;
          ctx.fillStyle = "#4a6345";
          ctx.beginPath();
          ctx.ellipse(7, stemH * 0.55, 8, 3, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Outer petals — realistic bezier lavender shape
      for (let i = 0; i < this.petals; i++) {
        const angle = (i / this.petals) * Math.PI * 2;
        ctx.save();
        ctx.rotate(angle);

        const grad = ctx.createLinearGradient(0, 0, 0, -petalLen);
        grad.addColorStop(0, this.colors[2]);
        grad.addColorStop(0.35, this.colors[1]);
        grad.addColorStop(0.75, this.colors[0]);
        grad.addColorStop(1, this.colors[0] + "99");
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
          -petalW * 0.55, -petalLen * 0.18,
          -petalW * 0.65, -petalLen * 0.62,
          0, -petalLen
        );
        ctx.bezierCurveTo(
          petalW * 0.65, -petalLen * 0.62,
          petalW * 0.55, -petalLen * 0.18,
          0, 0
        );
        ctx.fill();

        // Delicate petal veins
        if (p > 0.45) {
          ctx.strokeStyle = this.colors[0] + "44";
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(0, -5);
          ctx.lineTo(0, -petalLen * 0.72);
          ctx.stroke();

          ctx.strokeStyle = this.colors[0] + "22";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(0, -petalLen * 0.3);
          ctx.lineTo(-petalW * 0.3, -petalLen * 0.5);
          ctx.moveTo(0, -petalLen * 0.3);
          ctx.lineTo(petalW * 0.3, -petalLen * 0.5);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Inner secondary petals
      for (let i = 0; i < this.petals; i++) {
        const angle = (i / this.petals) * Math.PI * 2 + Math.PI / this.petals;
        ctx.save();
        ctx.rotate(angle);
        const grad2 = ctx.createLinearGradient(0, 0, 0, -petalLen * 0.55);
        grad2.addColorStop(0, this.colors[3] || this.colors[2]);
        grad2.addColorStop(1, this.colors[2] + "cc");
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
          -petalW * 0.32, -petalLen * 0.16,
          -petalW * 0.38, -petalLen * 0.44,
          0, -petalLen * 0.55
        );
        ctx.bezierCurveTo(
          petalW * 0.38, -petalLen * 0.44,
          petalW * 0.32, -petalLen * 0.16,
          0, 0
        );
        ctx.fill();
        ctx.restore();
      }

      // Center disc
      const discR = 13 * p;
      const cGrad = ctx.createRadialGradient(-2 * p, -2 * p, 0, 0, 0, discR);
      cGrad.addColorStop(0, "#f7f0ff");
      cGrad.addColorStop(0.3, "#c9a0f5");
      cGrad.addColorStop(0.65, "#9060c8");
      cGrad.addColorStop(1, "#5a2080");
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(0, 0, discR, 0, Math.PI * 2);
      ctx.fill();

      // Stamen dots
      if (p > 0.55) {
        const stamens = 12;
        for (let i = 0; i < stamens; i++) {
          const da = (i / stamens) * Math.PI * 2;
          const sr = discR * 0.72;
          ctx.fillStyle = i % 2 === 0 ? "#b490e8" : "#e0c2ff";
          ctx.beginPath();
          ctx.arc(Math.cos(da) * sr, Math.sin(da) * sr, 1.3 * p, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "rgba(255, 245, 255, 0.65)";
        ctx.beginPath();
        ctx.arc(-3 * p, -3 * p, 4 * p, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Floating gentle petals drifting across screen
  class FloatingPetal {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = -20 - Math.random() * 50;
      this.size = 5 + Math.random() * 8;
      this.speedY = 0.5 + Math.random() * 1.2;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.rot = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.03;
      this.alpha = 0.3 + Math.random() * 0.45;
      this.color = ["#b490e8", "#c9a0f5", "#d8b6f8", "#a678d4"][Math.floor(Math.random() * 4)];
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.y * 0.02) * 0.5;
      this.rot += this.rotSpeed;
      if (this.y > H + 20) this.reset();
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 0.5, this.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Lavender sparkles
  class LavSparkle {
    constructor() { this.reset(); }
    reset() {
      this.x = cx + (Math.random() - 0.5) * W * 0.95;
      this.y = cy + (Math.random() - 0.5) * H * 0.95;
      this.size = 1 + Math.random() * 2.8;
      this.alpha = 0;
      this.maxAlpha = 0.4 + Math.random() * 0.5;
      this.speed = 0.012 + Math.random() * 0.022;
      this.growing = true;
      this.color = ["#c9a0f5", "#e8d5ff", "#b490e8", "#f4e4ff", "#F5C518"][Math.floor(Math.random() * 5)];
    }
    update() {
      if (this.growing) {
        this.alpha += this.speed;
        if (this.alpha >= this.maxAlpha) this.growing = false;
      } else {
        this.alpha -= this.speed * 0.6;
        if (this.alpha <= 0) this.reset();
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const stalks = [];
  const flowers = [];
  const sparkles = [];
  const floatingPetals = [];

  // Generate lavender stalks along the background / bottom
  const stalkCount = Math.floor(W / 45);
  for (let s = 0; s < stalkCount; s++) {
    const sx = (s / stalkCount) * W + (Math.random() - 0.5) * 30;
    const sH = 140 + Math.random() * 180;
    const sDelay = 150 + Math.random() * 800;
    const sSpeed = 0.012 + Math.random() * 0.015;
    const sAmp = 12 + Math.random() * 18;
    stalks.push(new LavenderStalk(sx, H + 10, sH, sDelay, sSpeed, sAmp));
  }

  for (let i = 0; i < 65; i++) sparkles.push(new LavSparkle());
  for (let i = 0; i < 24; i++) floatingPetals.push(new FloatingPetal());

  // Flower positions — center blooms first
  const fpositions = [
    { x: cx, y: cy - 20, delay: 0, scale: 1.85 },
    { x: cx - 140, y: cy + 60, delay: 350, scale: 1.25 },
    { x: cx + 150, y: cy + 40, delay: 500, scale: 1.3 },
    { x: cx - 80, y: cy - 150, delay: 650, scale: 1.1 },
    { x: cx + 100, y: cy - 140, delay: 750, scale: 1.0 },
    { x: cx - 250, y: cy - 30, delay: 850, scale: 0.9 },
    { x: cx + 260, y: cy - 20, delay: 900, scale: 0.95 },
    { x: cx + 40, y: cy + 200, delay: 1000, scale: 0.9 },
    { x: cx - 180, y: cy + 190, delay: 1050, scale: 0.8 },
    { x: cx + 200, y: cy + 180, delay: 1100, scale: 0.75 },
    { x: cx - 330, y: cy + 120, delay: 1180, scale: 0.7 },
    { x: cx + 330, y: cy + 100, delay: 1240, scale: 0.65 },
    { x: cx - 280, y: cy - 180, delay: 1300, scale: 0.7 },
    { x: cx + 290, y: cy - 165, delay: 1350, scale: 0.65 },
    { x: cx, y: cy - 270, delay: 1400, scale: 0.75 },
  ];

  fpositions.forEach((pos, i) => {
    flowers.push(new LavenderFlower(pos.x, pos.y, pos.delay, pos.scale, LAV_COLORS[i % LAV_COLORS.length]));
  });

  const startTime = performance.now();

  function animateLav(now) {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, W, H);

    // Deep lavender/purple twilight gradient
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.75);
    bgGrad.addColorStop(0, "#1d0c33");
    bgGrad.addColorStop(0.45, "#120822");
    bgGrad.addColorStop(1, "#070310");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Soft lavender ambient glow at center
    if (elapsed > 200) {
      const glowProgress = Math.min(1, (elapsed - 200) / 2200);
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 340 * glowProgress);
      glowGrad.addColorStop(0, `rgba(170, 120, 225, ${0.25 * glowProgress})`);
      glowGrad.addColorStop(0.5, `rgba(110, 65, 175, ${0.12 * glowProgress})`);
      glowGrad.addColorStop(1, "rgba(110, 65, 175, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // 1. Draw botanical stalks in the background
    stalks.forEach(s => { s.update(elapsed); s.draw(ctx); });

    // 2. Draw sparkles & floating petals
    sparkles.forEach(s => { s.update(); s.draw(ctx); });
    floatingPetals.forEach(p => { p.update(); p.draw(ctx); });

    // 3. Draw realistic foreground blooms
    flowers.forEach(f => { f.update(elapsed); f.draw(ctx); });

    // 4. Show card text after 2s
    const textEl = document.getElementById("blueFlowerText");
    if (textEl && elapsed > 2000) {
      const textProgress = Math.min(1, (elapsed - 2000) / 800);
      textEl.style.opacity = textProgress;
    }

    requestAnimationFrame(animateLav);
  }

  // Init text opacity
  const textEl = document.getElementById("blueFlowerText");
  if (textEl) textEl.style.opacity = "0";

  requestAnimationFrame(animateLav);
}

// Puff keyframe
const style = document.createElement("style");
style.textContent = `
  @keyframes puffUp {
    0%   { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-50px) scale(0.5); }
  }
  #smokewrap { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
`;
document.head.appendChild(style);
