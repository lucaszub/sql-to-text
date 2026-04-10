export interface HistoryEntry {
  id: string;
  question: string;
  sql: string;
  rowCount: number;
  durationMs: number;
  createdAt: string; // ISO
}

const KEY = "dq_history";
const MAX = 50;

export function saveHistory(entry: Omit<HistoryEntry, "id" | "createdAt">): void {
  if (typeof window === "undefined") return;
  const history = getHistory();
  const next: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const trimmed = [next, ...history].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as HistoryEntry[];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function deleteEntry(id: string): void {
  const history = getHistory().filter(e => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(history));
}
