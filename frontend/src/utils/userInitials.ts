/** Safe initials for Avatar (handles one word, multiple words, empty). */
export function getUserInitials(name: string | undefined | null): string {
  const trimmed = name?.trim() ?? "";
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const w = parts[0];
    return w.length >= 2
      ? `${w[0]}${w[1]}`.toUpperCase()
      : (w[0]?.toUpperCase() ?? "?");
  }
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
