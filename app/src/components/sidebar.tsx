"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  History,
  Database,
  Settings,
  Zap,
  ChevronsUpDown,
  HelpCircle,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/explorer",   label: "Explorer",   icon: MessageSquare },
  { href: "/history",    label: "Historique", icon: History },
  { href: "/schema",     label: "Schéma DB",  icon: Database },
];

const settingsNav = [
  { href: "/settings",   label: "Settings",   icon: Settings },
  { href: "/settings/payments", label: "Payment Gateways", icon: CreditCard },
  { href: "/help",       label: "Help Center", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/explorer") return pathname === "/" || pathname.startsWith("/explorer");
    return pathname === href;
  };

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-white border-r border-gray-200 min-h-screen">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">DataQuery</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Powered by Claude</p>
          </div>
        </div>
      </div>

      {/* Workspace selector */}
      <div className="px-4 py-3 border-b border-gray-100">
        <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[9px] text-white font-bold">E</div>
            <span className="text-xs font-medium text-gray-700">E-Commerce Demo</span>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Main</p>
        <div className="space-y-0.5 mb-4">
          {mainNav.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                )}>
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-blue-600" : "text-gray-400")} />
                {label}
              </Link>
            );
          })}
        </div>

        <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Settings</p>
        <div className="space-y-0.5">
          {settingsNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                )}>
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-blue-600" : "text-gray-400")} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom — user */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] text-white font-bold shrink-0">N</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">Utilisateur</p>
            <p className="text-[10px] text-gray-400 truncate">user@company.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
