export type ChartType = "bar" | "line" | "area" | "pie" | "scatter" | "kpi";
export type WidgetSize = "sm" | "md" | "lg";

export interface LineOptions {
  multiSeries: boolean;
  yAxis2?: string;
  color2?: string;
  showDots: boolean;
  smooth: boolean;
  brush: boolean;
  refLine?: number;
}

export interface WidgetConfig {
  chartType: ChartType;
  xAxis: string;
  yAxis: string;
  aggregate: "SUM" | "COUNT" | "AVG" | "NONE";
  groupBy?: string;
  color?: string;
  lineOptions?: LineOptions;
}

export interface DashboardWidget {
  id: string;
  title: string;
  sql: string;
  question: string;
  description?: string;
  columns: string[];
  rows: Record<string, unknown>[];
  config: WidgetConfig;
  size: WidgetSize;
  createdAt: string;
  order: number;
}

const STORAGE_KEY = "dq_widgets";
const MAX_WIDGETS = 20;

export function getWidgets(): DashboardWidget[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as DashboardWidget[];
  } catch {
    return [];
  }
}

export function saveWidget(
  widget: Omit<DashboardWidget, "id" | "createdAt" | "order">,
): DashboardWidget {
  const widgets = getWidgets();
  if (widgets.length >= MAX_WIDGETS) widgets.splice(0, 1);
  const newWidget: DashboardWidget = {
    ...widget,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    order: widgets.length,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...widgets, newWidget]));
  return newWidget;
}

export function deleteWidget(id: string): void {
  const widgets = getWidgets().filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
}

export function updateWidget(
  id: string,
  changes: Partial<Omit<DashboardWidget, "id" | "createdAt">>,
): void {
  const widgets = getWidgets().map((w) => (w.id === id ? { ...w, ...changes } : w));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
}

export function reorderWidgets(ordered: DashboardWidget[]): void {
  const updated = ordered.map((w, i) => ({ ...w, order: i }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
