"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { History, Play, Trash2, Code2, ChevronDown, ChevronRight, Clock, Rows3, Search, X } from "lucide-react";
import { getHistory, clearHistory, deleteEntry, type HistoryEntry } from "@/lib/history-store";
import { SQLWorksheet } from "@/components/sql-worksheet";
import { cn } from "@/lib/utils";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries]   = useState<HistoryEntry[]>([]);
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { setEntries(getHistory()); }, []);

  const filtered = entries.filter(e =>
    e.question.toLowerCase().includes(search.toLowerCase()) ||
    e.sql.toLowerCase().includes(search.toLowerCase())
  );

  const remove = (id: string) => {
    deleteEntry(id);
    setEntries(getHistory());
  };

  const replay = (question: string) => {
    router.push(`/explorer?q=${encodeURIComponent(question)}`);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Query History</h1>
          <p className="text-[11px] text-gray-400">{entries.length} queries in session</p>
        </div>
        {entries.length > 0 && (
          <button onClick={() => { clearHistory(); setEntries([]); }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-3 h-3" />Clear all
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto bg-[#F8F9FA]">
        {/* Search bar */}
        <div className="sticky top-0 z-10 bg-[#F8F9FA] border-b border-gray-200 px-6 py-2">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search questions or SQL..."
              className="w-full pl-9 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:border-[#29B5E8] focus:ring-1 focus:ring-[#29B5E8]/20 font-mono"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <History className="w-12 h-12 text-gray-100" />
            <p className="text-sm text-gray-400">
              {entries.length === 0 ? "No queries yet — run one in Explorer" : "No results match your search"}
            </p>
          </div>
        ) : (
          <div className="px-6 py-4 space-y-2">
            {filtered.map((entry) => (
              <div key={entry.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Expand toggle */}
                  <button onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                    className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
                    {expanded === entry.id
                      ? <ChevronDown className="w-4 h-4" />
                      : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {/* Question */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">{entry.question}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                        <Clock className="w-3 h-3" />{timeAgo(entry.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                        <Rows3 className="w-3 h-3" />{entry.rowCount} rows
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                        <Code2 className="w-3 h-3" />{entry.durationMs}ms
                      </span>
                    </div>
                  </div>

                  {/* SQL preview */}
                  <code className="hidden md:block text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded max-w-[260px] truncate border border-gray-100">
                    {entry.sql.replace(/\n/g, " ").trim()}
                  </code>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => replay(entry.question)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#29B5E8] hover:bg-[#1fa8d8] text-white text-xs rounded transition-colors font-medium">
                      <Play className="w-3 h-3 fill-white" />Replay
                    </button>
                    <button onClick={() => remove(entry.id)}
                      className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded SQL worksheet */}
                {expanded === entry.id && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                    <SQLWorksheet sql={entry.sql} onRun={() => replay(entry.question)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
