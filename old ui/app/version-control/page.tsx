"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Layers,
  FileText,
  Calendar,
  User,
  ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDocuments, getDocumentVersions } from "@/features/documents/api";
import { Document, DocumentVersion } from "@/features/documents/types";
import { DashboardLayout } from "@/components/shared";
import PageHeader from "@/components/shared/PageHeader";
import { api } from "@/lib";
import { useToast } from "@/components/providers/ToastProvider";
import { getStatusVariant } from "@/lib/document-status";

export default function VersionControlPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const { showToast } = useToast();

  // Fetch all documents on mount
  useEffect(() => {
    async function fetchDocs() {
      setIsLoadingDocs(true);
      try {
        const docs = await getDocuments();
        setDocuments(docs);
        
        // Handle URL query parameter ?docId=...
        let initialDocId = "";
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const docIdParam = params.get("docId");
          if (docIdParam && docs.some((d) => d.id === docIdParam)) {
            initialDocId = docIdParam;
          }
        }

        if (!initialDocId && docs.length > 0) {
          initialDocId = docs[0].id;
        }

        setSelectedDocId(initialDocId);
      } catch {
        showToast("Failed to load documents.");
      } finally {
        setIsLoadingDocs(false);
      }
    }
    fetchDocs();
  }, []);

  // Update selected document details and fetch its versions when selectedDocId changes
  useEffect(() => {
    if (!selectedDocId) return;

    const doc = documents.find((d) => d.id === selectedDocId) || null;
    setSelectedDoc(doc);

    async function fetchVersions() {
      setIsLoadingVersions(true);
      try {
        const history = await getDocumentVersions(selectedDocId);
        // Sort in reverse-chronological order by version number descending
        const sortedHistory = [...history].sort((a, b) => {
          return b.versionNumber.localeCompare(a.versionNumber, undefined, { numeric: true });
        });
        setVersions(sortedHistory);
      } catch {
        showToast("Failed to load version history.");
      } finally {
        setIsLoadingVersions(false);
      }
    }

    fetchVersions();
  }, [selectedDocId, documents]);

  const handleDownloadVersion = async (ver: DocumentVersion) => {
    try {
      showToast(`Downloading version ${ver.versionNumber} of document ${selectedDocId}...`);
      const response = await api.get(
        `/api/documents/${selectedDocId}/versions/${ver.id}/download`,
        { responseType: "blob" }
      );
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedDocId}-${ver.versionNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast("Download failed. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title="Version History & Control"
          subtitle="Track, compare, audit, and download older iterations of active documents."
        />

        <div className="grid grid-cols-1 gap-6">
          
          {/* SELECTOR & METADATA CARD */}
          <div className="bg-white rounded-2xl p-10 border border-slate-100/50 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-5">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Select Document to Audit</label>
                <div className="relative max-w-md w-full">
                  <select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    disabled={isLoadingDocs}
                    className="w-full appearance-none bg-slate-50/50 border border-slate-100/80 rounded-xl py-3.5 pl-4 pr-10 text-base font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingDocs ? (
                      <option>Loading documents...</option>
                    ) : documents.length === 0 ? (
                      <option>No documents available</option>
                    ) : (
                      documents.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.id} - {doc.name}
                        </option>
                      ))
                    )}
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </div>
              </div>
              
              {selectedDoc && (
                <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
                  <Badge variant={getStatusVariant(selectedDoc.status)} className="px-3 py-1 font-bold text-sm">
                    {selectedDoc.status}
                  </Badge>
                  <span className="text-sm font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full">
                    Current: {selectedDoc.version}
                  </span>
                </div>
              )}
            </div>

            {/* Selected Document Metadata Panels */}
            {selectedDoc ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 bg-slate-50/40 p-4 rounded-xl border border-slate-100/50">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Document Title</span>
                    <span className="text-base font-bold text-slate-800 line-clamp-1">{selectedDoc.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50/40 p-4 rounded-xl border border-slate-100/50">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Creator / Submitter</span>
                    <span className="text-base font-bold text-slate-800 line-clamp-1">{selectedDoc.sender}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50/40 p-4 rounded-xl border border-slate-100/50">
                  <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Document Type</span>
                    <span className="text-base font-bold text-slate-800">{selectedDoc.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50/40 p-4 rounded-xl border border-slate-100/50">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Date Submitted</span>
                    <span className="text-base font-bold text-slate-800">{selectedDoc.submittedDate}</span>
                  </div>
                </div>
              </div>
            ) : !isLoadingDocs && (
              <div className="text-center py-6 text-base text-slate-400">
                Select a document above to load auditing timeline.
              </div>
            )}
          </div>

          {/* VERSIONS TABLE */}
          <div className="bg-white rounded-2xl p-10 border border-slate-100/50 shadow-sm flex flex-col space-y-4">
            <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">Historical Versions Log</h3>
            
            <div className="overflow-x-auto border border-slate-100/50 rounded-2xl">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4.5 pl-4">Version</th>
                    <th className="py-4.5">Uploaded By</th>
                    <th className="py-4.5">Created At</th>
                    <th className="py-4.5">Remarks / Revision Notes</th>
                    <th className="py-4.5 pr-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/80">
                  {isLoadingVersions ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-2" />
                        <p className="text-sm text-slate-400 font-semibold">Fetching version history...</p>
                      </td>
                    </tr>
                  ) : versions.length > 0 ? (
                    versions.map((ver) => (
                      <tr key={ver.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4.5 pl-4">
                          <span className="font-mono text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md">
                            {ver.versionNumber}
                          </span>
                        </td>
                        <td className="py-4.5 text-base font-semibold text-slate-700">{ver.uploadedBy}</td>
                        <td className="py-4.5 text-sm font-medium text-slate-400">{ver.createdAt}</td>
                        <td className="py-4.5 text-sm font-semibold text-slate-600 max-w-xs truncate" title={ver.remarks}>
                          {ver.remarks}
                        </td>
                        <td className="py-4.5 pr-4 text-center">
                          <button
                            onClick={() => handleDownloadVersion(ver)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            <Download className="w-4 h-4" />
                            Download {ver.versionNumber}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm font-bold text-slate-400">
                        {selectedDocId ? "No historical versions recorded for this document node." : "Please choose a document above to load version control log."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}