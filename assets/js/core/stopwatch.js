export class ChainStopwatch {
  constructor({ storage }) {
    this.storage = storage;
    this.listeners = new Set();
    this.state = this.storage.load() ?? createInitialState();

    if (this.state.running && !this.state.startedAt) {
      this.state.running = false;
      this.persist();
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  snapshot() {
    return {
      sessions: this.state.sessions.map((session) => ({ ...session })),
      running: this.state.running,
      startedAt: this.state.startedAt,
      activeNote: this.state.activeNote,
      elapsed: this.elapsed(),
    };
  }

  elapsed(now = Date.now()) {
    if (!this.state.running || !this.state.startedAt) return 0;
    return Math.max(0, now - this.state.startedAt);
  }

  start(now = Date.now()) {
    if (this.state.running) return false;

    this.state.running = true;
    this.state.startedAt = now;
    this.commit();
    return true;
  }

  stopAndNext(now = Date.now()) {
    if (!this.state.running || !this.state.startedAt) return false;

    this.recordSession(now);
    this.state.startedAt = now;
    this.state.activeNote = '';
    this.state.running = true;
    this.commit();
    return true;
  }

  finish(now = Date.now()) {
    if (!this.state.running || !this.state.startedAt) return false;

    this.recordSession(now);
    this.state.running = false;
    this.state.startedAt = null;
    this.state.activeNote = '';
    this.commit();
    return true;
  }

  setActiveNote(note) {
    const nextNote = normalizeNote(note);
    if (nextNote === this.state.activeNote) return false;

    this.state.activeNote = nextNote;
    this.persist();
    return true;
  }

  updateSessionNote(id, note) {
    const session = this.state.sessions.find((item) => item.id === id);
    if (!session) return false;

    const nextNote = normalizeNote(note);
    if (session.note === nextNote) return false;

    session.note = nextNote;
    this.commit();
    return true;
  }

  deleteSession(id) {
    const next = this.state.sessions.filter((session) => session.id !== id);
    if (next.length === this.state.sessions.length) return false;

    this.state.sessions = next;
    this.commit();
    return true;
  }

  reset() {
    this.state = createInitialState();
    this.storage.clear();
    this.emit();
  }

  recordSession(now) {
    const duration = Math.max(1, now - this.state.startedAt);

    this.state.sessions.push({
      id: createId(),
      duration,
      endedAt: now,
      note: this.state.activeNote,
    });
  }

  commit() {
    this.persist();
    this.emit();
  }

  persist() {
    this.storage.save(this.state);
  }

  emit() {
    const snapshot = this.snapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

function createInitialState() {
  return {
    sessions: [],
    running: false,
    startedAt: null,
    activeNote: '',
  };
}

function normalizeNote(value) {
  return typeof value === 'string' ? value.slice(0, 160) : '';
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
