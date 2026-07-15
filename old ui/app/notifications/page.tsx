"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/shared";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats } from "@/features/documents/api";
import { Bell, CheckCircle2 } from "lucide-react";

type Notification = {
  id: string;
  type: "Approval" | "Document" | "System";
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    getDashboardStats().then((stats) => {
      setItems(
        stats.activity.map((item, index) => ({
          id: item.id,
          type: index % 2 === 0 ? "Approval" : "Document",
          title: index % 2 === 0 ? "Approval Needed" : "Document Updated",
          message: `${item.id} ${item.delta}`,
          createdAt: item.timestamp,
          isRead: index > 1,
        }))
      );
    });
  }, []);

  const unread = useMemo(() => items.filter((n) => !n.isRead), [items]);

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 w-full px-6 lg:px-8 xl:px-10 py-8">
        <PageHeader size="compact" className="mb-6" title="Notifications Center" subtitle="Track workflow updates and system alerts." />
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    {!item.isRead && <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">New</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">{item.message}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-2">{item.createdAt}</p>
                </div>
              </div>
              <button
                onClick={() => setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, isRead: true } : row)))}
                className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-emerald-600 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark read
              </button>
            </div>
          ))}
          {unread.length === 0 && items.length > 0 && (
            <p className="text-xs text-slate-400 font-semibold text-center">All caught up.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
