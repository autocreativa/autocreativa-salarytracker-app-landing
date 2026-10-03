import './style.css'

// ── OS Detection & Download Button ──────────────────────────────────────────
const DOWNLOADS = {
  mac:     { label: 'Descargar para macOS', url: '#', available: true },
  windows: { label: 'No disponible para Windows', url: null, available: false },
  linux:   { label: 'No disponible para Linux',   url: null, available: false },
  other:   { label: 'Descargar',                  url: null, available: false },
}

// URL donde el usuario puede ver todas las versiones / releases
const OTHER_OS_URL = 'https://autocreativa.com/'

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
