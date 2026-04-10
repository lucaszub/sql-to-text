"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function SQLBlock({ sql }: { sql: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 text-left transition-colors"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <span className="font-mono text-[11px]">SQL généré</span>
      </button>
      {open && (
        <div className="relative bg-gray-950 text-green-400 font-mono p-3 whitespace-pre overflow-x-auto">
          <button
            onClick={copy}
            className={cn(
              "absolute top-2 right-2 p-1 rounded transition-colors",
              copied ? "text-green-400" : "text-gray-500 hover:text-gray-300"
            )}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {sql}
        </div>
      )}
    </div>
  );
}
