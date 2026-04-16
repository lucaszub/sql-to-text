"use client";

import { useState } from "react";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChartRenderer, aggregateChartData } from "@/components/chart-builder";
import type { DashboardWidget } from "@/lib/widget-store";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface WidgetCardProps {
  widget: DashboardWidget;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  /** true → montre les contrôles drag/edit/delete */
  editMode?: boolean;
  /** listeners dnd-kit passés sur le handle de drag */
  dragHandleProps?: SyntheticListenerMap;
}

const CHART_HEIGHT: Record<DashboardWidget["size"], number> = {
  sm: 140,
  md: 180,
  lg: 200,
};

function KpiDisplay({
  rows,
  config,
  size,
}: {
  rows: Record<string, unknown>[];
  config: import("@/lib/widget-store").WidgetConfig;
  size: import("@/lib/widget-store").WidgetSize;
}) {
  const col = config.yAxis;
  const vals = rows.map(r => {
    const v = r[col];
    return typeof v === "number" ? v : Number(v ?? 0);
  }).filter(v => !isNaN(v));

  let total: number;
  switch (config.aggregate) {
    case "SUM":   total = vals.reduce((s, v) => s + v, 0); break;
    case "COUNT": total = rows.length; break;
    case "AVG":   total = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0; break;
    default:      total = vals[0] ?? 0;
  }

  const display = total > 999999
    ? `${(total / 1000000).toFixed(1)}M`
    : total > 9999
    ? `${(total / 1000).toFixed(1)}k`
    : String(Math.round(total * 100) / 100);

  const fontSize = size === "sm" ? "text-3xl" : size === "lg" ? "text-5xl" : "text-4xl";

  return (
    <div className="flex flex-col items-center justify-center h-full gap-1.5">
      <p className={cn(fontSize, "font-bold tracking-tight")} style={{ color: config.color ?? "#29B5E8" }}>
        {display}
      </p>
      <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">{col}</p>
      <p className="text-[10px] text-gray-300">{config.aggregate}</p>
    </div>
  );
}

export function WidgetCard({
  widget,
  onDelete,
  onEdit,
  editMode = false,
  dragHandleProps,
}: WidgetCardProps) {
  const [confirming, setConfirming] = useState(false);

  const { config, rows } = widget;
  const chartData = aggregateChartData(
    rows, config.xAxis, config.yAxis, config.aggregate,
    config.chartType === "line" && config.lineOptions?.multiSeries ? config.lineOptions.yAxis2 : undefined,
  );

  function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    onDelete(widget.id);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Drag handle — visible seulement en mode édition */}
          <span
            {...(editMode ? dragHandleProps : {})}
            className={cn(
              "shrink-0 transition-colors",
              editMode ? "cursor-grab text-gray-400 hover:text-gray-600" : "text-transparent pointer-events-none",
            )}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </span>
          <p className="text-xs font-semibold text-gray-800 truncate">{widget.title}</p>
          {widget.description && (
            <p className="text-[10px] text-gray-400 truncate">{widget.description}</p>
          )}
        </div>

        {/* Controls — visibles seulement en mode édition */}
        {editMode && (
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(widget.id)}
                className="p-1 text-gray-300 hover:text-[#29B5E8] hover:bg-blue-50 rounded-lg transition-colors"
                title="Modifier"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={handleDelete}
              onBlur={() => setConfirming(false)}
              className={cn(
                "p-1 rounded-lg transition-colors",
                confirming
                  ? "bg-red-50 text-red-500"
                  : "text-gray-300 hover:text-red-400 hover:bg-red-50",
              )}
              title={confirming ? "Confirmer" : "Supprimer"}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Chart / KPI */}
      <div className="flex-1" style={{ height: CHART_HEIGHT[widget.size] }}>
        {config.chartType === "kpi" ? (
          <KpiDisplay
            rows={rows}
            config={config}
            size={widget.size}
          />
        ) : (
          <ChartRenderer
            chartType={config.chartType}
            data={chartData}
            color={config.color ?? "#29B5E8"}
            height={CHART_HEIGHT[widget.size]}
            lineOptions={config.chartType === "line" ? config.lineOptions : undefined}
          />
        )}
      </div>

      {/* Footer */}
      <p className="text-[10px] text-gray-300 font-mono truncate">
        {config.chartType === "kpi"
          ? `${config.aggregate}(${config.yAxis})`
          : `${config.xAxis} × ${config.yAxis}`
        }
      </p>
    </div>
  );
}
