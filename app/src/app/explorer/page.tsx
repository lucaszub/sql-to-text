"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send, Database, User, Bot,
  ChevronUp, ChevronDown,
  BarChart2, Table, Code2,
  Hash, Calendar, DollarSign, AlignLeft, Tag,
  Search, SlidersHorizontal, Download, RefreshCw, Maximize2,
} from "lucide-react";
import { runDemoQuery, type QueryResult, KPIS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { SQLWorksheet } from "@/components/sql-worksheet";
import { SQLBlock } from "@/components/sql-block";
import { saveHistory } from "@/lib/history-store";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  result?: QueryResult;
  timestamp: Date;
}

const KPI_CARDS = [
  { label: "Total Orders",    value: KPIS.total_orders,    dot: "bg-green-500" },
  { label: "Pending Orders",  value: KPIS.pending_orders,  dot: "bg-amber-500" },
  { label: "Shipped Orders",  value: KPIS.shipped_orders,  dot: "bg-green-500" },
  { label: "Refunded Orders", value: KPIS.refunded_orders, dot: "bg-green-500" },
];

// ── Snowflake-style column type icons ────────────────────────────────────────
function ColIcon({ col, sample }: { col: string; sample: unknown }) {
  const c = col.toLowerCase();
  if (c.includes("date") || c.includes("_at"))
    return <Calendar className="w-3 h-3 shrink-0 text-blue-400" />;
  if (c.includes("amount") || c.includes("price") || c.includes("spent") || c.includes("revenue") || c.includes("subtotal"))
    return <DollarSign className="w-3 h-3 shrink-0 text-green-500" />;
  if (c === "status" || c === "payment_status" || c.includes("status"))
    return <Tag className="w-3 h-3 shrink-0 text-purple-400" />;
  if (typeof sample === "number" || c.includes("count") || c.includes("total_orders") || c === "stock" || c === "quantity" || c === "rating")
    return <Hash className="w-3 h-3 shrink-0 text-gray-400" />;
  return <AlignLeft className="w-3 h-3 shrink-0 text-gray-400" />;
}

// ── Right-align numeric cells ────────────────────────────────────────────────
function isNumericCol(col: string, sample: unknown): boolean {
  if (typeof sample === "number") return true;
  const c = col.toLowerCase();
  return c.includes("amount") || c.includes("price") || c.includes("spent") ||
         c.includes("revenue") || c.includes("count") || c === "stock" ||
         c === "quantity" || c === "rating";
}

// ── Cell renderer ─────────────────────────────────────────────────────────────
function formatCell(col: string, value: unknown): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-gray-300">NULL</span>;

  if (col === "status" || col === "payment_status")
    return <StatusBadge status={String(value)} />;
  if (col === "stock" && value === 0)
    return <StatusBadge status="Out of Stock" />;

  if (typeof value === "number") {
    if (col.includes("price") || col.includes("amount") || col.includes("spent") || col.includes("revenue") || col.includes("subtotal"))
      return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (col === "rating") return `⭐ ${value}`;
    return value.toLocaleString();
  }
  if (col === "order_date")
    return new Date(String(value)).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

  return String(value);
}

type StatusFilter = "All" | "Pending" | "Completed" | "Refunded" | "Cancelled" | "Processing";
const STATUS_TABS: StatusFilter[] = ["All", "Pending", "Completed", "Refunded", "Cancelled"];

// ── Avatar (kept for customer columns) ───────────────────────────────────────
const AVATAR_COLORS = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-indigo-500","bg-teal-500","bg-orange-500"];
function nameToColor(name: string) {
  let h = 0; for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) & 0xff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function nameInitials(name: string) {
  const p = String(name).trim().split(" ");
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : String(name).slice(0, 2).toUpperCase();
}

function ExplorerContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState(initialQuery);
  const [loading, setLoading]         = useState(false);
  const [activeResult, setActiveResult] = useState<QueryResult | null>(null);
  const [activeTab, setActiveTab]     = useState<"table" | "sql">("table");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sortCol, setSortCol]         = useState<string | null>(null);
  const [sortDir, setSortDir]         = useState<"asc" | "desc">("asc");
  const [page, setPage]               = useState(1);
  const PER_PAGE = 12;
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (initialQuery) void handleSend(initialQuery); }, []); // eslint-disable-line
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSend(query: string) {
    if (!query.trim() || loading) return;
    setLoading(true); setInput("");
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "user", text: query, timestamp: new Date() }]);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    const result = runDemoQuery(query);
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", text: result.naturalAnswer, result, timestamp: new Date() }]);
    setActiveResult(result); setActiveTab("table"); setStatusFilter("All"); setSortCol(null); setPage(1);
    saveHistory({ question: query, sql: result.sql, rowCount: result.rowCount, durationMs: result.durationMs });
    setLoading(false);
  }

  const hasStatusCol = activeResult?.columns.includes("status") ?? false;

  const filteredRows = activeResult
    ? activeResult.rows.filter(r => statusFilter === "All" || r["status"] === statusFilter)
    : [];

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortCol) return 0;
    const av = a[sortCol], bv = b[sortCol];
    if (av === bv) return 0;
    return (av < bv ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
  });

  const totalPages = Math.ceil(sortedRows.length / PER_PAGE);
  const pageRows   = sortedRows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const firstRow   = activeResult?.rows[0] ?? {};

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const pageNums: (number | null)[] = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, null, totalPages];
    if (page >= totalPages - 2) return [1, null, totalPages - 2, totalPages - 1, totalPages];
    return [1, null, page - 1, page, page + 1, null, totalPages];
  })();

  const KPIStrip = () => (
    <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100 bg-white shrink-0">
      {KPI_CARDS.map(kpi => (
        <div key={kpi.label} className="px-5 py-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={cn("w-1.5 h-1.5 rounded-full", kpi.dot)} />
            <p className="text-[11px] text-gray-400">{kpi.label}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 font-mono">{kpi.value}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Top Header ── */}
      <header className="flex items-center justify-between px-6 py-2.5 border-b border-gray-200 bg-white shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Explorer</h1>
          <p className="text-[11px] text-gray-400">Natural Language → Snowflake SQL</p>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#29B5E8]/10 text-[#29B5E8] rounded-full border border-[#29B5E8]/30 font-medium text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#29B5E8]" />
          Snowflake connected
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Chat Panel ── */}
        <div className="w-[340px] shrink-0 flex flex-col border-r border-gray-200 bg-white">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                <Database className="w-10 h-10 text-gray-100" />
                <p className="text-xs text-gray-400">Ask a question to query Snowflake</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  msg.role === "user" ? "bg-[#29B5E8]" : "bg-gray-100")}>
                  {msg.role === "user" ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-gray-500" />}
                </div>
                <div className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  msg.role === "user" ? "bg-[#29B5E8] text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm")}>
                  <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                  {msg.result && (
                    <>
                      <SQLBlock sql={msg.result.sql} />
                      <button onClick={() => { setActiveResult(msg.result!); setActiveTab("table"); setPage(1); }}
                        className="mt-2 text-xs text-[#29B5E8] hover:underline flex items-center gap-1">
                        View results →
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-gray-400" />
                </div>
                <div className="bg-gray-100 rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-gray-200 shrink-0">
            <div className="flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && void handleSend(input)} disabled={loading}
                placeholder="Ask a question..."
                className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#29B5E8] focus:ring-1 focus:ring-[#29B5E8]/20 disabled:opacity-50 font-mono" />
              <button onClick={() => void handleSend(input)} disabled={!input.trim() || loading}
                className="w-8 h-8 bg-[#29B5E8] hover:bg-[#1fa8d8] disabled:opacity-40 rounded-lg flex items-center justify-center transition-colors shrink-0">
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {["Top 10 commandes", "Rupture de stock", "Clients VIP"].map(ex => (
                <button key={ex} onClick={() => void handleSend(ex)}
                  className="text-[10px] px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded font-mono transition-colors">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Results Panel (Snowflake style) ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {activeResult ? (
            <>
              <KPIStrip />

              {/* ── Snowflake meta bar ── */}
              <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-200 bg-gray-50 shrink-0">
                {/* Left: Table | Chart tabs */}
                <div className="flex items-center gap-0">
                  <button onClick={() => setActiveTab("table")}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-l transition-colors",
                      activeTab === "table"
                        ? "bg-white border-gray-300 text-gray-800 shadow-sm"
                        : "bg-transparent border-transparent text-gray-400 hover:text-gray-600")}>
                    <Table className="w-3 h-3" /> Table
                  </button>
                  <button onClick={() => setActiveTab("sql")}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-r -ml-px transition-colors",
                      activeTab === "sql"
                        ? "bg-white border-gray-300 text-gray-800 shadow-sm"
                        : "bg-transparent border-transparent text-gray-400 hover:text-gray-600")}>
                    <Code2 className="w-3 h-3" /> SQL
                  </button>
                </div>

                {/* Right: row count + timing + icons */}
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span className="font-mono font-semibold text-gray-700">
                    {sortedRows.length.toLocaleString()} rows
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <span className="block h-full bg-[#29B5E8]" style={{ width: "100%" }} />
                    </span>
                    <span className="font-mono">{activeResult.durationMs}ms</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-400 hover:text-gray-600"><Search className="w-3.5 h-3.5" /></button>
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-400 hover:text-gray-600"><SlidersHorizontal className="w-3.5 h-3.5" /></button>
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-400 hover:text-gray-600"><Download className="w-3.5 h-3.5" /></button>
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-400 hover:text-gray-600"><RefreshCw className="w-3.5 h-3.5" /></button>
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-400 hover:text-gray-600"><Maximize2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>

              {/* ── Status filter sub-tabs (only for tables with status column) ── */}
              {hasStatusCol && activeTab === "table" && (
                <div className="flex items-center gap-0 px-4 py-0 border-b border-gray-100 bg-white shrink-0">
                  {STATUS_TABS.map(tab => (
                    <button key={tab} onClick={() => { setStatusFilter(tab); setPage(1); }}
                      className={cn("px-3 py-1.5 text-[11px] font-medium border-b-2 transition-colors",
                        statusFilter === tab
                          ? "border-[#29B5E8] text-[#29B5E8]"
                          : "border-transparent text-gray-400 hover:text-gray-600")}>
                      {tab}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Table ── */}
              <div className="flex-1 overflow-auto">
                {activeTab === "table" ? (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[#F8F9FA] border-b border-gray-200">
                        {/* Row number header */}
                        <th className="w-10 px-2 py-2 text-right select-none border-r border-gray-200">
                          <span className="text-[10px] text-gray-300 font-normal">#</span>
                        </th>
                        {activeResult.columns.map(col => (
                          <th key={col} onClick={() => toggleSort(col)}
                            className={cn("px-3 py-2 font-medium select-none cursor-pointer group",
                              "hover:bg-gray-100 transition-colors whitespace-nowrap",
                              isNumericCol(col, firstRow[col]) ? "text-right" : "text-left")}>
                            <div className={cn("flex items-center gap-1.5",
                              isNumericCol(col, firstRow[col]) ? "flex-row-reverse" : "flex-row")}>
                              <ColIcon col={col} sample={firstRow[col]} />
                              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                {col.replace(/_/g, "_")}
                              </span>
                              <span className="opacity-0 group-hover:opacity-100 ml-auto">
                                {sortCol === col
                                  ? sortDir === "asc"
                                    ? <ChevronUp className="w-3 h-3 text-[#29B5E8]" />
                                    : <ChevronDown className="w-3 h-3 text-[#29B5E8]" />
                                  : <ChevronUp className="w-3 h-3 text-gray-300" />}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((row, i) => {
                        const globalNum = (page - 1) * PER_PAGE + i + 1;
                        return (
                          <tr key={i} className="border-b border-gray-100 hover:bg-[#EEF6FB] transition-colors">
                            {/* Row number */}
                            <td className="px-2 py-1.5 text-right text-[10px] text-gray-300 font-mono border-r border-gray-100 select-none w-10">
                              {globalNum}
                            </td>
                            {activeResult.columns.map(col => (
                              <td key={col} className={cn(
                                "px-3 py-1.5 font-mono text-[11px] text-gray-800 whitespace-nowrap",
                                isNumericCol(col, firstRow[col]) ? "text-right tabular-nums" : "text-left"
                              )}>
                                {(col === "customer_name" || col === "name") ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className={cn("inline-flex items-center justify-center w-5 h-5 rounded text-white text-[9px] font-bold shrink-0", nameToColor(String(row[col])))}>
                                      {nameInitials(String(row[col]))}
                                    </span>
                                    <span>{String(row[col])}</span>
                                  </div>
                                ) : formatCell(col, row[col])}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-5">
                    <SQLWorksheet sql={activeResult.sql} />
                  </div>
                )}
              </div>

              {/* ── Pagination footer ── */}
              <div className="flex items-center justify-between px-4 py-1.5 border-t border-gray-200 bg-[#F8F9FA] shrink-0">
                <p className="text-[10px] text-gray-400 font-mono">
                  Rows {sortedRows.length > 0 ? (page - 1) * PER_PAGE + 1 : 0}–{Math.min(page * PER_PAGE, sortedRows.length)} of {sortedRows.length}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-2 py-1 text-[10px] border border-gray-200 rounded-l hover:bg-white disabled:opacity-30 text-gray-500 font-mono">
                      ‹ Prev
                    </button>
                    {pageNums.map((p, i) =>
                      p === null
                        ? <span key={`e${i}`} className="w-6 text-center text-[10px] text-gray-300">…</span>
                        : <button key={p} onClick={() => setPage(p)}
                            className={cn("w-7 h-[26px] text-[10px] border-y border-r font-mono transition-colors",
                              page === p ? "bg-[#29B5E8] border-[#29B5E8] text-white" : "border-gray-200 text-gray-500 hover:bg-white")}>
                            {p}
                          </button>
                    )}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-2 py-1 text-[10px] border border-gray-200 border-l-0 rounded-r hover:bg-white disabled:opacity-30 text-gray-500 font-mono">
                      Next ›
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <KPIStrip />
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-8">
                <BarChart2 className="w-14 h-14 text-gray-100" />
                <p className="text-sm text-gray-400">Results will appear here</p>
                <p className="text-[11px] text-gray-300 font-mono">Run a query in the chat panel</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading...</div>}>
      <ExplorerContent />
    </Suspense>
  );
}
