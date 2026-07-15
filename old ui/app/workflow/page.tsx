"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/shared";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { getDocuments, updateDocumentStatus } from "@/features/documents/api";
import { Document } from "@/features/documents/types";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { CheckCircle, Eye, X, XCircle } from "lucide-react";
import { getStatusVariant } from "@/lib/document-status";

type Tab = "inbox" | "outbox" | "history";

function matchesCurrentUser(sender: string, user: { full_name: string; username: string } | null) {
  if (!user) return false;
  return sender === user.full_name || sender === user.username;
}

export default function WorkflowPage() {
  const [activeTab, setActiveTab] = useState<Tab>("inbox");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selected, setSelected] = useState<Document | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [remark, setRemark] = useState("");
  const { user } = useAuth();
  const { showToast } = useToast();

  const loadDocuments = useCallback(() => {
    setIsLoading(true);
    getDocuments()
      .then(setDocuments)
      .catch(() => showToast("Failed to load workflow items."))
      .finally(() => setIsLoading(false));
  }, [showToast]);

  React.useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const filtered = useMemo(() => {
    if (activeTab === "inbox") {
      return documents.filter((doc) => doc.status === "Pending");
    }
    if (activeTab === "outbox") {
      return documents.filter((doc) => matchesCurrentUser(doc.sender, user));
    }
    return documents.filter((doc) => doc.status !== "Pending");
  }, [activeTab, documents, user]);

  const openAction = (doc: Document, type: "approve" | "reject") => {
    setSelected(doc);
    setActionType(type);
    setRemark("");
  };

  const submitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    const nextStatus: Document["status"] =
      actionType === "approve" ? "Approved" : "Returned for Revision";

    setIsSubmitting(true);
    try {
      const updated = await updateDocumentStatus(selected.id, nextStatus, remark.trim());
      setDocuments((prev) => prev.map((doc) => (doc.id === updated.id ? updated : doc)));
      showToast(
        actionType === "approve"
          ? `${selected.id} approved.`
          : `${selected.id} returned for revision.`
      );
      setSelected(null);
      setRemark("");
    } catch {
      showToast("Action failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 w-full px-6 lg:px-8 xl:px-10 py-8">
        <PageHeader
          title="Approval Workflow"
          subtitle="Review inbox approvals, submissions, and history."
        />

        <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "inbox", label: "Inbox" },
              { id: "outbox", label: "Outbox" },
              { id: "history", label: "History" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "bg-transparent text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto border border-slate-100/50 rounded-2xl">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4.5 pl-4">Document ID</th>
                  <th className="py-4.5">Name</th>
                  <th className="py-4.5">Type</th>
                  <th className="py-4.5">Submitter</th>
                  <th className="py-4.5">Submitted Date</th>
                  <th className="py-4.5 text-center">Status</th>
                  <th className="py-4.5 pr-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/80">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-slate-400 font-semibold">
                      Loading workflow...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-slate-400 font-semibold">
                      No workflow items in this tab.
                    </td>
                  </tr>
                ) : (
                  filtered.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 pl-4 text-base font-bold text-slate-600">{doc.id}</td>
                      <td className="py-4.5 text-base font-semibold text-slate-800">{doc.name}</td>
                      <td className="py-4.5 text-sm font-semibold text-slate-500">{doc.type}</td>
                      <td className="py-4.5 text-sm font-semibold text-slate-500">{doc.sender}</td>
                      <td className="py-4.5 text-sm font-semibold text-slate-500">{doc.submittedDate}</td>
                      <td className="py-4.5 text-center">
                        <Badge variant={getStatusVariant(doc.status)} className="px-3 py-1 font-bold text-sm">
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="py-4.5 pr-4 text-center">
                        {activeTab === "inbox" ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openAction(doc, "approve")}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-bold"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => openAction(doc, "reject")}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-sm font-bold"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </button>
                            <Link
                              href={`/documents?docId=${doc.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 text-sm font-bold"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Link>
                          </div>
                        ) : (
                          <Link
                            href={`/documents?docId=${doc.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 text-sm font-bold"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md overflow-hidden">
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {actionType === "approve" ? "Approve Document" : "Reject Document"}
              </h3>
              <button onClick={() => setSelected(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </header>
            <form onSubmit={submitAction} className="p-6 space-y-4">
              <p className="text-sm text-slate-500 font-semibold">
                {selected.id} — {selected.name}
              </p>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Add remark..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 h-24"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-60 ${
                  actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isSubmitting ? "Processing..." : `Confirm ${actionType === "approve" ? "Approval" : "Rejection"}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
