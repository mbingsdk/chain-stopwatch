export function formatDuration(value) {
  const ms = Math.max(0, Math.floor(Number(value) || 0));
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  const millis = ms % 1_000;

  const clock = hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;

  return `${clock}.${String(millis).padStart(3, '0')}`;
}

export function splitDuration(value) {
  const formatted = formatDuration(value);
  const dotIndex = formatted.lastIndexOf('.');

  return {
    clock: formatted.slice(0, dotIndex),
    milliseconds: formatted.slice(dotIndex),
  };
}

export function formatEndedAt(timestamp, locale = 'id-ID') {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
}

function pad(value) {
  return String(value).padStart(2, '0');
}
