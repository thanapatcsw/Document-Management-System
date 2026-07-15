"use client";

import React, { useEffect } from "react";
import {
  Bell,
  User,
  Sliders,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { DashboardLayout } from "@/components/shared";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib";
import PageHeader from "@/components/shared/PageHeader";
import { useToast } from "@/components/providers/ToastProvider";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function SettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const settingsSchema = z.object({
    profileName: z.string().min(1, "Full name is required."),
    profileEmail: z.string().email("Enter a valid email address."),
    companyName: z.string().min(1, "Company name is required."),
    docNumberFormat: z
      .string()
      .min(1, "Document format is required.")
      .refine((value) => value.includes("{SEQ}"), "Pattern must include {SEQ}."),
    notifEmail: z.boolean(),
    notifInApp: z.boolean(),
  });

  type SettingsForm = z.infer<typeof settingsSchema>;

  const {
    register,
    handleSubmit,
    formState,
    setValue,
    watch,
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      profileName: user?.full_name || "System Administrator",
      profileEmail: user?.username || "admin@dms.local",
      companyName: "Webpark Software Co., Ltd.",
      docNumberFormat: "DMS-{YYYY}-{SEQ}",
      notifEmail: true,
      notifInApp: true,
    },
  });

  useEffect(() => {
    setValue("profileName", user?.full_name || "System Administrator", { shouldDirty: false });
    setValue("profileEmail", user?.username || "admin@dms.local", { shouldDirty: false });
  }, [setValue, user]);

  const handleSave = handleSubmit(async (values) => {
    try {
      await api.post("/api/settings", {
        profileName: values.profileName,
        profileEmail: values.profileEmail,
        companyName: values.companyName,
        docNumberFormat: values.docNumberFormat,
        notifEmail: values.notifEmail,
        notifInApp: values.notifInApp,
      });
      showToast("Settings saved successfully!", "success");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save settings", "error");
    }
  });

  const notifEmail = watch("notifEmail");
  const notifInApp = watch("notifInApp");

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <PageHeader
          title="System Preferences & Settings"
          subtitle="Change personal parameters, notification rules, and structural naming formats."
        />

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* PROFILE SETTINGS CARD */}
          <div className="bg-white rounded-2xl p-10 border border-slate-100/50 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <User className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Personal Profile Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-slate-500 font-bold uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  {...register("profileName")}
                  className={`w-full bg-slate-50/50 border rounded-xl py-3 px-4 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all ${
                    formState.errors.profileName ? "border-rose-300 focus:border-rose-400" : "border-slate-100/80 focus:border-blue-500"
                  }`}
                />
                {formState.errors.profileName && (
                  <p className="text-xs font-semibold text-rose-600">
                    {formState.errors.profileName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-500 font-bold uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  {...register("profileEmail")}
                  className={`w-full bg-slate-50/50 border rounded-xl py-3 px-4 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all ${
                    formState.errors.profileEmail ? "border-rose-300 focus:border-rose-400" : "border-slate-100/80 focus:border-blue-500"
                  }`}
                />
                {formState.errors.profileEmail && (
                  <p className="text-xs font-semibold text-rose-600">
                    {formState.errors.profileEmail.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* NOTIFICATION PREFERENCES CARD */}
          <div className="bg-white rounded-2xl p-10 border border-slate-100/50 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <Bell className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Notification Alerts Rules</h3>
            </div>
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-sm font-semibold">
                <div>
                  <p className="text-slate-800 font-bold">Email Alert Delivery</p>
                  <p className="text-slate-400 font-medium">Receive automated emails when requests require your approval signature.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue("notifEmail", !notifEmail)}
                  className="text-blue-600 cursor-pointer"
                >
                  {notifEmail ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm font-semibold">
                <div>
                  <p className="text-slate-800 font-bold">In-App Live Alerts</p>
                  <p className="text-slate-400 font-medium">Trigger instant popup badges inside the web interface on action status shifts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue("notifInApp", !notifInApp)}
                  className="text-blue-600 cursor-pointer"
                >
                  {notifInApp ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                </button>
              </div>
            </div>
          </div>

          {/* SYSTEM SETTINGS CARD */}
          <div className="bg-white rounded-2xl p-10 border border-slate-100/50 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <Sliders className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Enterprise System Layout</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-slate-500 font-bold uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  {...register("companyName")}
                  className="w-full bg-slate-50/50 border border-slate-100/80 rounded-xl py-3 px-4 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-500 font-bold uppercase tracking-wider">Doc Numbering Pattern</label>
                <input
                  type="text"
                  {...register("docNumberFormat")}
                  className={`w-full bg-slate-50/50 border rounded-xl py-3 px-4 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all ${
                    formState.errors.docNumberFormat ? "border-rose-300 focus:border-rose-400" : "border-slate-100/80 focus:border-blue-500"
                  }`}
                />
                {formState.errors.docNumberFormat && (
                  <p className="text-xs font-semibold text-rose-600">
                    {formState.errors.docNumberFormat.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={formState.isSubmitting}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl text-base transition-all shadow-sm shadow-blue-100 cursor-pointer active:scale-95"
            >
              {formState.isSubmitting ? "Saving..." : "Save Configuration Settings"}
            </button>
          </div>

        </form>

      </div>
    </DashboardLayout>
  );
}
