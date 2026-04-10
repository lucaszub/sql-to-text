"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Database, Table2, ChevronRight, ChevronDown,
  Hash, Calendar, DollarSign, AlignLeft, Tag, Search, Play,
  Key, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Schema definition (mirrors mock-data.ts types) ────────────────────────────
type ColType = "VARCHAR" | "DATE" | "FLOAT" | "INTEGER" | "BOOLEAN";

interface Column {
  name: string;
  type: ColType;
  nullable: boolean;
  pk?: boolean;
  fk?: string;
  description?: string;
}

interface TableDef {
  name: string;
  description: string;
  rowCount: number;
  columns: Column[];
}

interface SchemaDef {
  name: string;
  tables: TableDef[];
}

interface DatabaseDef {
  name: string;
  schemas: SchemaDef[];
}

const DB: DatabaseDef = {
  name: "E_COMMERCE_DEMO",
  schemas: [{
    name: "RETAIL",
    tables: [
      {
        name: "ORDERS",
        description: "Customer orders with status and payment info",
        rowCount: 240,
        columns: [
          { name: "ORDER_ID",       type: "VARCHAR", nullable: false, pk: true,  description: "Unique order identifier (e.g. #ORD1008)" },
          { name: "CUSTOMER_NAME",  type: "VARCHAR", nullable: false,            description: "Full name of the customer" },
          { name: "ORDER_DATE",     type: "DATE",    nullable: false,            description: "Date the order was placed" },
          { name: "STATUS",         type: "VARCHAR", nullable: false,            description: "Completed | Pending | Refunded | Cancelled | Processing" },
          { name: "TOTAL_AMOUNT",   type: "FLOAT",   nullable: false,            description: "Order total in USD" },
          { name: "PAYMENT_STATUS", type: "VARCHAR", nullable: false,            description: "Paid | Unpaid | Refunded" },
        ],
      },
      {
        name: "PRODUCTS",
        description: "Product catalogue with categories and stock",
        rowCount: 80,
        columns: [
          { name: "PRODUCT_ID", type: "VARCHAR", nullable: false, pk: true },
          { name: "NAME",       type: "VARCHAR", nullable: false },
          { name: "CATEGORY",   type: "VARCHAR", nullable: false, description: "Electronics | Sports | Home & Kitchen | Books | Health | Clothing" },
          { name: "PRICE",      type: "FLOAT",   nullable: false },
          { name: "STOCK",      type: "INTEGER", nullable: false, description: "0 = Out of Stock" },
          { name: "RATING",     type: "FLOAT",   nullable: true,  description: "Average rating 1–5" },
        ],
      },
      {
        name: "CUSTOMERS",
        description: "Customer profiles with spend and VIP status",
        rowCount: 120,
        columns: [
          { name: "CUSTOMER_ID",   type: "VARCHAR", nullable: false, pk: true },
          { name: "NAME",          type: "VARCHAR", nullable: false },
          { name: "EMAIL",         type: "VARCHAR", nullable: false },
          { name: "COUNTRY",       type: "VARCHAR", nullable: false },
          { name: "TOTAL_ORDERS",  type: "INTEGER", nullable: false },
          { name: "TOTAL_SPENT",   type: "FLOAT",   nullable: false },
          { name: "STATUS",        type: "VARCHAR", nullable: false, description: "VIP | Active | Inactive" },
        ],
      },
      {
        name: "ORDER_ITEMS",
        description: "Line items linking orders to products",
        rowCount: 600,
        columns: [
          { name: "ITEM_ID",      type: "VARCHAR", nullable: false, pk: true },
          { name: "ORDER_ID",     type: "VARCHAR", nullable: false, fk: "ORDERS.ORDER_ID" },
          { name: "PRODUCT_NAME", type: "VARCHAR", nullable: false },
          { name: "CATEGORY",     type: "VARCHAR", nullable: false },
          { name: "QUANTITY",     type: "INTEGER", nullable: false },
          { name: "UNIT_PRICE",   type: "FLOAT",   nullable: false },
          { name: "SUBTOTAL",     type: "FLOAT",   nullable: false },
        ],
      },
    ],
  }],
};

// ── Column type icon ──────────────────────────────────────────────────────────
function TypeIcon({ type, className }: { type: ColType; className?: string }) {
  const base = cn("w-3 h-3 shrink-0", className);
  if (type === "DATE")    return <Calendar    className={cn(base, "text-blue-400")} />;
  if (type === "FLOAT")   return <DollarSign  className={cn(base, "text-green-500")} />;
  if (type === "INTEGER") return <Hash        className={cn(base, "text-gray-400")} />;
  if (type === "BOOLEAN") return <Tag         className={cn(base, "text-purple-400")} />;
  return                         <AlignLeft   className={cn(base, "text-gray-400")} />;
}

// ── Column type badge ─────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: ColType }) {
  const colors: Record<ColType, string> = {
    VARCHAR: "bg-gray-100 text-gray-500",
    DATE:    "bg-blue-50  text-blue-500",
    FLOAT:   "bg-green-50 text-green-600",
    INTEGER: "bg-gray-100 text-gray-500",
    BOOLEAN: "bg-purple-50 text-purple-500",
  };
  return (
    <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded font-medium", colors[type])}>
      {type}
    </span>
  );
}

export default function SchemaPage() {
  const router = useRouter();
  const [openSchemas, setOpenSchemas]   = useState<Set<string>>(new Set(["RETAIL"]));
  const [openTables, setOpenTables]     = useState<Set<string>>(new Set());
  const [selected, setSelected]         = useState<TableDef | null>(null);
  const [colSearch, setColSearch]       = useState("");

  const toggleSchema = (name: string) => setOpenSchemas(s => {
    const n = new Set(s); n.has(name) ? n.delete(name) : n.add(name); return n;
  });
  const toggleTable = (name: string) => {
    const table = DB.schemas[0].tables.find(t => t.name === name) ?? null;
    setOpenTables(s => {
      const n = new Set(s); n.has(name) ? n.delete(name) : n.add(name); return n;
    });
    setSelected(table);
    setColSearch("");
  };

  const filteredCols = selected?.columns.filter(c =>
    c.name.toLowerCase().includes(colSearch.toLowerCase()) ||
    (c.description ?? "").toLowerCase().includes(colSearch.toLowerCase())
  ) ?? [];

  const queryTable = (tableName: string) => {
    router.push(`/explorer?q=${encodeURIComponent(`Montre-moi les 10 premières lignes de ${tableName}`)}`);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Left tree ──────────────────────────────────────────────────── */}
      <div className="w-64 shrink-0 flex flex-col border-r border-gray-200 bg-white">
        <div className="px-4 py-3 border-b border-gray-200">
          <h1 className="text-sm font-semibold text-gray-900">Database Explorer</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">E-Commerce Demo</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {/* Database node */}
          <div className="px-3 py-1.5 flex items-center gap-2 text-xs text-gray-500">
            <Database className="w-3.5 h-3.5 text-[#29B5E8]" />
            <span className="font-semibold text-gray-700 font-mono text-[11px]">E_COMMERCE_DEMO</span>
          </div>

          {DB.schemas.map(schema => (
            <div key={schema.name}>
              {/* Schema node */}
              <button
                onClick={() => toggleSchema(schema.name)}
                className="w-full flex items-center gap-2 px-5 py-1 text-[11px] text-gray-500 hover:bg-gray-50 transition-colors"
              >
                {openSchemas.has(schema.name)
                  ? <ChevronDown className="w-3 h-3 text-gray-400" />
                  : <ChevronRight className="w-3 h-3 text-gray-400" />}
                <Layers className="w-3 h-3 text-gray-400" />
                <span className="font-mono font-medium">{schema.name}</span>
              </button>

              {openSchemas.has(schema.name) && (
                <div>
                  {/* Tables group label */}
                  <div className="px-8 py-0.5 text-[9px] text-gray-400 uppercase tracking-wider font-semibold">
                    Tables {schema.tables.length}
                  </div>

                  {schema.tables.map(table => (
                    <div key={table.name}>
                      <button
                        onClick={() => toggleTable(table.name)}
                        className={cn(
                          "w-full flex items-center gap-2 px-8 py-1.5 text-[11px] hover:bg-gray-50 transition-colors",
                          selected?.name === table.name
                            ? "bg-[#EEF6FB] text-[#1B87D9]"
                            : "text-gray-600"
                        )}
                      >
                        {openTables.has(table.name)
                          ? <ChevronDown className="w-3 h-3 shrink-0 text-gray-400" />
                          : <ChevronRight className="w-3 h-3 shrink-0 text-gray-400" />}
                        <Table2 className={cn("w-3 h-3 shrink-0", selected?.name === table.name ? "text-[#29B5E8]" : "text-gray-400")} />
                        <span className="font-mono truncate">{table.name}</span>
                        <span className="ml-auto text-[9px] text-gray-300 font-mono shrink-0">
                          {table.rowCount.toLocaleString()}
                        </span>
                      </button>

                      {/* Inline columns preview */}
                      {openTables.has(table.name) && (
                        <div className="pl-14 pr-3 pb-1">
                          {table.columns.map(col => (
                            <div key={col.name} className="flex items-center gap-1.5 py-0.5">
                              <TypeIcon type={col.type} />
                              <span className="text-[10px] font-mono text-gray-500 truncate">{col.name}</span>
                              {col.pk && <Key className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right detail panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {selected ? (
          <>
            {/* Table header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-3">
                <Table2 className="w-5 h-5 text-[#29B5E8]" />
                <div>
                  <h2 className="text-sm font-bold text-gray-900 font-mono">{selected.name}</h2>
                  <p className="text-[11px] text-gray-400">{selected.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-gray-400 font-mono">
                  {selected.rowCount.toLocaleString()} rows · {selected.columns.length} columns
                </span>
                <button
                  onClick={() => queryTable(selected.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#29B5E8] hover:bg-[#1fa8d8] text-white text-xs rounded-lg transition-colors font-medium"
                >
                  <Play className="w-3 h-3 fill-white" />
                  Query this table
                </button>
              </div>
            </div>

            {/* Column search */}
            <div className="px-6 py-2 border-b border-gray-100 bg-[#F8F9FA] shrink-0">
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  value={colSearch} onChange={e => setColSearch(e.target.value)}
                  placeholder="Search columns..."
                  className="w-full pl-7 pr-3 py-1 text-[11px] border border-gray-200 rounded bg-white outline-none focus:border-[#29B5E8] font-mono"
                />
              </div>
            </div>

            {/* Columns table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#F8F9FA] border-b border-gray-200 z-10">
                  <tr>
                    <th className="px-6 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Column</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Nullable</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCols.map((col, i) => (
                    <tr key={col.name} className="border-b border-gray-100 hover:bg-[#F0F7FF] transition-colors">
                      <td className="px-6 py-2 text-[10px] text-gray-300 font-mono">{i + 1}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <TypeIcon type={col.type} />
                          <span className="font-mono font-medium text-gray-800">{col.name}</span>
                          {col.pk && (
                            <span className="flex items-center gap-0.5 text-[9px] text-amber-600 bg-amber-50 border border-amber-200 px-1 rounded font-medium">
                              <Key className="w-2.5 h-2.5" />PK
                            </span>
                          )}
                          {col.fk && (
                            <span className="text-[9px] text-blue-500 bg-blue-50 border border-blue-200 px-1 rounded font-mono">
                              FK → {col.fk}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2"><TypeBadge type={col.type} /></td>
                      <td className="px-4 py-2 text-[11px] font-mono text-gray-400">
                        {col.nullable ? "YES" : <span className="text-gray-700 font-semibold">NO</span>}
                      </td>
                      <td className="px-4 py-2 text-[11px] text-gray-400">
                        {col.description ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <Database className="w-14 h-14 text-gray-100" />
            <p className="text-sm text-gray-400">Select a table to explore its schema</p>
            <p className="text-[11px] text-gray-300 font-mono">Click on a table in the left panel</p>
          </div>
        )}
      </div>
    </div>
  );
}
