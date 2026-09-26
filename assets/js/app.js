import { APP_CONFIG } from './config.js?v=2.1.1';
import { StopwatchStorage } from './core/storage.js?v=2.1.1';
import { ChainStopwatch } from './core/stopwatch.js?v=2.1.1';
import { getStats } from './core/stats.js?v=2.1.1';
import { downloadCsv, sessionsToText } from './utils/export.js?v=2.1.1';
import { formatDuration, formatEndedAt, splitDuration } from './utils/time.js?v=2.1.1';

const elements = {
  timerClock: document.querySelector('[data-timer-clock]'),
  timerMs: document.querySelector('[data-timer-ms]'),
  sessionLabel: document.querySelector('[data-session-label]'),
  activeNote: document.querySelector('[data-active-note]'),
  status: document.querySelector('[data-status]'),
  start: document.querySelector('[data-action="start"]'),
  next: document.querySelector('[data-action="next"]'),
  finish: document.querySelector('[data-action="finish"]'),
  reset: document.querySelector('[data-action="reset"]'),
  copy: document.querySelector('[data-action="copy"]'),
  csv: document.querySelector('[data-action="csv"]'),
  history: document.querySelector('[data-history]'),
  historyCount: document.querySelector('[data-history-count]'),
  statCount: document.querySelector('[data-stat="count"]'),
  statTotal: document.querySelector('[data-stat="total"]'),
  statAverage: document.querySelector('[data-stat="average"]'),
  statFastest: document.querySelector('[data-stat="fastest"]'),
  version: document.querySelector('[data-version]'),
  toast: document.querySelector('[data-toast]'),
};

const storage = new StopwatchStorage(APP_CONFIG.storageKey);
const stopwatch = new ChainStopwatch({ storage });
let latestState = stopwatch.snapshot();
let animationFrame = 0;
let toastTimer = 0;

stopwatch.subscribe((state) => {
  latestState = state;
  render(state);
  syncAnimation(state.running);
});

bindEvents();
elements.version.textContent = `v${APP_CONFIG.version}`;

function bindEvents() {
  elements.start.addEventListener('click', () => stopwatch.start());
  elements.next.addEventListener('click', () => stopwatch.stopAndNext());
  elements.finish.addEventListener('click', () => stopwatch.finish());

  elements.activeNote.addEventListener('input', (event) => {
    stopwatch.setActiveNote(event.target.value);
  });

  elements.activeNote.addEventListener('change', (event) => {
    if (event.target.value.trim()) showToast('Keterangan sesi aktif tersimpan');
  });

  elements.reset.addEventListener('click', () => {
    const hasAnything = latestState.running || latestState.sessions.length > 0;
    if (hasAnything && !window.confirm('Hapus semua sesi dan reset stopwatch?')) return;
    stopwatch.reset();
    renderTimer(0);
  });

  elements.history.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete-session]');
    if (!button) return;
    stopwatch.deleteSession(button.dataset.deleteSession);
  });

  elements.history.addEventListener('change', (event) => {
    const input = event.target.closest('[data-session-note]');
    if (!input) return;

    if (stopwatch.updateSessionNote(input.dataset.sessionNote, input.value)) {
      showToast('Keterangan sesi diperbarui');
    }
  });

  elements.history.addEventListener('keydown', (event) => {
    const input = event.target.closest('[data-session-note]');
    if (!input || event.key !== 'Enter') return;
    event.preventDefault();
    input.blur();
  });

  elements.copy.addEventListener('click', copyResults);
  elements.csv.addEventListener('click', exportCsv);

  window.addEventListener('keydown', (event) => {
    if (isTypingTarget(event.target) || event.repeat) return;

    if (event.code === 'Space') {
      event.preventDefault();
      latestState.running ? stopwatch.stopAndNext() : stopwatch.start();
      return;
    }

    if (event.code === 'Escape' && latestState.running) {
      event.preventDefault();
      stopwatch.finish();
      return;
    }

    if (event.code === 'Enter' && !latestState.running) {
      event.preventDefault();
      stopwatch.start();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && latestState.running) renderTimer(stopwatch.elapsed());
  });
}

function render(state) {
  const nextNumber = state.sessions.length + 1;
  const sessionText = String(nextNumber).padStart(2, '0');

  elements.sessionLabel.textContent = state.running
    ? `Sesi ${sessionText} sedang berjalan`
    : state.sessions.length
      ? 'Semua sesi berhenti'
      : 'Siap memulai sesi pertama';

  elements.status.dataset.state = state.running ? 'running' : 'idle';
  elements.status.querySelector('span:last-child').textContent = state.running ? 'Running' : 'Idle';

  elements.start.disabled = state.running;
  elements.next.disabled = !state.running;
  elements.finish.disabled = !state.running;
  elements.start.textContent = state.sessions.length && !state.running ? 'Start sesi baru' : 'Start';

  elements.copy.disabled = state.sessions.length === 0;
  elements.csv.disabled = state.sessions.length === 0;

  if (document.activeElement !== elements.activeNote) {
    elements.activeNote.value = state.activeNote ?? '';
  }

  if (!state.running) renderTimer(0);

  renderHistory(state.sessions);
  renderStats(state.sessions);
}

function renderTimer(value) {
  const parts = splitDuration(value);
  elements.timerClock.textContent = parts.clock;
  elements.timerMs.textContent = parts.milliseconds;
}

function syncAnimation(shouldRun) {
  cancelAnimationFrame(animationFrame);
  if (!shouldRun) return;

  const frame = () => {
    renderTimer(stopwatch.elapsed());
    animationFrame = requestAnimationFrame(frame);
  };

  animationFrame = requestAnimationFrame(frame);
}

function renderHistory(sessions) {
  elements.historyCount.textContent = `${sessions.length} sesi`;

  if (!sessions.length) {
    elements.history.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__mark" aria-hidden="true">00</div>
        <p>Belum ada hasil.</p>
        <span>Mulai stopwatch lalu tekan Stop & Next untuk membuat sesi.</span>
      </div>`;
    return;
  }

  const reversed = [...sessions].reverse();

  elements.history.innerHTML = reversed.map((session, reverseIndex) => {
    const sessionNumber = sessions.length - reverseIndex;
    const number = String(sessionNumber).padStart(2, '0');

    return `
      <article class="session-row">
        <span class="session-row__number">${number}</span>
        <div class="session-row__main">
          <div class="session-row__time">
            <strong>${formatDuration(session.duration)}</strong>
            <span>Selesai ${formatEndedAt(session.endedAt, APP_CONFIG.locale)}</span>
          </div>
          <label class="session-note">
            <span class="sr-only">Keterangan sesi ${sessionNumber}</span>
            <input
              type="text"
              maxlength="160"
              value="${escapeHtml(session.note ?? '')}"
              placeholder="Tambahkan keterangan..."
              data-session-note="${escapeHtml(session.id)}"
              aria-label="Keterangan sesi ${sessionNumber}"
            >
          </label>
        </div>
        <span class="session-row__seconds">${(session.duration / 1000).toFixed(3)} s</span>
        <button class="icon-button" type="button" data-delete-session="${escapeHtml(session.id)}" aria-label="Hapus sesi ${sessionNumber}" title="Hapus sesi">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8l8 8M16 8l-8 8"/></svg>
        </button>
      </article>`;
  }).join('');
}

function renderStats(sessions) {
  const stats = getStats(sessions);

  elements.statCount.textContent = stats.count;
  elements.statTotal.textContent = formatDuration(stats.total);
  elements.statAverage.textContent = formatDuration(stats.average);
  elements.statFastest.textContent = formatDuration(stats.fastest);
}

async function copyResults() {
  try {
    await navigator.clipboard.writeText(sessionsToText(latestState.sessions));
    showToast('Hasil disalin ke clipboard');
  } catch {
    showToast('Clipboard tidak tersedia di browser ini');
  }
}

function exportCsv() {
  const didExport = downloadCsv(latestState.sessions);
  if (didExport) showToast('CSV berhasil dibuat');
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;

  toastTimer = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 1800);
}

function isTypingTarget(target) {
  return target instanceof HTMLElement
    && (target.matches('input, textarea, select') || target.isContentEditable);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
