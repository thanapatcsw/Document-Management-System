"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/shared";
import { getDashboardStats } from "@/features/documents/api";
import { DashboardStats, Document } from "@/features/documents/types";
import DocumentTypesChart from "@/components/dashboard/DocumentTypesChart";
import WorkflowTrendChart from "@/components/dashboard/WorkflowTrendChart";
import PageHeader from "@/components/shared/PageHeader";

export default function ReportsPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getDashboardStats()
      .then(setDashboardStats)
      .finally(() => setLoading(false));
  }, []);

  const documents: Document[] = dashboardStats?.documents ?? [];

  const summary = useMemo(() => {
    const total = documents.length;
    const pending = documents.filter((d) => d.status === "Pending").length;
    const approved = documents.filter((d) => d.status === "Approved").length;
    const returned = documents.filter((d) => d.status === "Returned for Revision").length;
    const cancelled = documents.filter((d) => d.status === "Cancelled").length;
    return { total, pending, approved, returned, cancelled };
  }, [documents]);

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <PageHeader
          title="System Analytics & Reports"
          subtitle="Track historical output, processing times, and department submission distributions."
        />

        {/* 5-CARDS STAT ROW */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Filed</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {loading ? "--" : summary.total}
            </span>
            <span className="text-xs font-bold text-emerald-600 block mt-1">{summary.approved} approved</span>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-amber-600">Pending</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {loading ? "--" : summary.pending}
            </span>
            <span className="text-xs font-bold text-slate-400 block mt-1">Awaiting review</span>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-emerald-600">Approved</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {loading ? "--" : summary.approved}
            </span>
            <span className="text-xs font-bold text-emerald-600 block mt-1">
              {summary.total > 0 ? Math.round((summary.approved / summary.total) * 100) : 0}% compliance
            </span>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-rose-500">Returned</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {loading ? "--" : summary.returned}
            </span>
            <span className="text-xs font-bold text-rose-500 block mt-1">Needs revision</span>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs col-span-2 md:col-span-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-slate-500">Cancelled</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {loading ? "--" : summary.cancelled}
            </span>
            <span className="text-xs font-bold text-slate-400 block mt-1">Archived</span>
          </div>
        </div>

        {/* CHARTS REUSED ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WorkflowTrendChart data={dashboardStats?.trend ?? []} />
          </div>
          <div>
            <DocumentTypesChart data={dashboardStats?.types ?? []} />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
