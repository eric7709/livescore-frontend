// utils/groupByDate.ts
export function groupByDate<T extends { matchDate: string | null | undefined }>(
  items: T[]
): { dateKey: string; label: string; items: T[] }[] {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const d = item.matchDate ? new Date(item.matchDate) : null;
    const dateKey = d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "unknown";
    const existing = groups.get(dateKey);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(dateKey, [item]);
    }
  }

  const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
    if (a === "unknown") return 1;
    if (b === "unknown") return -1;
    return a.localeCompare(b);
  });

  return sortedKeys.map((dateKey) => ({
    dateKey,
    label: formatGroupLabel(dateKey),
    items: groups.get(dateKey)!,
  }));
}

function formatGroupLabel(dateKey: string) {
  if (dateKey === "unknown") return "Date TBD";
  const d = new Date(dateKey);
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
}