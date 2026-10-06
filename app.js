/* ==========================================================
   CONFIGURACIÓN — edita solo esta parte para personalizar
   ========================================================== */
const CONFIG = {
  // Momento exacto del lanzamiento (hora de Ciudad de México, UTC-6).
  target: "2026-11-05T00:00:00-06:00",

  // Desde cuándo se llena la barra de progreso (el día que armaste la página).
  start: "2026-10-06T00:00:00-06:00",

  // Nombre por defecto. También puedes usar el enlace con ?para=Nombre
  friendName: "",

  // Archivo de música opcional (ponlo junto a index.html). Si no existe,
  // se usa un ambiente sintetizado original.
  musicFile: "musica.mp3",

  // Frases que rotan debajo del contador.
  quotes: [
    "El tiempo es un río, y pronto desembocará en Hyrule.",
    "Un héroe no llega tarde: llega cuando la ocarina suena.",
    "Guarda tus rupias. Afila tu espada. Falta poco.",
    "Hay praderas que solo recuerdas con el corazón.",
    "Dos aventureros, un reino por volver a recorrer.",
    "La Espada Maestra no se va a desenvainar sola."
  ],

  // Mensajes de Navi al hacerle clic.
  navi: [
    "¡Hey! ¡Listen!",
    "¡Ya casi es hora!",
    "¿Ya reservaste el día?",
    "Sigue la luz, aventurero.",
    "¡No olvides invitar a tu amigo!",
    "Yo ya estoy lista."
  ],

  // Mensaje del gran día.
  arrivedText: "¡Hoy se abre la puerta del tiempo!",
  arrivedLead: "El regreso a Hyrule ha comenzado"
};

/* ========================================================== */

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");
const targetMs = new Date(CONFIG.target).getTime();
const startMs  = new Date(CONFIG.start).getTime();

/* ---------- Nombre personalizado (?para=Nombre) ---------- */
(function setName() {
  const params = new URLSearchParams(location.search);
  const name = (params.get("para") || CONFIG.friendName || "").trim().slice(0, 40);
  if (name) {
    $("forLine").textContent = "Para " + name;
    document.title = name + " · Ocarina of Time · Cuenta regresiva";
  }
})();

/* ---------- Corazones ---------- */
(function hearts() {
  const svg = '<svg class="heart" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.2C.8 8.3 2.6 4.5 6.2 4.5c2 0 3.5 1.1 4.3 2.4l1.5 2 1.5-2c.8-1.3 2.3-2.4 4.3-2.4 3.6 0 5.4 3.8 3.8 7.3C19.5 16.4 12 21 12 21z"/></svg>';
  $("hearts").innerHTML = svg + svg + svg;
})();

/* ---------- Cuenta regresiva ---------- */
const els = { d: $("d"), h: $("h"), m: $("m"), s: $("s") };
const last = {};
let arrived = false;

function setNum(key, value) {
  const text = key === "d" && value > 99 ? String(value) : pad(value);
  if (last[key] !== text) {
    els[key].textContent = text;
    els[key].classList.remove("tick");
    void els[key].offsetWidth;
    els[key].classList.add("tick");
    last[key] = text;
  }
}

function update() {
  const now = Date.now();
  const diff = targetMs - now;

  if (diff <= 0) {
    if (!arrived) showArrival();
    return;
  }

  const totalSec = Math.floor(diff / 1000);
  setNum("d", Math.floor(totalSec / 86400));
  setNum("h", Math.floor((totalSec % 86400) / 3600));
  setNum("m", Math.floor((totalSec % 3600) / 60));
  setNum("s", totalSec % 60);

  const pct = Math.min(100, Math.max(0, ((now - startMs) / (targetMs - startMs)) * 100));
  $("pathFill").style.width = pct.toFixed(2) + "%";
}

function showArrival() {
  arrived = true;
  document.body.classList.add("arrived");
  $("lead").textContent = CONFIG.arrivedLead;
  const msg = document.createElement("p");
  msg.className = "arrived-msg";
  msg.textContent = CONFIG.arrivedText;
  $("clock").insertAdjacentElement("afterend", msg);
  burst(window.innerWidth / 2, window.innerHeight / 2, 220);
  naviSay("¡Es hoy! ¡Es hoy!", 6000);
}

/* ---------- Frases rotativas ---------- */
(function quotes() {
  const el = $("quote");
  let i = Math.floor(Math.random() * CONFIG.quotes.length);
  el.textContent = CONFIG.quotes[i];
  setInterval(() => {
    el.style.opacity = 0;
    setTimeout(() => {
      i = (i + 1) % CONFIG.quotes.length;
      el.textContent = CONFIG.quotes[i];
      el.style.opacity = .9;
    }, 600);
  }, 8000);
})();

/* ---------- Partículas (luciérnagas / hadas) ---------- */
const canvas = $("fx");
const ctx = canvas.getContext("2d");
let W = 0, H = 0, DPR = 1;
const motes = [];
const sparks = [];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.5 : 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const target = Math.round(Math.min(90, Math.max(30, (W * H) / 16000)));
  while (motes.length < target) motes.push(newMote(true));
  motes.length = target;
}

function newMote(anywhere) {
  return {
    x: Math.random() * W,
    y: anywhere ? Math.random() * H : H + 20,
    r: 0.8 + Math.random() * 2.6,
    vy: 0.12 + Math.random() * 0.4,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.004 + Math.random() * 0.012,
    swayAmp: 0.2 + Math.random() * 0.7,
    tw: Math.random() * Math.PI * 2,
    twSpeed: 0.01 + Math.random() * 0.03
  };
}

function burst(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 1.5 + Math.random() * 6;
    sparks.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 1.5,
      life: 1,
      decay: 0.008 + Math.random() * 0.014,
      r: 1.2 + Math.random() * 2.6
    });
  }
}

function cssVar(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

let colorCache = { gold: "#f2c744", soft: "#ffe9a3" };
function refreshColors() {
  colorCache = { gold: cssVar("--gold") || "#f2c744", soft: cssVar("--gold-soft") || "#ffe9a3" };
}

function frame() {
  ctx.clearRect(0, 0, W, H);
  ctx.globalCompositeOperation = "lighter";

  for (const m of motes) {
    m.y -= m.vy;
    m.sway += m.swaySpeed;
    m.tw += m.twSpeed;
    m.x += Math.sin(m.sway) * m.swayAmp;
    if (m.y < -20) Object.assign(m, newMote(false));
    const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(m.tw));
    const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 6);
    g.addColorStop(0, hexA(colorCache.soft, a));
    g.addColorStop(0.35, hexA(colorCache.gold, a * 0.45));
    g.addColorStop(1, hexA(colorCache.gold, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r * 6, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx; s.y += s.vy;
    s.vy += 0.06; s.vx *= 0.99;
    s.life -= s.decay;
    if (s.life <= 0) { sparks.splice(i, 1); continue; }
    ctx.fillStyle = hexA(colorCache.soft, s.life);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over";
  requestAnimationFrame(frame);
}

function hexA(color, alpha) {
  const a = Math.max(0, Math.min(1, alpha));
  if (color[0] === "#") {
    let h = color.slice(1);
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  return color;
}

// En el celular la barra del navegador se oculta al hacer scroll y dispara "resize":
// solo reconstruimos el lienzo si cambió el ancho o el alto de forma notable.
let lastW = 0, lastH = 0;
window.addEventListener("resize", () => {
  const w = window.innerWidth, h = window.innerHeight;
  if (w === lastW && Math.abs(h - lastH) < 150) return;
  lastW = w; lastH = h;
  resize();
});
lastW = window.innerWidth; lastH = window.innerHeight;
resize();
refreshColors();
if (!reduceMotion) requestAnimationFrame(frame);

/* ---------- Día / Noche ---------- */
(function dayNight() {
  const btn = $("dayBtn");
  const saved = (() => { try { return localStorage.getItem("zc-night"); } catch (e) { return null; } })();
  const hour = new Date().getHours();
  const startNight = saved !== null ? saved === "1" : (hour >= 19 || hour < 6);

  function apply(night) {
    document.body.classList.toggle("night", night);
    $("dayIco").textContent = night ? "☾" : "☀";
    $("dayLbl").textContent = night ? "Canción del Sol" : "Hacer de noche";
    refreshColors();
    try { localStorage.setItem("zc-night", night ? "1" : "0"); } catch (e) {}
  }
  apply(startNight);
  btn.addEventListener("click", () => apply(!document.body.classList.contains("night")));
})();

/* ---------- Música ---------- */
const music = (function () {
  const btn = $("musicBtn");
  const lbl = $("musicLbl");
  const vol = $("vol");
  let playing = false;
  let mode = null;            // "file" | "synth"
  let audio = null;
  let ac = null, master = null, timer = null, padNodes = [];

  // En iPhone/iPad el volumen de <audio> es de solo lectura: ocultamos el control en ese caso.
  const volWrap = document.querySelector(".vol");
  const canSetVol = (() => { const p = new Audio(); p.volume = 0.5; return p.volume === 0.5; })();
  function updateVolUi() {
    volWrap.classList.toggle("hidden", mode === "file" && !canSetVol);
  }

  const volume = () => Math.pow(vol.value / 100, 1.6);

  function setUi(on) {
    playing = on;
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    lbl.textContent = on ? "Pausar música" : "Tocar música";
  }

  /* Ambiente sintetizado 100 % original: drone suave + notas pentatónicas al azar. */
  /* Se crea (y se reanuda) dentro del toque del usuario: iOS lo exige. */
  function ensureCtx() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = volume() * 0.5;

      // Reverb simple a partir de ruido con caída exponencial
      const len = ac.sampleRate * 3.2;
      const buf = ac.createBuffer(2, len, ac.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
      const verb = ac.createConvolver();
      verb.buffer = buf;
      const wet = ac.createGain(); wet.gain.value = 0.7;
      const dry = ac.createGain(); dry.gain.value = 0.55;
      master.connect(dry).connect(ac.destination);
      master.connect(verb).connect(wet).connect(ac.destination);
    }
    if (ac.state === "suspended") ac.resume();
    return true;
  }

  function startSynth() {
    if (!ensureCtx()) return false;

    // Drone grave
    const droneGain = ac.createGain();
    droneGain.gain.value = 0.0001;
    droneGain.gain.linearRampToValueAtTime(0.16, ac.currentTime + 3);
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 520;
    [73.42, 110.0, 146.83].forEach((f, i) => {
      const o = ac.createOscillator();
      o.type = i === 0 ? "sine" : "triangle";
      o.frequency.value = f;
      o.detune.value = (i - 1) * 4;
      o.connect(lp);
      o.start();
      padNodes.push(o);
    });
    lp.connect(droneGain).connect(master);
    padNodes.push(droneGain);

    // Notas sueltas, tono de ocarina (seno + vibrato leve)
    const scale = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 659.25]; // pentatónica de Re
    let prev = 3;
    const note = () => {
      if (!ac || !playing) return;
      prev = Math.max(0, Math.min(scale.length - 1, prev + Math.floor(Math.random() * 5) - 2));
      const f = scale[prev];
      const t = ac.currentTime;
      const dur = 2.2 + Math.random() * 1.6;
      const o = ac.createOscillator();
      const g = ac.createGain();
      const lfo = ac.createOscillator();
      const lfoG = ac.createGain();
      o.type = "sine"; o.frequency.value = f;
      lfo.frequency.value = 5.2; lfoG.gain.value = f * 0.006;
      lfo.connect(lfoG).connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.28, t + 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(master);
      o.start(t); lfo.start(t);
      o.stop(t + dur + 0.1); lfo.stop(t + dur + 0.1);
      timer = setTimeout(note, 1800 + Math.random() * 2600);
    };
    note();
    return true;
  }

  function stopSynth() {
    clearTimeout(timer);
    padNodes.forEach((n) => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} });
    padNodes = [];
  }

  async function start() {
    if (mode !== "synth") {
      if (!audio) {
        audio = new Audio(CONFIG.musicFile);
        audio.loop = true;
        audio.preload = "auto";
      }
      audio.volume = volume();
      try {
        await audio.play();
        mode = "file";
        setUi(true);
        updateVolUi();
        return;
      } catch (e) {
        // sin archivo o bloqueado: usamos el ambiente sintetizado
      }
    }
    setUi(true);
    if (startSynth()) mode = "synth"; else setUi(false);
    updateVolUi();
  }

  function stop() {
    if (mode === "file" && audio) audio.pause();
    if (mode === "synth") {
      setUi(false);
      stopSynth();
    }
    setUi(false);
  }

  btn.addEventListener("click", () => {
    if (playing) { stop(); return; }
    ensureCtx();   // desbloquea el audio dentro del gesto táctil
    start();
  });
  vol.addEventListener("input", () => {
    if (audio) audio.volume = volume();
    if (master) master.gain.value = volume() * 0.5;
  });

  return { start, stop };
})();

/* ---------- Navi ---------- */
const navi = $("navi");
const bubble = $("naviBubble");
let nx = 80, ny = 140, tx = 80, ty = 140, naviTimer = null, naviIdx = 0;

window.addEventListener("pointermove", (e) => { tx = e.clientX + 36; ty = e.clientY - 26; });
window.addEventListener("pointerdown", (e) => {
  if (e.target.closest && e.target.closest(".navi")) return;   // no se aleja al tocarla
  tx = e.clientX + 36; ty = e.clientY - 26;
});

(function naviLoop(t) {
  if (!navi.dataset.idle) {
    // vuelo errático cuando nadie la mueve
    tx += Math.sin(t / 900) * 0.4;
    ty += Math.cos(t / 1100) * 0.3;
  }
  nx += (tx - nx) * 0.06;
  ny += (ty - ny) * 0.06;
  const cx = Math.max(10, Math.min(window.innerWidth - 40, nx));
  const cy = Math.max(10, Math.min(window.innerHeight - 40, ny));
  navi.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
  navi.classList.toggle("left", cx > window.innerWidth - 200);
  requestAnimationFrame(naviLoop);
})(0);

function naviSay(text, ms) {
  bubble.textContent = text;
  navi.classList.add("talk");
  clearTimeout(naviTimer);
  naviTimer = setTimeout(() => navi.classList.remove("talk"), ms || 2600);
}

navi.addEventListener("click", (e) => {
  e.stopPropagation();
  naviSay(CONFIG.navi[naviIdx % CONFIG.navi.length]);
  naviIdx++;
  const r = navi.getBoundingClientRect();
  burst(r.left + 11, r.top + 11, 26);
});

// Chispas al hacer clic en cualquier parte
window.addEventListener("click", (e) => {
  if (e.target.closest && e.target.closest(".btn, .vol, .navi")) return;
  burst(e.clientX, e.clientY, 14);
});

/* ---------- Arranque ---------- */
update();
setInterval(update, 250);
setTimeout(() => naviSay("¡Hey! ¡Listen!", 3200), 1200);
