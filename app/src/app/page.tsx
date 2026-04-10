"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, TrendingUp, BarChart2, Calendar, Database, Snowflake, Bot } from "lucide-react";

const quickActions = [
  {
    icon: TrendingUp,
    label: "Explorer les ventes",
    description: "Top 10 commandes récentes",
    query: "Montre-moi les 10 commandes les plus récentes",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: BarChart2,
    label: "Analyser les tendances",
    description: "CA par catégorie de produit",
    query: "Quel est le chiffre d'affaires par catégorie de produit ?",
    color: "from-violet-500 to-violet-600",
  },
  {
    icon: Calendar,
    label: "Comparer les périodes",
    description: "Novembre vs Décembre",
    query: "Compare les ventes de novembre et décembre",
    color: "from-indigo-500 to-indigo-600",
  },
];

export default function HomePage() {
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleSubmit = (query: string) => {
    if (!query.trim()) return;
    router.push(`/explorer?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen relative overflow-hidden px-6"
      style={{ background: "linear-gradient(135deg, #e8e8f4 0%, #dcd8f0 35%, #d4d8f0 65%, #d8dff5 100%)" }}
    >
      {/* Subtle blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-300 opacity-25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-300 opacity-20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 opacity-15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur border border-white/80 rounded-full px-4 py-1.5 text-xs text-indigo-600 font-medium mb-2 shadow-sm">
            <Bot className="w-3.5 h-3.5" />
            AI-Powered Data Assistant
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Bonjour, prêt à explorer<br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              vos données ?
            </span>
          </h1>
          <p className="text-gray-500 text-base">
            Posez une question en français ou en anglais,<br />obtenez une réponse instantanée.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {quickActions.map(({ icon: Icon, label, description, query, color }) => (
            <button
              key={label}
              onClick={() => handleSubmit(query)}
              className="group bg-white/70 backdrop-blur border border-white/90 rounded-xl p-4 text-left hover:bg-white/90 hover:shadow-md transition-all duration-200 cursor-pointer shadow-sm"
            >
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${color} mb-3`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-gray-800 text-sm font-medium leading-tight">{label}</p>
              <p className="text-gray-400 text-xs mt-1">{description}</p>
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="w-full">
          <div className="relative bg-white/80 backdrop-blur border border-white shadow-sm rounded-2xl p-1 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(input)}
              placeholder="Ex: Quelles sont les 10 meilleures ventes du mois dernier ?"
              className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm px-4 py-3 outline-none pr-12"
            />
            <button
              onClick={() => handleSubmit(input)}
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="flex items-center gap-1.5 bg-white/60 backdrop-blur border border-white/80 rounded-full px-3 py-1 text-xs text-gray-600 shadow-sm">
            <Snowflake className="w-3 h-3 text-blue-500" />
            Snowflake connecté
          </span>
          <span className="flex items-center gap-1.5 bg-white/60 backdrop-blur border border-white/80 rounded-full px-3 py-1 text-xs text-gray-600 shadow-sm">
            <Database className="w-3 h-3 text-indigo-500" />
            Dataset: E-Commerce Demo
          </span>
          <span className="flex items-center gap-1.5 bg-white/60 backdrop-blur border border-white/80 rounded-full px-3 py-1 text-xs text-gray-600 shadow-sm">
            <Bot className="w-3 h-3 text-violet-500" />
            Powered by Claude
          </span>
        </div>
      </div>
    </div>
  );
}
