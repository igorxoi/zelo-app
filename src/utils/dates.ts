const MINUTE = 60 * 1000;

const pad = (value: number) => String(value).padStart(2, "0");

export function formatRelativeTime(isoDate: string, now = Date.now()) {
  const minutes = Math.max(
    0,
    Math.floor((now - new Date(isoDate).getTime()) / MINUTE),
  );

  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes}min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;

  const days = Math.floor(hours / 24);
  return `há ${days} ${days === 1 ? "dia" : "dias"}`;
}

export function getDayLabel(isoDate: string, now = new Date()) {
  const date = new Date(isoDate);

  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate());

  const diffInDays = Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) /
      (24 * 60 * MINUTE),
  );

  if (diffInDays === 0) return "Hoje";
  if (diffInDays === 1) return "Ontem";

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
