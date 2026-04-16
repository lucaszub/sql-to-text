"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Brush, ReferenceLine,
} from "recharts";
import {
  BarChart2, TrendingUp, PieChart as PieIcon, Activity, Hash,
  ScatterChart as ScatterChartIcon,
  Pin, X, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QueryResult } from "@/lib/mock-data";
import type { ChartType, WidgetConfig, WidgetSize, DashboardWidget, LineOptions } from "@/lib/widget-store";
import { getDashboards, DEFAULT_ID, type Dashboard } from "@/lib/dashboard-store";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChartBuilderProps {
  result: QueryResult;
  onAddToDashboard: (widget: Omit<DashboardWidget, "id" | "createdAt" | "order">, dashboardId: string) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COLOR_PRESETS = [
  { label: "Snowflake", value: "#29B5E8" },
  { label: "Indigo",    value: "#6366f1" },
  { label: "Emerald",   value: "#10b981" },
  { label: "Amber",     value: "#f59e0b" },
  { label: "Rose",      value: "#ef4444" },
  { label: "Violet",    value: "#8b5cf6" },
];

const CHART_TYPES: { type: ChartType; label: string; icon: React.ElementType }[] = [
  { type: "bar",     label: "Barres",  icon: BarChart2 },
  { type: "line",    label: "Courbe",  icon: TrendingUp },
  { type: "area",    label: "Aire",    icon: Activity },
  { type: "pie",     label: "Donut",   icon: PieIcon },
  { type: "scatter", label: "Nuage",   icon: ScatterChartIcon },
  { type: "kpi",     label: "KPI",     icon: Hash },
];

const PIE_COLORS = ["#29B5E8", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectNumericCols(columns: string[], rows: Record<string, unknown>[]): string[] {
  const first = rows[0] ?? {};
  return columns.filter((col) => {
    const val = first[col];
    if (typeof val === "number") return true;
    const c = col.toLowerCase();
    return (
      c.includes("amount") || c.includes("price") || c.includes("revenue") ||
      c.includes("spent") || c.includes("total") || c.includes("count") ||
      c.includes("subtotal") || c.includes("avg") || c.includes("rating") ||
      c.includes("qty") || c.includes("quantity") || c.includes("order_count")
    );
  });
}

function applyAggregate(vals: number[], aggregate: "SUM" | "COUNT" | "AVG" | "NONE"): number {
  switch (aggregate) {
    case "SUM":   return vals.reduce((s, v) => s + v, 0);
    case "COUNT": return vals.length;
    case "AVG":   return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
    default:      return vals[0] ?? 0;
  }
}

export function aggregateChartData(
  rows: Record<string, unknown>[],
  xAxis: string,
  yAxis: string,
  aggregate: "SUM" | "COUNT" | "AVG" | "NONE",
  yAxis2?: string,
): { name: string; value: number; value2?: number }[] {
  if (rows.length === 0) return [];
  if (aggregate === "NONE") {
    return rows.slice(0, 50).map((r) => ({
      name: String(r[xAxis] ?? ""),
      value: Number(r[yAxis] ?? 0),
      ...(yAxis2 !== undefined ? { value2: Number(r[yAxis2] ?? 0) } : {}),
    }));
  }
  const groups = new Map<string, { v1: number[]; v2: number[] }>();
  for (const row of rows) {
    const key = String(row[xAxis] ?? "");
    const v1 = typeof row[yAxis] === "number" ? row[yAxis] as number : Number(row[yAxis] ?? 0);
    const v2 = yAxis2 !== undefined ? (typeof row[yAxis2] === "number" ? row[yAxis2] as number : Number(row[yAxis2] ?? 0)) : 0;
    if (!groups.has(key)) groups.set(key, { v1: [], v2: [] });
    const g = groups.get(key)!;
    g.v1.push(isNaN(v1) ? 0 : v1);
    if (yAxis2 !== undefined) g.v2.push(isNaN(v2) ? 0 : v2);
  }
  return Array.from(groups.entries()).map(([name, { v1, v2 }]) => ({
    name,
    value: Math.round(applyAggregate(v1, aggregate) * 100) / 100,
    ...(yAxis2 !== undefined ? { value2: Math.round(applyAggregate(v2, aggregate) * 100) / 100 } : {}),
  }));
}

// ── Chart renderer (shared with widget-card) ──────────────────────────────────

export function ChartRenderer({
  chartType,
  data,
  color,
  height = "100%",
  lineOptions,
}: {
  chartType: ChartType;
  data: { name: string; value: number; value2?: number }[];
  color: string;
  height?: number | `${number}%`;
  lineOptions?: LineOptions;
}) {
  const fmt = (v: number) =>
    v > 999 ? `$${(v / 1000).toFixed(1)}k` : String(v);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-300">
        No data to preview
      </div>
    );
  }

  if (chartType === "kpi") {
    const total = data.reduce((s, d) => s + d.value, 0);
    const displayValue = total > 999999
      ? `${(total / 1000000).toFixed(1)}M`
      : total > 999
      ? `${(total / 1000).toFixed(1)}k`
      : String(Math.round(total * 100) / 100);
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <p className="text-4xl font-bold tracking-tight" style={{ color }}>{displayValue}</p>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {data[0] ? "valeur agrégée" : "—"}
        </p>
      </div>
    );
  }

  if (chartType === "pie") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius="65%" dataKey="value" nameKey="name">
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [fmt(Number(v))]}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #f3f4f6" }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "scatter") {
    const scatterData = data.map((d, i) => ({ x: i, y: d.value, name: d.name }));
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis type="number" dataKey="x" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis type="number" dataKey="y" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={fmt} />
          <Tooltip
            formatter={(v, n) => [fmt(Number(v)), n === "y" ? "value" : n]}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #f3f4f6" }}
          />
          <Scatter data={scatterData} fill={color} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  const commonProps = { data, margin: { top: 4, right: 4, left: -20, bottom: 0 } };
  const xEl = <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />;
  const yEl = <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={fmt} />;
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />;
  const tip = (
    <Tooltip
      formatter={(v) => [fmt(Number(v))]}
      contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #f3f4f6" }}
    />
  );

  if (chartType === "line") {
    const curveType = lineOptions?.smooth !== false ? "monotone" : "linear";
    const showDots = lineOptions?.showDots !== false;
    const dotStyle = showDots ? { r: 3, fill: color, strokeWidth: 0 } : false as const;
    const color2 = lineOptions?.color2 ?? "#6366f1";
    const dotStyle2 = showDots ? { r: 3, fill: color2, strokeWidth: 0 } : false as const;
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart {...commonProps}>
          {grid}{xEl}{yEl}{tip}
          {lineOptions?.refLine != null && lineOptions.refLine > 0 && (
            <ReferenceLine
              y={lineOptions.refLine}
              stroke="#9ca3af"
              strokeDasharray="4 4"
              label={{ value: String(lineOptions.refLine), fill: "#9ca3af", fontSize: 10, position: "right" }}
            />
          )}
          <Line type={curveType} dataKey="value" stroke={color} strokeWidth={2} dot={dotStyle} activeDot={{ r: 4 }} />
          {lineOptions?.multiSeries && lineOptions.yAxis2 && (
            <Line type={curveType} dataKey="value2" stroke={color2} strokeWidth={2} dot={dotStyle2} activeDot={{ r: 4 }} />
          )}
          {lineOptions?.brush && (
            <Brush dataKey="name" height={20} stroke="#e5e7eb" travellerWidth={6} />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "area") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="cbGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {grid}{xEl}{yEl}{tip}
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#cbGrad)" dot={{ r: 3, fill: color, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // bar (default)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart {...commonProps}>
        {grid}{xEl}{yEl}{tip}
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── ChartBuilder ──────────────────────────────────────────────────────────────

export function ChartBuilder({ result, onAddToDashboard }: ChartBuilderProps) {
  const numericCols  = useMemo(() => detectNumericCols(result.columns, result.rows), [result]);
  const categoryCols = useMemo(() => {
    const numSet = new Set(detectNumericCols(result.columns, result.rows));
    return result.columns.filter((c) => !numSet.has(c));
  }, [result]);

  const defaultX = categoryCols[0] ?? result.columns[0] ?? "";
  const defaultY = numericCols[0] ?? result.columns[1] ?? result.columns[0] ?? "";

  const [chartType, setChartType] = useState<ChartType>("bar");
  const [xAxis,     setXAxis]     = useState(defaultX);
  const [yAxis,     setYAxis]     = useState(defaultY);
  const [aggregate, setAggregate] = useState<"SUM" | "COUNT" | "AVG" | "NONE">("SUM");
  const [color,     setColor]     = useState("#29B5E8");
  const [lineOptions, setLineOptions] = useState<LineOptions>({
    multiSeries: false,
    showDots: true,
    smooth: true,
    brush: false,
  });

  const [showModal,    setShowModal]    = useState(false);
  const [title,        setTitle]        = useState("");
  const [size,         setSize]         = useState<WidgetSize>("md");
  const [saved,        setSaved]        = useState(false);
  const [description,  setDescription]  = useState("");
  const [dashboards,   setDashboards]   = useState<Dashboard[]>([]);
  const [dashboardId,  setDashboardId]  = useState(DEFAULT_ID);

  const chartData = useMemo(
    () => aggregateChartData(
      result.rows, xAxis, yAxis, aggregate,
      chartType === "line" && lineOptions.multiSeries ? lineOptions.yAxis2 : undefined,
    ),
    [result.rows, xAxis, yAxis, aggregate, chartType, lineOptions],
  );

  const config: WidgetConfig = {
    chartType, xAxis, yAxis, aggregate, color,
    ...(chartType === "line" ? { lineOptions } : {}),
  };

  function openModal() {
    setDashboards(getDashboards());
    setShowModal(true);
  }

  function handleConfirm() {
    if (!title.trim()) return;
    onAddToDashboard({
      title: title.trim(),
      sql: result.sql,
      question: "",
      description: description.trim() || undefined,
      columns: result.columns,
      rows: result.rows.slice(0, 500),
      config,
      size,
    }, dashboardId);
    setShowModal(false);
    setTitle("");
    setDescription("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Config panel ─────────────────────────────────────────────────── */}
      <div className="w-52 shrink-0 border-r border-gray-100 bg-[#F8F9FA] p-4 overflow-y-auto space-y-4">

        {/* Chart type */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Chart type</p>
          <div className="grid grid-cols-3 gap-1">
            {CHART_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={cn(
                  "flex flex-col items-center gap-1 py-1.5 px-1 rounded-lg border text-[10px] font-medium transition-colors",
                  chartType === type
                    ? "bg-[#29B5E8] border-[#29B5E8] text-white"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {chartType === "kpi" && (
          <p className="text-[10px] text-gray-400 bg-gray-50 rounded-lg px-2.5 py-2 leading-relaxed">
            Affiche la valeur agrégée de la colonne Y comme un grand indicateur.
          </p>
        )}

        {/* X-axis */}
        {chartType !== "kpi" && (
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">X-axis</p>
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#29B5E8] font-mono"
          >
            {result.columns.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        )}

        {/* Y-axis */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Y-axis</p>
          <select
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#29B5E8] font-mono"
          >
            {result.columns.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Aggregate */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Aggregate</p>
          <select
            value={aggregate}
            onChange={(e) => setAggregate(e.target.value as typeof aggregate)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#29B5E8] font-mono"
          >
            <option value="SUM">SUM</option>
            <option value="COUNT">COUNT</option>
            <option value="AVG">AVG</option>
            <option value="NONE">NONE (raw)</option>
          </select>
        </div>

        {/* Color */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Color</p>
          <div className="flex gap-1.5 flex-wrap">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.value}
                title={c.label}
                onClick={() => setColor(c.value)}
                className={cn(
                  "w-5 h-5 rounded-full border-2 transition-all",
                  color === c.value ? "border-gray-700 scale-110" : "border-transparent hover:scale-105",
                )}
                style={{ background: c.value }}
              />
            ))}
          </div>
        </div>

        {/* ── Options Line (visible seulement pour chartType "line") ─────── */}
        {chartType === "line" && (
          <div className="space-y-2.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Options Line</p>

            {/* Courbes multiples */}
            <div className="space-y-1.5">
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span className="text-[11px] text-gray-600">Multi-séries</span>
                <button
                  onClick={() => setLineOptions(o => ({ ...o, multiSeries: !o.multiSeries }))}
                  className={cn(
                    "w-8 h-4 rounded-full transition-colors relative shrink-0",
                    lineOptions.multiSeries ? "bg-[#29B5E8]" : "bg-gray-200",
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform",
                    lineOptions.multiSeries ? "translate-x-4" : "translate-x-0.5",
                  )} />
                </button>
              </label>

              {lineOptions.multiSeries && (
                <div className="pl-2 space-y-1.5 border-l-2 border-gray-100">
                  <select
                    value={lineOptions.yAxis2 ?? ""}
                    onChange={e => setLineOptions(o => ({ ...o, yAxis2: e.target.value || undefined }))}
                    className="w-full text-[11px] border border-gray-200 rounded-lg px-2 py-1 bg-white outline-none focus:border-[#29B5E8] font-mono"
                  >
                    <option value="">— Série 2 —</option>
                    {numericCols.filter(c => c !== yAxis).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="flex gap-1.5 flex-wrap">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.value}
                        title={c.label}
                        onClick={() => setLineOptions(o => ({ ...o, color2: c.value }))}
                        className={cn(
                          "w-4 h-4 rounded-full border-2 transition-all",
                          (lineOptions.color2 ?? "#6366f1") === c.value ? "border-gray-700 scale-110" : "border-transparent hover:scale-105",
                        )}
                        style={{ background: c.value }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Afficher points */}
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span className="text-[11px] text-gray-600">Afficher points</span>
              <button
                onClick={() => setLineOptions(o => ({ ...o, showDots: !o.showDots }))}
                className={cn(
                  "w-8 h-4 rounded-full transition-colors relative shrink-0",
                  lineOptions.showDots ? "bg-[#29B5E8]" : "bg-gray-200",
                )}
              >
                <span className={cn(
                  "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform",
                  lineOptions.showDots ? "translate-x-4" : "translate-x-0.5",
                )} />
              </button>
            </label>

            {/* Lissage */}
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span className="text-[11px] text-gray-600">Lissage</span>
              <button
                onClick={() => setLineOptions(o => ({ ...o, smooth: !o.smooth }))}
                className={cn(
                  "w-8 h-4 rounded-full transition-colors relative shrink-0",
                  lineOptions.smooth ? "bg-[#29B5E8]" : "bg-gray-200",
                )}
              >
                <span className={cn(
                  "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform",
                  lineOptions.smooth ? "translate-x-4" : "translate-x-0.5",
                )} />
              </button>
            </label>

            {/* Brush / zoom */}
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span className="text-[11px] text-gray-600">Brush / zoom</span>
              <button
                onClick={() => setLineOptions(o => ({ ...o, brush: !o.brush }))}
                className={cn(
                  "w-8 h-4 rounded-full transition-colors relative shrink-0",
                  lineOptions.brush ? "bg-[#29B5E8]" : "bg-gray-200",
                )}
              >
                <span className={cn(
                  "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform",
                  lineOptions.brush ? "translate-x-4" : "translate-x-0.5",
                )} />
              </button>
            </label>

            {/* Ligne de référence */}
            <div>
              <p className="text-[11px] text-gray-600 mb-1">Ref. line</p>
              <input
                type="number"
                placeholder="Ex: 20000"
                value={lineOptions.refLine ?? ""}
                onChange={e => setLineOptions(o => ({
                  ...o,
                  refLine: e.target.value ? Number(e.target.value) : undefined,
                }))}
                className="w-full text-[11px] border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#29B5E8] font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Preview + CTA ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col p-5 gap-4 min-w-0">
        <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 min-h-0">
          <ChartRenderer chartType={chartType} data={chartData} color={color} lineOptions={chartType === "line" ? lineOptions : undefined} />
        </div>

        {saved ? (
          <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-medium">
            <Check className="w-3.5 h-3.5" />
            Widget ajouté au dashboard !
          </div>
        ) : (
          <button
            onClick={openModal}
            className="flex items-center justify-center gap-2 py-2.5 bg-[#29B5E8] hover:bg-[#1fa8d8] text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
          >
            <Pin className="w-3.5 h-3.5" />
            Ajouter au Dashboard
          </button>
        )}
      </div>

      {/* ── Add-to-Dashboard modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-80 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Ajouter au Dashboard</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-medium text-gray-500 block mb-1">
                Nom du widget
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                placeholder="Ex: Revenue par catégorie"
                autoFocus
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#29B5E8] focus:ring-1 focus:ring-[#29B5E8]/20"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-gray-500 block mb-1">
                Description <span className="text-gray-300">(optionnel)</span>
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Revenue des 6 derniers mois"
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#29B5E8] focus:ring-1 focus:ring-[#29B5E8]/20"
              />
            </div>

            {/* Sélecteur dashboard */}
            {dashboards.length > 1 && (
              <div>
                <label className="text-[11px] font-medium text-gray-500 block mb-1">Dashboard</label>
                <select
                  value={dashboardId}
                  onChange={e => setDashboardId(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#29B5E8] bg-white"
                >
                  {dashboards.map(d => (
                    <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Taille</label>
              <div className="flex gap-2">
                {(["sm", "md", "lg"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                      size === s
                        ? "bg-[#29B5E8] border-[#29B5E8] text-white"
                        : "border-gray-200 text-gray-500 hover:border-gray-300",
                    )}
                  >
                    {s === "sm" ? "S" : s === "md" ? "M" : "L"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-200 text-xs text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={!title.trim()}
                className="flex-1 py-2 bg-[#29B5E8] hover:bg-[#1fa8d8] disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
