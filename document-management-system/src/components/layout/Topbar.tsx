"use client";

import { Bell, Search } from "lucide-react";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length;
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-[--color-border] bg-white px-6">
      {/* Page Title */}
      <h1 className="text-base font-semibold text-slate-800">{title}</h1>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="relative flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Bell className="size-4.5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-[--color-border] bg-white shadow-lg">
              <div className="border-b border-[--color-border] px-4 py-3">
                <p className="text-sm font-semibold text-slate-700">การแจ้งเตือน</p>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      "border-b border-[--color-border] px-4 py-3 last:border-0",
                      !n.is_read && "bg-blue-50/50"
                    )}
                  >
                    <p className="text-sm text-slate-700">{n.message}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {new Date(n.created_at).toLocaleString("th-TH", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
