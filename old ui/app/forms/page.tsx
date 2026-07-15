"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/shared";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { getDocuments } from "@/features/documents/api";
import { Document } from "@/features/documents/types";
import { Plus, FileText, FileCheck, Stamp, X } from "lucide-react";

type FormType = "PR" | "PO" | "Certificate";
type FormRow = { id: string; type: FormType; title: string; requester: string; status: "Draft" | "Pending"; createdAt: string };

function mapDocumentToForm(doc: Document): FormRow {
  const type: FormType =
    doc.type === "PO" ? "PO" : doc.type === "Data Record" ? "Certificate" : "PR";
  return {
    id: doc.id,
    type,
    title: doc.name,
    requester: doc.sender,
    status: doc.status === "Pending" ? "Pending" : "Draft",
    createdAt: doc.submittedDate,
  };
}

export default function FormsPage() {
  const [forms, setForms] = useState<FormRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<FormType>("PR");
  const [title, setTitle] = useState("");
  const [requester, setRequester] = useState("");
  const [status, setStatus] = useState<"Draft" | "Pending">("Draft");

  useEffect(() => {
    getDocuments().then((docs) => setForms(docs.map(mapDocumentToForm)));
  }, []);

  const iconForType = useMemo(() => {
    if (formType === "PO") return <FileCheck className="w-4 h-4 text-emerald-600" />;
    if (formType === "Certificate") return <Stamp className="w-4 h-4 text-amber-600" />;
    return <FileText className="w-4 h-4 text-indigo-600" />;
  }, [formType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !requester) return;
    const nextId = `FRM-2026-${String(forms.length + 1).padStart(3, "0")}`;
    setForms([{ id: nextId, type: formType, title, requester, status, createdAt: new Date().toISOString().split("T")[0] }, ...forms]);
    setIsModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 w-full px-6 lg:px-8 xl:px-10 py-8">
        <PageHeader
          size="compact"
          title="Electronic Forms"
          subtitle="Create and manage PR/PO/Certificate drafts."
          actions={
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors">
              <Plus className="h-4 w-4" />
              New Form
            </button>
          }
        />
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 pl-4">Form ID</th>
                <th className="py-3">Type</th>
                <th className="py-3">Title</th>
                <th className="py-3">Requester</th>
                <th className="py-3">Created</th>
                <th className="py-3 pr-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/80">
              {forms.map((form) => (
                <tr key={form.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 pl-4 text-sm font-bold text-slate-600">{form.id}</td>
                  <td className="py-4 text-xs font-semibold text-slate-600">{form.type}</td>
                  <td className="py-4 text-sm font-semibold text-slate-800">{form.title}</td>
                  <td className="py-4 text-xs font-semibold text-slate-500">{form.requester}</td>
                  <td className="py-4 text-xs font-semibold text-slate-500">{form.createdAt}</td>
                  <td className="py-4 pr-4 text-center">
                    <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 ${form.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                      {form.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-lg overflow-hidden">
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">{iconForType} New Form</div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </header>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <select value={formType} onChange={(e) => setFormType(e.target.value as FormType)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                <option value="PR">Purchase Request (PR)</option>
                <option value="PO">Purchase Order (PO)</option>
                <option value="Certificate">Certificate</option>
              </select>
              <input value={requester} onChange={(e) => setRequester(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700" placeholder="Requester name" required />
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700" placeholder="Form title" required />
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input type="checkbox" checked={status === "Pending"} onChange={(e) => setStatus(e.target.checked ? "Pending" : "Draft")} className="accent-indigo-600" />
                Submit for approval
              </label>
              <button type="submit" className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm hover:bg-indigo-700">Save Form</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
