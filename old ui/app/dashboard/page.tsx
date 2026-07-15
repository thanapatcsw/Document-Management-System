"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Clock,
  AlertTriangle,
  ChevronDown,
  FileText,
  CheckSquare,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/AuthProvider";

// Import sub-components
import StatCard, { StatCardRow } from "@/components/dashboard/StatCard";
import StatusBanner from "@/components/dashboard/StatusBanner";
import RecentDocumentsTable from "@/components/dashboard/RecentDocumentsTable";
import DocumentTypesChart from "@/components/dashboard/DocumentTypesChart";
import WorkflowTrendChart from "@/components/dashboard/WorkflowTrendChart";
import ApprovalGoalsPanel from "@/components/dashboard/ApprovalGoalsPanel";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { DashboardLayout } from "@/components/shared";
import { getDashboardStats } from "@/features/documents/api";
import { DashboardStats, Document } from "@/features/documents/types";

const NOTIFICATIONS = (activity: { id: string; delta: string }[]) =>
  activity.slice(0, 2).map((item) => ({
    id: item.id,
    title: "Document Activity",
    detail: `${item.id} ${item.delta}`,
  }));

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const { user, logout } = useAuth();

  // Interaction UI states
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close any open dropdown on Escape for keyboard users
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle outside click to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    getDashboardStats()
      .then((data) => {
        setStats(data);
        setStatsError(false);
      })
      .catch(() => setStatsError(true));
  }, []);

  const documents: Document[] = stats?.documents ?? [];
  const filteredDocuments = documents.filter((doc) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      doc.name.toLowerCase().includes(query) ||
      doc.id.toLowerCase().includes(query) ||
      doc.sender.toLowerCase().includes(query);

    if (statusFilter === "All") return matchesSearch;
    return matchesSearch && doc.status === statusFilter;
  });

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
  };

  const displayName = user?.full_name || user?.username || "User";
  const displaySub = user?.username || "user@dms.local";
  const notifications = NOTIFICATIONS(stats?.activity ?? []);
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 w-full px-6 lg:px-8 xl:px-10 py-10">
        {/* 2. TOP HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 py-2">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Overview
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Hello, Administrator. Here&apos;s your overview.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial">
              <label htmlFor="doc-search" className="sr-only">
                Search documents, IDs, or senders
              </label>
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Search className="w-5 h-5" aria-hidden="true" />
              </span>
              <input
                id="doc-search"
                type="text"
                placeholder="Search documents, IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-xs"
              />
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen((v) => !v);
                  setIsUserMenuOpen(false);
                }}
                className="relative p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-xs"
                aria-haspopup="true"
                aria-expanded={isNotificationsOpen}
                aria-label={`Notifications, ${notifications.length} unread`}
              >
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                <Bell className="w-6 h-6 text-slate-500" />
              </button>

              {isNotificationsOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 z-20 space-y-3 origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                    <span className="text-sm font-bold text-slate-900">
                      Recent Notifications
                    </span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {notifications.length} New
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="text-sm hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                      >
                        <p className="font-bold text-slate-800">{n.title}</p>
                        <p className="text-slate-400 font-medium mt-0.5">
                          {n.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen((v) => !v);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-xs"
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen}
                aria-label="User menu"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-base font-semibold text-slate-700 truncate max-w-[80px] sm:max-w-none">
                  {displayName}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl p-2.5 z-20 space-y-1 origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-3 py-2 border-b border-slate-50 mb-1">
                    <p className="text-sm font-bold text-slate-800">{displayName}</p>
                    <p className="text-xs text-slate-400 font-medium">
                      {displaySub}
                    </p>
                  </div>
                  <Link
                    href="/settings"
                    role="menuitem"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full text-left block px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    System Settings
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left block px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. STATUS BANNER */}
        {statsError && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            Cannot reach API server. Run backend:{" "}
            <code className="font-mono text-xs">cd dms-backend &amp;&amp; npm run start:dev</code>
          </div>
        )}
        <StatusBanner pendingCount={stats?.pending ?? 0} />

        {/* 4. STAT CARDS GRID */}
        <StatCardRow>
          <StatCard
            title="Total Submissions"
            value={stats?.total ?? 0}
            isActive={statusFilter === "All"}
            onClick={() => setStatusFilter("All")}
            trend={`${stats?.approved ?? 0} approved`}
            trendType="neutral"
            icon={
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
            }
          />

          <StatCard
            title="Approved"
            value={stats?.approved ?? 0}
            isActive={statusFilter === "Approved"}
            onClick={() => setStatusFilter("Approved")}
            trend={`${stats?.pending ?? 0} pending`}
            trendType="neutral"
            icon={
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
                <CheckSquare className="w-6 h-6" />
              </div>
            }
          />

          <StatCard
            title="Pending Review"
            value={stats?.pending ?? 0}
            isActive={statusFilter === "Pending"}
            onClick={() => setStatusFilter("Pending")}
            trend={`${stats?.actionRequired ?? 0} action required`}
            trendType="neutral"
            icon={
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
            }
          />

          <StatCard
            title="Action Required"
            value={stats?.actionRequired ?? 0}
            isActive={statusFilter === "Returned for Revision"}
            onClick={() => setStatusFilter("Returned for Revision")}
            trend={`${stats?.pending ?? 0} pending`}
            trendType="down"
            icon={
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
            }
          />
        </StatCardRow>

        {/* COMPREHENSIVE DUAL COLUMN LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMNS (Trend chart & Documents table) */}
          <div className="xl:col-span-8 space-y-8">
            <WorkflowTrendChart data={stats?.trend ?? []} />

            <RecentDocumentsTable
              documents={filteredDocuments}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
            />
          </div>

          {/* RIGHT COLUMN (Donut Chart & Goals Panel) */}
          <div className="xl:col-span-4 space-y-8">
            <DocumentTypesChart data={stats?.types ?? []} />
            <div className="grid grid-cols-1 gap-8">
              <ApprovalGoalsPanel goals={stats?.goals ?? []} />
              <ActivityFeed items={stats?.activity ?? []} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
