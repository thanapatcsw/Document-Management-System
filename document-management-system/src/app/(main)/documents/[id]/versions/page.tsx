import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, History, AlertCircle, Eye, Download } from "lucide-react";
import { getDocuments } from "@/features/documents/api";
import PageHeader from "@/components/shared/PageHeader";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentVersionsPage({ params }: PageProps) {
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

  // Generate simulated version history entries
  const versions = [
    {
      version: doc.version,
      updatedAt: doc.submittedDate,
      updatedBy: doc.sender,
      remarks: "Initial document submission and workflow initialization.",
      size: "1.4 MB",
      isActive: true,
    },
    {
      version: "v0.9 (Draft)",
      updatedAt: "10 ก.ค. 2026",
      updatedBy: doc.sender,
      remarks: "Draft created and saved to workspaces.",
      size: "1.2 MB",
      isActive: false,
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <div>
        <Link
          href={`/documents/${doc.id}`}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Document Details
        </Link>
      </div>

      <PageHeader
        size="compact"
        title={`Version History: ${doc.id}`}
        subtitle={`Track edits and revisions of "${doc.name}" over time.`}
      />

      <div className="bg-white rounded-2xl p-6 border border-slate-100/50 shadow-sm flex flex-col space-y-6">
        
        <div className="overflow-x-auto border border-slate-100/50 rounded-2xl">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 pl-4 w-28">Version</th>
                <th className="py-4">Updated Date</th>
                <th className="py-4">Modifier</th>
                <th className="py-4 w-96">Changes / Remarks</th>
                <th className="py-4 text-center">Status</th>
                <th className="py-4 pr-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/80">
              {versions.map((ver, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 pl-4 text-sm font-bold text-slate-600">{ver.version}</td>
                  <td className="py-4 text-xs font-semibold text-slate-500">{ver.updatedAt}</td>
                  <td className="py-4 text-xs font-semibold text-slate-600">{ver.updatedBy}</td>
                  <td className="py-4 text-xs font-medium text-slate-400 leading-relaxed pr-6">{ver.remarks}</td>
                  <td className="py-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      ver.isActive 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                        : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}>
                      {ver.isActive ? "Current Active" : "Archived"}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        title="View File Version"
                        className="p-1.5 rounded-lg text-slate-450 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Download Version"
                        className="p-1.5 rounded-lg text-slate-450 hover:bg-slate-50 hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
