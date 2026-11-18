export function formatDateTime(value) {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDate(value) {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  return parsed.toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function isInCurrentMonth(value) {
  if (!value) return false;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  const now = new Date();
  return (
    parsed.getFullYear() === now.getFullYear() &&
    parsed.getMonth() === now.getMonth()
  );
}

export function statusTone(status) {
  const value = String(status || "").toLowerCase();

  if (value === "completed") return "ok";
  if (value === "pending") return "warn";
  if (value === "failed" || value === "error") return "danger";
  return "neutral";
}

export function displayName(value, fallback = "Not specified") {
  const trimmed = String(value || "").trim();
  return trimmed || fallback;
}

export function dateRangeLabel(items, accessor) {
  const dates = items
    .map((item) => new Date(accessor(item)))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) return "No dated records yet";

  const start = dates[0].toLocaleDateString(undefined, { dateStyle: "medium" });
  const end = dates[dates.length - 1].toLocaleDateString(undefined, {
    dateStyle: "medium",
  });

  return start === end ? start : `${start} – ${end}`;
}
