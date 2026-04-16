export interface Dashboard {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
  /** IDs des widgets dans cet ordre */
  widgetIds: string[];
}

const KEY = "dq_dashboards";
export const DEFAULT_ID = "default";

/** Dashboard placeholder statique — même valeur côté serveur et client pour éviter l'hydration mismatch */
export const STATIC_DEFAULT_DASHBOARD: Dashboard = {
  id: DEFAULT_ID,
  name: "Vue d'ensemble",
  emoji: "📊",
  createdAt: "2024-01-01T00:00:00.000Z",
  widgetIds: [],
};

// ── Init ──────────────────────────────────────────────────────────────────────

function defaultDashboard(): Dashboard {
  // Récupère les widgets existants (compatibilité avec les sessions précédentes)
  let widgetIds: string[] = [];
  try {
    const raw = JSON.parse(localStorage.getItem("dq_widgets") ?? "[]") as { id: string }[];
    widgetIds = raw.map(w => w.id);
  } catch { /* ignore */ }
  return {
    id: DEFAULT_ID,
    name: "Vue d'ensemble",
    emoji: "📊",
    createdAt: new Date().toISOString(),
    widgetIds,
  };
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export function getDashboards(): Dashboard[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? "null") as Dashboard[] | null;
    if (!stored || stored.length === 0) {
      const init = [defaultDashboard()];
      localStorage.setItem(KEY, JSON.stringify(init));
      return init;
    }
    return stored;
  } catch {
    return [];
  }
}

export function getDashboard(id: string): Dashboard | null {
  return getDashboards().find(d => d.id === id) ?? null;
}

export function createDashboard(name: string, emoji = "📋"): Dashboard {
  const dashboards = getDashboards();
  const next: Dashboard = {
    id: crypto.randomUUID(),
    name: name.trim(),
    emoji,
    createdAt: new Date().toISOString(),
    widgetIds: [],
  };
  localStorage.setItem(KEY, JSON.stringify([...dashboards, next]));
  return next;
}

export function renameDashboard(id: string, name: string): void {
  const updated = getDashboards().map(d => d.id === id ? { ...d, name: name.trim() } : d);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function deleteDashboard(id: string): void {
  if (id === DEFAULT_ID) return; // protège le dashboard par défaut
  const updated = getDashboards().filter(d => d.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

// ── Widgets dans un dashboard ─────────────────────────────────────────────────

export function addWidgetToDashboard(dashboardId: string, widgetId: string): void {
  const updated = getDashboards().map(d => {
    if (d.id !== dashboardId) return d;
    if (d.widgetIds.includes(widgetId)) return d; // déjà présent
    return { ...d, widgetIds: [...d.widgetIds, widgetId] };
  });
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function removeWidgetFromDashboard(dashboardId: string, widgetId: string): void {
  const updated = getDashboards().map(d =>
    d.id === dashboardId ? { ...d, widgetIds: d.widgetIds.filter(id => id !== widgetId) } : d,
  );
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function reorderDashboardWidgets(dashboardId: string, widgetIds: string[]): void {
  const updated = getDashboards().map(d =>
    d.id === dashboardId ? { ...d, widgetIds } : d,
  );
  localStorage.setItem(KEY, JSON.stringify(updated));
}

/** Widgets d'un dashboard dans l'ordre, avec les données complètes depuis widget-store */
export function getDashboardWidgetIds(dashboardId: string): string[] {
  return getDashboard(dashboardId)?.widgetIds ?? [];
}
