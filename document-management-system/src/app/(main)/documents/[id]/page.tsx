import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, History, FileText, Download, Check, AlertCircle } from "lucide-react";
import { getDocuments } from "@/features/documents/api";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/lib/document-status";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch documents from Mock API
  const documents = await getDocuments();
  const doc = documents.find((d) => d.id === id);

  if (!doc) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-lg mx-auto text-center h-[60vh]">
        <div className="p-3 bg-red-50 text-red-600 rounded-2xl mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Document Not Found</h3>
        <p className="text-sm text-slate-400 font-semibold mt-1">
          The document ID "{id}" could not be located in the database.
        </p>
        <Link
          href="/documents"
          className="mt-6 px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs transition-colors"
        >
          Back to Documents
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <div className="flex justify-between items-center">
        <Link
          href="/documents"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documents
        </Link>

        <Link
          href={`/documents/${doc.id}/versions`}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          <History className="w-4 h-4" />
          Version History
        </Link>
      </div>

      <PageHeader
        size="compact"
        title={`Document: ${doc.id}`}
        subtitle="Review document properties, transaction metadata, and workflow logs."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100/50 shadow-sm space-y-6">
            
            <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl text-slate-400 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 leading-snug">{doc.name}</h3>
                <p className="text-xs text-slate-400 font-semibold">
                  Submitted by {doc.sender} on {doc.submittedDate}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{doc.type}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                <div className="mt-1">
                  <Badge variant={getStatusVariant(doc.status)}>{doc.status}</Badge>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valuation</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{doc.amount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Version</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{doc.version}</p>
              </div>
            </div>

          </div>

          {/* SIMULATED DOCUMENT PREVIEW LAYER */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100/50 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Document Preview (Simulation)
            </h4>
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-150 text-center min-h-[250px] flex flex-col justify-center items-center">
              <FileText className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-xs font-bold text-slate-600">{doc.name}.pdf</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                Version: {doc.version} | Size: ~1.4 MB
              </p>
              <button
                type="button"
                className="mt-4 flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-white text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Original File
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Activity/Workflow */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100/50 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Approval Progress
            </h4>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-0.5 h-10 bg-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">1. Document Created</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">By {doc.sender}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    doc.status === "Pending" ? "bg-amber-500 text-white" : doc.status === "Approved" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                  }`}>
                    {doc.status === "Approved" ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <div className="w-0.5 h-10 bg-slate-200" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">2. Supervisor Approval</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {doc.status === "Approved" ? "Approved by supervisor" : "Awaiting response"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    doc.status === "Approved" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                  }`}>
                    {doc.status === "Approved" ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">3. Final Authorization</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {doc.status === "Approved" ? "Approved and signed" : "Pending step 2 completion"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
