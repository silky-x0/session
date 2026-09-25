export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function displayName(identity: string, name?: string): string {
  if (name) return name;
  const dash = identity.lastIndexOf("-");
  return dash > 0 ? identity.slice(0, dash) : identity;
}

export function initials(label: string): string {
  return label
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
