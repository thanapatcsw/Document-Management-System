"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/shared";
import PageHeader from "@/components/shared/PageHeader";
import RecentDocumentsTable from "@/components/dashboard/RecentDocumentsTable";
import { searchDocuments } from "@/features/documents/api";
import { Document } from "@/features/documents/types";

export default function SearchPage() {
  const [filters, setFilters] = useState({
    type: "All",
    status: "All",
    from: "",
    to: "",
    sender: "",
    keyword: "",
  });
  const [results, setResults] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredResults = results.filter((doc) => {
    const matchesStatus = statusFilter === "All" || doc.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      q.length === 0 ||
      doc.name.toLowerCase().includes(q) ||
      doc.id.toLowerCase().includes(q) ||
      doc.sender.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await searchDocuments({
        type: filters.type === "All" ? undefined : filters.type,
        status: filters.status === "All" ? undefined : filters.status,
        from: filters.from || undefined,
        to: filters.to || undefined,
        sender: filters.sender || undefined,
        keyword: filters.keyword || undefined,
      });
      setResults(data);
      setStatusFilter("All");
      setSearchQuery("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 w-full px-6 lg:px-8 xl:px-10 py-8">
        <PageHeader
          size="compact"
          className="mb-6"
          title="Advanced Multi-Field Search"
          subtitle="Find documents across type, status, dates, and keywords."
        />

        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Document Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
              >
                <option value="All">All</option>
                <option value="PR">PR</option>
                <option value="PO">PO</option>
                <option value="Data Record">Data Record</option>
                <option value="PDF">PDF</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
              >
                <option value="All">All</option>
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Returned for Revision">Returned for Revision</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Sender</label>
              <input
                value={filters.sender}
                onChange={(e) => setFilters({ ...filters, sender: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                placeholder="Sender name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">From</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">To</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Keyword</label>
              <input
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                placeholder="Title or doc number"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <RecentDocumentsTable
            documents={filteredResults}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
