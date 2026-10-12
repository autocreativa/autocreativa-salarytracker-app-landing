// Fuentes auto-alojadas (sin depender de fonts.googleapis.com)
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import '@fontsource/epilogue/500.css'
import '@fontsource/epilogue/600.css'
import '@fontsource/epilogue/700.css'
import '@fontsource/epilogue/800.css'
import '@fontsource/share-tech-mono/400.css'
import '@fontsource/vt323/400.css'

import './style.css'

// ── OS Detection & Download Button ──────────────────────────────────────────
const DOWNLOADS = {
  // download.php empaqueta y sirve el .app; el aviso por correo lo dispara el
  // frontend (Web3Forms, ver más abajo)
  mac:     { label: 'Descargar para macOS', url: '/download.php', available: true },
  windows: { label: 'No disponible para Windows', url: null, available: false },
  linux:   { label: 'No disponible para Linux',   url: null, available: false },
  other:   { label: 'Descargar',                  url: null, available: false },
}

// URL donde el usuario puede ver todas las versiones / releases
const OTHER_OS_URL = 'https://autocreativa.com/'

// Versión mostrada en el aviso de descarga (mantener en sync con APP_VERSION de public/download.php)
const APP_VERSION = '1.0.0'

// ── Aviso por correo de cada descarga (frontend, SIN backend) ───────────────
// Web3Forms: crea una access_key gratis en https://web3forms.com y pégala abajo.
// El correo llega a la dirección con la que registraste la key (no se expone tu
// email en la web). La access_key es pública y segura en el cliente.
const WEB3FORMS_ACCESS_KEY = '553fe6c4-9a1b-4ee2-8584-d8167e70bf16'
const WEB3FORMS_ENDPOINT   = 'https://api.web3forms.com/submit'
const NOTIFY_COOLDOWN_MS   = 4000 // evita avisos duplicados por doble clic

let lastNotifyAt = 0

async function notifyDownload() {
  if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'PEGA_AQUI_TU_ACCESS_KEY') {
    console.warn('[descarga] Configura WEB3FORMS_ACCESS_KEY para recibir avisos por correo.')
    return
  }

  const now = Date.now()
  if (now - lastNotifyAt < NOTIFY_COOLDOWN_MS) return
  lastNotifyAt = now

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: 'SalaryTracker — Nueva descarga de la app',
    from_name: 'Landing SalaryTracker',
    botcheck: false,
    evento: 'descarga-app',
    plataforma: 'macOS',
    version: APP_VERSION,
    pagina: location.href,
    referer: document.referrer || '(directo)',
    idioma: navigator.language,
    pantalla: `${window.screen.width}x${window.screen.height}`,
    zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
    fecha: new Date().toISOString(),
  }

  try {
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || json.success === false) {
      console.warn('[descarga] Web3Forms no aceptó el aviso:', res.status, json.message || '')
    }
  } catch (err) {
    console.warn('[descarga] No se pudo enviar el aviso por correo:', err)
  }
}

function detectOS() {
  const ua = navigator.userAgent
  if (/Mac|iPhone|iPad|iPod/.test(ua) && !window.MSStream) return 'mac'
  if (/Win/.test(ua))   return 'windows'
  if (/Linux/.test(ua)) return 'linux'
  return 'other'
}

function initDownloadButton() {
  const btn       = document.getElementById('download-btn')
  const label     = document.getElementById('download-label')
  const otherLink = document.getElementById('other-os-link')
  if (!btn || !label) return

  const os   = detectOS()
  const info = DOWNLOADS[os]

  // ── Update button label & behavior ─────────────────────────────────────────
  label.textContent = info.label

  if (info.available && info.url) {
    btn.href = info.url
    // Avisa por correo (frontend) cuando el usuario descarga; no interfiere con la descarga.
    btn.addEventListener('click', () => { void notifyDownload() })
  } else {
    btn.href = '#'
    btn.classList.add('opacity-50', 'cursor-not-allowed')
    btn.classList.remove('hover:border-[#5F7A65]', 'hover:bg-[#E2EAE0]')
    btn.addEventListener('click', e => e.preventDefault())
  }

  // ── Highlight the active OS card ────────────────────────────────────────────
  document.querySelectorAll('[data-os-card]').forEach(card => {
    const cardOs = card.getAttribute('data-os-card')
    if (cardOs === os) {
      // Active: full opacity, green border, slight background tint
      card.classList.remove('opacity-50')
      card.classList.add('opacity-100', 'border-[#5F7A65]', 'bg-[#E2EAE0]', 'ring-1', 'ring-[#5F7A65]/30')
    } else {
      card.classList.add('opacity-40')
      card.classList.remove('opacity-50')
    }
  })

  // ── "Ver otras versiones" link ──────────────────────────────────────────────
  if (otherLink) {
    otherLink.href = OTHER_OS_URL
    otherLink.target = '_blank'
    otherLink.rel = 'noopener noreferrer'
  }
}

initDownloadButton()



// Configuration values
let currentSalary = 1450230.45;
const ratePerSecond = 0.1245; // Amount gained every second
let currentProgress = 64.82;
const progressIncrementPerSecond = 0.00015;

const salaryCounterEl = document.getElementById('salary-counter');
const menubarCounterEl = document.getElementById('menubar-live-counter');
const progressBarEl = document.getElementById('salary-progress-bar');
const progressPercentEl = document.getElementById('progress-percent');

function formatCurrency(amount) {
  return '$ ' + amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatMenuCurrency(amount) {
  return '$ ' + Math.floor(amount).toLocaleString('en-US');
}

// Update counter smoothly 10 times per second for high-precision ticking feel
const tickIntervalMs = 100;
const additionPerTick = (ratePerSecond * (tickIntervalMs / 1000));

setInterval(() => {
  currentSalary += additionPerTick;
  currentProgress += (progressIncrementPerSecond * (tickIntervalMs / 1000));
  
  if (currentProgress > 100) currentProgress = 0;

  if (salaryCounterEl) {
    salaryCounterEl.textContent = formatCurrency(currentSalary);
  }
  if (menubarCounterEl) {
    menubarCounterEl.textContent = formatMenuCurrency(currentSalary);
  }
  if (progressBarEl && progressPercentEl) {
    const formattedPercent = currentProgress.toFixed(2) + '%';
    progressBarEl.style.width = formattedPercent;
    progressPercentEl.textContent = formattedPercent;
  }
}, tickIntervalMs);
