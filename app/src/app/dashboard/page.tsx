"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, ShoppingCart, Users, DollarSign,
  RotateCcw, MessageSquare, LayoutGrid, Table2, Plus, Sparkles,
  ArrowUpRight, ChevronDown, Download, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KPIS, ORDERS, PRODUCTS } from "@/lib/mock-data";

// ── Données pour les charts ──────────────────────────────────────────────────

const revenueByMonth = [
  { month: "Juil", revenue: 18400, orders: 62 },
  { month: "Août", revenue: 22100, orders: 74 },
  { month: "Sep",  revenue: 19800, orders: 68 },
  { month: "Oct",  revenue: 25300, orders: 89 },
  { month: "Nov",  revenue: 31200, orders: 104 },
  { month: "Déc",  revenue: 28700, orders: 96 },
];

const categoryRevenue = [
  { name: "Electronics",    value: 42300, color: "#29B5E8" },
  { name: "Sports",         value: 18700, color: "#6366f1" },
  { name: "Home & Kitchen", value: 15200, color: "#8b5cf6" },
  { name: "Health",         value: 11400, color: "#a78bfa" },
  { name: "Books",          value: 6800,  color: "#c4b5fd" },
  { name: "Clothing",       value: 9100,  color: "#ddd6fe" },
];

const statusDist = [
  { name: "Completed",  value: 134, color: "#10b981" },
  { name: "Pending",    value: 42,  color: "#f59e0b" },
  { name: "Processing", value: 28,  color: "#3b82f6" },
  { name: "Refunded",   value: 22,  color: "#ef4444" },
  { name: "Cancelled",  value: 14,  color: "#9ca3af" },
];

const topProducts = PRODUCTS
  .map(p => ({ name: p.name, total: p.price * (p.stock > 0 ? p.stock : 10), qty: p.stock }))
  .sort((a, b) => b.total - a.total)
  .slice(0, 5);

// ── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "simple" | "expert";

// ── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, trend, trendUp, color,
}: {
  label: string; value: string; sub: string;
  icon: React.ElementType; trend: string; trendUp: boolean; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className={cn(
          "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
          trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
        )}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
      <p className="text-[11px] text-gray-400 border-t border-gray-50 pt-3">{sub}</p>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      {action && (
        <button className="flex items-center gap-1 text-[11px] text-[#29B5E8] hover:underline font-medium">
          {action} <ArrowUpRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ── Chart card wrapper ────────────────────────────────────────────────────────

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <button className="p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
      {children}
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{typeof p.value === "number" && p.value > 999 ? `$${p.value.toLocaleString()}` : p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("simple");
  const [period, setPeriod] = useState("6 derniers mois");

  const totalRevenue = revenueByMonth.reduce((s, m) => s + m.revenue, 0);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F9FA]">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 shrink-0">
        <div>
          <h1 className="text-sm font-bold text-gray-900">Vue d&apos;ensemble</h1>
          <p className="text-[11px] text-gray-400">E-Commerce Demo · mis à jour il y a 2 min</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            {period}
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {/* Mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setMode("simple")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                mode === "simple" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Visuel
            </button>
            <button
              onClick={() => setMode("expert")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                mode === "expert" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Table2 className="w-3.5 h-3.5" /> Expert
            </button>
          </div>

          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => router.push("/explorer")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#29B5E8] hover:bg-[#1fa8d8] text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask AI
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        {/* ── KPI strip ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard
            label="Chiffre d'affaires"
            value={`$${(totalRevenue / 1000).toFixed(0)}k`}
            sub="vs $138k le semestre précédent"
            icon={DollarSign}
            trend="+12.4%"
            trendUp={true}
            color="bg-gradient-to-br from-[#29B5E8] to-[#1B87D9]"
          />
          <KpiCard
            label="Commandes totales"
            value={String(KPIS.total_orders)}
            sub={`${KPIS.pending_orders} en attente de traitement`}
            icon={ShoppingCart}
            trend="+8.1%"
            trendUp={true}
            color="bg-gradient-to-br from-indigo-500 to-violet-600"
          />
          <KpiCard
            label="Clients actifs"
            value="120"
            sub="18 nouveaux ce mois-ci"
            icon={Users}
            trend="+5.3%"
            trendUp={true}
            color="bg-gradient-to-br from-emerald-400 to-emerald-600"
          />
          <KpiCard
            label="Taux de remboursement"
            value={`${((KPIS.refunded_orders / KPIS.total_orders) * 100).toFixed(1)}%`}
            sub={`${KPIS.refunded_orders} commandes remboursées`}
            icon={RotateCcw}
            trend="-0.8%"
            trendUp={false}
            color="bg-gradient-to-br from-orange-400 to-rose-500"
          />
        </div>

        {/* ── Charts row 1 ───────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Revenue area chart */}
          <ChartCard title="Évolution du chiffre d'affaires" className="col-span-2">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueByMonth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#29B5E8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#29B5E8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#29B5E8" strokeWidth={2} fill="url(#revenueGrad)" dot={{ r: 3, fill: "#29B5E8", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Status donut */}
          <ChartCard title="Répartition des statuts">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {statusDist.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} cmd`, n]} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #f3f4f6" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
              {statusDist.map(s => (
                <span key={s.name} className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                  {s.name}
                </span>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* ── Charts row 2 ───────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Category bar chart */}
          <ChartCard title="CA par catégorie" className="col-span-2">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={categoryRevenue} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #f3f4f6" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16}>
                  {categoryRevenue.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top products */}
          <ChartCard title="Top produits">
            <div className="space-y-2.5">
              {topProducts.map((p, i) => {
                const pct = Math.round((p.total / (topProducts[0]?.total || 1)) * 100);
                return (
                  <div key={p.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-gray-700 truncate max-w-[140px]">{p.name}</span>
                      <span className="text-[11px] font-semibold text-gray-800">${p.total.toFixed(0)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: i === 0 ? "#29B5E8" : i === 1 ? "#6366f1" : "#a78bfa" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        {/* ── Expert mode: orders table ───────────────────────────────── */}
        {mode === "expert" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Dernières commandes</p>
              <button
                onClick={() => router.push("/explorer")}
                className="flex items-center gap-1.5 text-xs text-[#29B5E8] hover:underline font-medium"
              >
                Voir tout dans Explorer <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#F8F9FA] border-b border-gray-100">
                  <tr>
                    {["#", "Order ID", "Client", "Date", "Statut", "Montant", "Paiement"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ORDERS.slice(0, 8).map((row, i) => (
                    <tr key={row.order_id} className="border-b border-gray-50 hover:bg-[#F0F7FF] transition-colors">
                      <td className="px-4 py-2.5 text-[10px] text-gray-300 font-mono">{i + 1}</td>
                      <td className="px-4 py-2.5 font-mono font-medium text-gray-700">{row.order_id}</td>
                      <td className="px-4 py-2.5 text-gray-600">{row.customer_name}</td>
                      <td className="px-4 py-2.5 text-gray-400 font-mono">{row.order_date}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                          row.status === "Completed"  ? "bg-emerald-50 text-emerald-700" :
                          row.status === "Pending"    ? "bg-amber-50 text-amber-700" :
                          row.status === "Refunded"   ? "bg-red-50 text-red-600" :
                          row.status === "Cancelled"  ? "bg-gray-100 text-gray-500" :
                          "bg-blue-50 text-blue-600"
                        )}>{row.status}</span>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-gray-800">${row.total_amount?.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-gray-400">{row.payment_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Ask AI banner ───────────────────────────────────────────── */}
        <div
          onClick={() => router.push("/explorer")}
          className="flex items-center justify-between bg-gradient-to-r from-[#1B87D9] to-[#6366f1] rounded-2xl px-6 py-4 cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Posez une question à l&apos;IA</p>
              <p className="text-[11px] text-white/70">«&nbsp;Quels sont mes clients VIP ce trimestre&nbsp;?&nbsp;»</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/80 font-medium">Ouvrir Explorer</span>
            <ArrowUpRight className="w-4 h-4 text-white/80" />
          </div>
        </div>

        {/* ── Add widget CTA (mode simple) ───────────────────────────── */}
        {mode === "simple" && (
          <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-xs text-gray-400 hover:border-[#29B5E8] hover:text-[#29B5E8] transition-colors group">
            <Plus className="w-4 h-4" />
            Ajouter un widget
          </button>
        )}

      </div>
    </div>
  );
}
