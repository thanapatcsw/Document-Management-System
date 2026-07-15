"use client";

import React from "react";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  size?: "default" | "compact";
  actions?: React.ReactNode;
  className?: string;
};

export default function PageHeader({
  title,
  subtitle,
  size = "default",
  actions,
  className,
}: PageHeaderProps) {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.username || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className={cn("flex items-center justify-between gap-4 mb-8", className)}>
      <div>
        <h2
          className={cn(
            "font-bold text-slate-900",
            size === "compact" ? "text-xl" : "text-2xl"
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "text-slate-400 font-semibold",
              size === "compact" ? "text-xs" : "text-sm"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {actions}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2.5 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 transition-all"
        >
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          <Bell className="w-5 h-5 text-slate-500" />
        </button>
        <div className="flex items-center gap-2.5">
          <Avatar>
            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold text-slate-700 hidden md:block">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}
