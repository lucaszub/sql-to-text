"use client";

import { useState } from "react";
import { Play, Copy, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ── SQL Syntax Highlighter ────────────────────────────────────────────────────
// HTML-escapes first, then applies token spans. Safe because SQL comes from
// controlled sources (mock / Cortex AI), never raw user input.
function highlightSQL(raw: string): string {
  // 1. Escape HTML
  let s = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Comments  (-- …)
  s = s.replace(/(--[^\n]*)/g,
    '<span style="color:#9CA3AF;font-style:italic">$1</span>');

  // 3. Strings  ('…')
  s = s.replace(/('(?:[^']|'')*')/g,
    '<span style="color:#027A48">$1</span>');

  // 4. Numbers
  s = s.replace(/\b(\d+(?:\.\d+)?)\b/g,
    '<span style="color:#B54708">$1</span>');

  // 5. Keywords
  const KW = "SELECT|FROM|WHERE|ORDER|GROUP|BY|LIMIT|HAVING|JOIN|LEFT|RIGHT"
    + "|INNER|OUTER|CROSS|FULL|ON|AS|DISTINCT|AND|OR|NOT|IN|LIKE|ILIKE"
    + "|BETWEEN|NULL|IS|ASC|DESC|WITH|UNION|ALL|CASE|WHEN|THEN|ELSE|END"
    + "|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|VIEW"
    + "|RETURNS|DECLARE|BEGIN|COMMIT|ROLLBACK|OVER|PARTITION|QUALIFY|SAMPLE";
  s = s.replace(
    new RegExp(`\\b(${KW})\\b`, "gi"),
    '<span style="color:#1B87D9;font-weight:600">$1</span>'
  );

  // 6. Built-in functions
  const FN = "COUNT|SUM|AVG|MAX|MIN|UPPER|LOWER|TRIM|LENGTH|SUBSTR|CONCAT"
    + "|COALESCE|NVL|IFF|TO_DATE|DATEADD|DATEDIFF|DATE_TRUNC|YEAR|MONTH|DAY"
    + "|RANK|ROW_NUMBER|LAG|LEAD|FIRST_VALUE|LAST_VALUE|LISTAGG|ARRAY_AGG"
    + "|SNOWFLAKE\\.CORTEX\\.COMPLETE";
  s = s.replace(
    new RegExp(`\\b(${FN})\\b`, "gi"),
    '<span style="color:#7B4FCB">$1</span>'
  );

  return s;
}

interface SQLWorksheetProps {
  sql: string;
  onRun?: () => void;
  warehouse?: string;
  database?: string;
  readOnly?: boolean;
  className?: string;
}

export function SQLWorksheet({
  sql,
  onRun,
  warehouse = "COMPUTE_WH",
  database  = "E_COMMERCE.RETAIL",
  readOnly  = true,
  className,
}: SQLWorksheetProps) {
  const [copied, setCopied] = useState(false);

  const lines = sql.split("\n");

  const copy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex flex-col rounded-lg border border-gray-200 overflow-hidden bg-white", className)}>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-200 bg-[#F8F9FA]">
        {/* Run */}
        <button
          onClick={onRun}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#29B5E8] hover:bg-[#1fa8d8] text-white text-xs font-medium rounded transition-colors"
        >
          <Play className="w-3 h-3 fill-white" />
          Run
        </button>

        <div className="w-px h-4 bg-gray-200 mx-0.5" />

        {/* Warehouse selector */}
        <button className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 transition-colors font-mono">
          <span className="w-2 h-2 rounded-sm bg-[#29B5E8] opacity-70" />
          {warehouse}
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        <div className="w-px h-4 bg-gray-200 mx-0.5" />

        {/* Database */}
        <span className="text-[11px] text-gray-400 font-mono">{database}</span>

        <div className="flex-1" />

        {/* Copy */}
        <button
          onClick={copy}
          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 hover:bg-gray-100 rounded"
        >
          {copied
            ? <><Check className="w-3 h-3 text-green-500" /><span className="text-green-600">Copied</span></>
            : <><Copy className="w-3 h-3" /><span>Copy</span></>
          }
        </button>
      </div>

      {/* ── Editor area ──────────────────────────────────────────────────── */}
      <div className="overflow-auto">
        <table className="w-full border-collapse font-mono text-[12px] leading-5">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-[#F0F7FF] group">
                {/* Line number */}
                <td
                  className="select-none text-right pr-3 pl-4 py-0.5 text-[11px] text-gray-300 border-r border-gray-100 w-10 align-top"
                  style={{ minWidth: "2.5rem" }}
                >
                  {i + 1}
                </td>
                {/* Code */}
                <td className="pl-4 pr-4 py-0.5 text-gray-800 whitespace-pre align-top">
                  {/* Snowflake icon on first non-empty line */}
                  {i === 0 && (
                    <span className="mr-1.5 text-[#29B5E8] select-none">❄</span>
                  )}
                  <span
                    dangerouslySetInnerHTML={{ __html: highlightSQL(line) || "&nbsp;" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Status bar ───────────────────────────────────────────────────── */}
      {readOnly && (
        <div className="flex items-center gap-3 px-4 py-1 border-t border-gray-100 bg-[#F8F9FA] text-[10px] text-gray-400 font-mono">
          <span>{lines.length} line{lines.length !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span>Read-only</span>
        </div>
      )}
    </div>
  );
}
