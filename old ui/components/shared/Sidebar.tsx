"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Database,
  BarChart3,
  Settings,
  ChevronLeft,
  LogOut,
  FileBox,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSidebar } from "@/components/providers/SidebarProvider";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Approvals", href: "/approvals", icon: CheckSquare },
  { name: "Master Data", href: "/master-data", icon: Database },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const { isOpen, toggle } = useSidebar();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const displayName = user?.full_name || user?.username || "User";
  const displaySub = user?.username || "user@dms.local";
  const initials = useMemo(() => {
    const source = displayName || displaySub;
    return source
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [displayName, displaySub]);

  return (
    <aside
      className={`fixed left-0 top-0 z-30 h-screen bg-white border-r border-slate-100 flex flex-col transition-all duration-200 ease-in-out ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Top Section / Logo */}
      <div className="p-6 flex-shrink-0">
        <div className={`flex items-center ${isOpen ? "gap-3" : "justify-center"}`}>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <FileBox className="w-6 h-6" />
          </div>
          {isOpen && (
            <div className="min-w-0">
              <h1 className="font-bold text-slate-900 leading-tight truncate">
                DMS Electronic
              </h1>
              <p className="text-xs text-slate-400 font-semibold truncate">
                Approval System
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-xl text-sm font-medium transition-all ${
                isOpen ? "px-4 py-3 gap-3.5" : "p-3 justify-center"
              } ${
                isActive
                  ? "rounded-lg bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
              title={!isOpen ? item.name : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? "text-blue-600" : "text-slate-400"
                }`}
              />
              {isOpen && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto p-4 border-t border-slate-100 flex-shrink-0">
        {/* User Profile */}
        <div
          className={`flex items-center w-full rounded-xl ${
            isOpen ? "gap-3 px-2 py-1" : "justify-center py-1"
          }`}
        >
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isOpen && (
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {displayName}
              </p>
              <p className="text-xs text-slate-400 font-medium truncate">
                {displaySub}
              </p>
            </div>
          )}
          <button
            onClick={logout}
            className={`ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ${
              isOpen ? "" : "hidden"
            }`}
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={logout}
          className={`mt-2 flex items-center justify-center text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors ${
            isOpen ? "hidden" : ""
          }`}
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={toggle}
        className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <ChevronLeft className={`h-3.5 w-3.5 transition-transform ${isOpen ? "" : "rotate-180"}`} />
      </button>
    </aside>
  );
}
