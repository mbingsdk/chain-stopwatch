import { formatDuration } from './time.js';

export function sessionsToText(sessions) {
  if (!sessions.length) return 'Belum ada sesi.';

  const total = sessions.reduce((sum, session) => sum + session.duration, 0);
  const average = total / sessions.length;

  return [
    ...sessions.map((session, index) => {
      const note = session.note?.trim() ? ` — ${session.note.trim()}` : '';
      return `#${index + 1}  ${formatDuration(session.duration)}${note}`;
    }),
    '',
    `Total: ${formatDuration(total)}`,
    `Rata-rata: ${formatDuration(average)}`,
  ].join('\n');
}

export function downloadCsv(sessions, filename = 'chain-stopwatch.csv') {
  if (!sessions.length) return false;

  const rows = [
    ['session', 'description', 'duration_ms', 'duration', 'ended_at'],
    ...sessions.map((session, index) => [
      index + 1,
      session.note ?? '',
      session.duration,
      formatDuration(session.duration),
      new Date(session.endedAt).toISOString(),
    ]),
  ];

  const csv = rows
    .map((row) => row.map(escapeCell).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return true;
}

function escapeCell(value) {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}
