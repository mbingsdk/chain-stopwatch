export function getStats(sessions) {
  const values = sessions.map((session) => session.duration);
  const count = values.length;
  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    count,
    total,
    average: count ? total / count : 0,
    fastest: count ? Math.min(...values) : 0,
    slowest: count ? Math.max(...values) : 0,
  };
}
