"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Search,
  Upload,
  Eye,
  Download,
  Edit2,
  Trash2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDocuments } from "@/features/documents/api";
import { Document } from "@/features/documents/types";
import { DashboardLayout } from "@/components/shared";
import PageHeader from "@/components/shared/PageHeader";
import { useToast } from "@/components/providers/ToastProvider";
import { getStatusVariant } from "@/lib/document-status";
import { DocumentTypeIcon } from "@/lib/document-type-icon";

export default function DocumentsPage() {
  const { data: initialDocs, error } = useSWR("documents", getDocuments, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    if (initialDocs) {
      setDocuments(initialDocs);
    }
  }, [initialDocs]);

  const isLoading = !initialDocs && !error;

  // Filters State
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { showToast } = useToast();

  // Modal / Dialog States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form States - Upload
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState<Document["type"]>("PR");
  const [newDocSender, setNewDocSender] = useState("");
  const [newDocAmount, setNewDocAmount] = useState("");

  // Form States - Edit & Preview
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [editDocName, setEditDocName] = useState("");
  const [editDocType, setEditDocType] = useState<Document["type"]>("PR");
  const [editDocSender, setEditDocSender] = useState("");
  const [editDocAmount, setEditDocAmount] = useState("");
  const [editDocStatus, setEditDocStatus] = useState<Document["status"]>("Draft");


  // Create new document action
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName || !newDocSender) {
      alert("Please fill in document name and submitter!");
      return;
    }

    const newId = `DOC-2026-${String(documents.length + 1).padStart(3, "0")}`;
    const newDoc: Document = {
      id: newId,
      name: newDocName,
      type: newDocType,
      submittedDate: new Date().toISOString().split("T")[0],
      status: "Draft",
      sender: newDocSender,
      amount: newDocAmount ? `฿${Number(newDocAmount).toLocaleString()}` : "-",
      version: "v1.0",
    };

    setDocuments([newDoc, ...documents]);
    setIsUploadOpen(false);
    
    // Clear form
    setNewDocName("");
    setNewDocSender("");
    setNewDocAmount("");
    setNewDocType("PR");

    showToast(`Successfully created ${newId} (Draft)`);
  };

  // Edit document action
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    setDocuments(
      documents.map((doc) =>
        doc.id === selectedDoc.id
          ? {
              ...doc,
              name: editDocName,
              type: editDocType,
              sender: editDocSender,
              amount: editDocAmount,
              status: editDocStatus,
              // Increment minor version on edit
              version: `v${(parseFloat(doc.version.replace("v", "")) + 0.1).toFixed(1)}`,
            }
          : doc
      )
    );

    setIsEditOpen(false);
    showToast(`Updated document details for ${selectedDoc.id}`);
  };

  // Open Edit Modal with pre-populated values
  const openEditModal = (doc: Document) => {
    setSelectedDoc(doc);
    setEditDocName(doc.name);
    setEditDocType(doc.type);
    setEditDocSender(doc.sender);
    setEditDocAmount(doc.amount);
    setEditDocStatus(doc.status);
    setIsEditOpen(true);
  };

  // Open Preview Modal
  const openPreviewModal = (doc: Document) => {
    setSelectedDoc(doc);
    setIsPreviewOpen(true);
  };

  // Download action
  const triggerDownload = (doc: Document) => {
    showToast(`Download started: ${doc.id}_original.pdf`);
  };

  // Delete action
  const handleDeleteDoc = (docId: string) => {
    if (confirm(`Are you sure you want to permanently delete document ${docId}?`)) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      showToast(`Document ${docId} deleted successfully`);
    }
  };

  // Filter Logic
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.id.toLowerCase().includes(search.toLowerCase()) ||
      doc.sender.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === "All" || doc.type === typeFilter;
    const matchesStatus = statusFilter === "All" || doc.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + itemsPerPage);

  // Auto-reset page if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter]);

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <PageHeader
          size="compact"
          title="Documents Center"
          subtitle="Store, organize, manage, and edit company document assets."
        />

        {/* WORKSPACE CARD */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100/50 shadow-sm flex flex-col h-full space-y-6">
          
          {/* TOOLBAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search + Filter controls group */}
            <div className="flex flex-col sm:flex-row flex-1 gap-3 max-w-3xl">
              
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search by name, ID, submitter..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-100/80 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none bg-slate-50/50 border border-slate-100/80 rounded-xl py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer min-w-[130px]"
                >
                  <option value="All">All Types</option>
                  <option value="PR">PR (Request)</option>
                  <option value="PO">PO (Order)</option>
                  <option value="Data Record">Data Record</option>
                  <option value="PDF">PDF</option>
                  <option value="Other">Other</option>
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-slate-50/50 border border-slate-100/80 rounded-xl py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer min-w-[130px]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Returned for Revision">Returned</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </span>
              </div>

            </div>

            {/* Add New Button */}
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-sm transition-all shadow-sm shadow-blue-100 cursor-pointer shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto border border-slate-100/50 rounded-2xl">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 pl-4">ID / Number</th>
                  <th className="py-4">Document Title</th>
                  <th className="py-4">Document Type</th>
                  <th className="py-4">Submitted Date</th>
                  <th className="py-4 text-center">Status</th>
                  <th className="py-4 pr-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/80">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="inline-block w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-2" />
                      <p className="text-xs text-slate-400 font-semibold">Loading document database...</p>
                    </td>
                  </tr>
                ) : paginatedDocs.length > 0 ? (
                  paginatedDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 pl-4 text-sm font-bold text-slate-500">{doc.id}</td>
                      <td className="py-4">
                        <div>
                          <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                            {doc.name}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-400">
                            Creator: {doc.sender} {doc.amount !== "-" ? `| Value: ${doc.amount}` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-slate-600">
                          {doc.type}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-slate-400 font-medium">{doc.submittedDate}</td>
                      <td className="py-4 text-center">
                        <Badge variant={getStatusVariant(doc.status)}>
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            title="View"
                            onClick={() => openPreviewModal(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Download"
                            onClick={() => triggerDownload(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm font-medium text-slate-400">
                      No documents matched your filter options.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {!isLoading && filteredDocs.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-xs font-semibold text-slate-500">
              <span>
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDocs.length)} of{" "}
                {filteredDocs.length} items
              </span>
              
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg border text-center transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                        : "border-slate-100 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 2. UPLOAD MODAL OVERLAY */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100/50 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="text-base font-bold text-slate-900">Upload New Document</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Document Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PR - New Office Desk"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-100/80 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Document Type</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as Document["type"])}
                    className="w-full bg-slate-50/50 border border-slate-100/80 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="PR">PR (Request)</option>
                    <option value="PO">PO (Order)</option>
                    <option value="Data Record">Data Record</option>
                    <option value="PDF">PDF</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Financial Value (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={newDocAmount}
                    onChange={(e) => setNewDocAmount(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-100/80 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Submitter Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={newDocSender}
                  onChange={(e) => setNewDocSender(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-100/80 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Attach PDF / File</label>
                <input
                  type="file"
                  accept=".pdf"
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2.5 border border-slate-100 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EDIT DETAILS MODAL OVERLAY */}
      {isEditOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100/50 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Document details — {selectedDoc.id}</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Document Name</label>
                <input
                  type="text"
                  required
                  value={editDocName}
                  onChange={(e) => setEditDocName(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-100/80 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Document Type</label>
                  <select
                    value={editDocType}
                    onChange={(e) => setEditDocType(e.target.value as Document["type"])}
                    className="w-full bg-slate-50/50 border border-slate-100/80 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="PR">PR (Request)</option>
                    <option value="PO">PO (Order)</option>
                    <option value="Data Record">Data Record</option>
                    <option value="PDF">PDF</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Value</label>
                  <input
                    type="text"
                    value={editDocAmount}
                    onChange={(e) => setEditDocAmount(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-100/80 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Submitter Creator</label>
                  <input
                    type="text"
                    required
                    value={editDocSender}
                    onChange={(e) => setEditDocSender(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-100/80 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status State</label>
                  <select
                    value={editDocStatus}
                    onChange={(e) => setEditDocStatus(e.target.value as Document["status"])}
                    className="w-full bg-slate-50/50 border border-slate-100/80 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Returned for Revision">Returned</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 border border-slate-100 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. PREVIEW MODAL OVERLAY */}
      {isPreviewOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100/50 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Document Detail Overview</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{selectedDoc.id}</p>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                <DocumentTypeIcon type={selectedDoc.type} />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-snug">{selectedDoc.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400">{selectedDoc.type} System Template</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs font-semibold border-b border-slate-50 pb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ID Code</span>
                  <span className="text-slate-700">{selectedDoc.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Submitter Creator</span>
                  <span className="text-slate-700">{selectedDoc.sender}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Date Submitted</span>
                  <span className="text-slate-700">{selectedDoc.submittedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Version</span>
                  <span className="text-slate-700">{selectedDoc.version}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Financial Worth</span>
                  <span className="text-slate-700">{selectedDoc.amount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Current Status</span>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(selectedDoc.status)}>{selectedDoc.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Link
                  href={`/version-control?docId=${selectedDoc.id}`}
                  className="px-4 py-2.5 border border-blue-200 hover:bg-blue-50 text-blue-600 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  View Version History
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    triggerDownload(selectedDoc);
                    setIsPreviewOpen(false);
                  }}
                  className="px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                >
                  Close Overview
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}