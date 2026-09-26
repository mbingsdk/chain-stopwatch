export class StopwatchStorage {
  constructor(key) {
    this.key = key;
  }

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.sessions)) return null;

      return {
        sessions: parsed.sessions
          .filter(isValidSession)
          .map(normalizeSession),
        running: Boolean(parsed.running),
        startedAt: Number.isFinite(parsed.startedAt) ? parsed.startedAt : null,
        activeNote: normalizeNote(parsed.activeNote),
      };
    } catch {
      return null;
    }
  }

  save(state) {
    localStorage.setItem(this.key, JSON.stringify({
      sessions: state.sessions,
      running: state.running,
      startedAt: state.startedAt,
      activeNote: state.activeNote,
    }));
  }

  clear() {
    localStorage.removeItem(this.key);
  }
}

function isValidSession(session) {
  return session
    && typeof session.id === 'string'
    && Number.isFinite(session.duration)
    && session.duration >= 0
    && Number.isFinite(session.endedAt);
}

function normalizeSession(session) {
  return {
    id: session.id,
    duration: Math.max(0, Math.floor(session.duration)),
    endedAt: Math.floor(session.endedAt),
    note: normalizeNote(session.note),
  };
}

function normalizeNote(value) {
  return typeof value === 'string' ? value.slice(0, 160) : '';
}
