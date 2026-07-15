"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  RotateCcw,
  SlidersHorizontal,
  Eye,
  FileText,
  PenTool,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getApprovals, Approval } from "@/features/workflow/api";
import { DashboardLayout } from "@/components/shared";
import PageHeader from "@/components/shared/PageHeader";
import { useToast } from "@/components/providers/ToastProvider";
import { getStatusVariant } from "@/lib/document-status";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters State
  const [statusFilter, setStatusFilter] = useState("Pending");

  // Modal State
  const [selectedApproval, setSelectedDoc] = useState<Approval | null>(null);
  const [comment, setComment] = useState("");
  const [signatureType, setSignatureType] = useState<"draw" | "saved">("saved");
  const [signatureApplied, setSignatureApplied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await getApprovals();
      setApprovals(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const filteredApprovals = approvals.filter((item) => statusFilter === "All" || item.status === statusFilter);

  const handleAction = (id: string, action: string, _comment = "") => {
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: action === "Approved" ? "Approved" : action === "Returned" ? "Returned for Revision" : "Cancelled",
            }
          : item
      )
    );
    setSelectedDoc(null);
    setComment("");
    setSignatureApplied(false);
    showToast(`Document ${id} has been ${action} successfully!`, "success");
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <PageHeader
          size="compact"
          title="Approvals Inbox"
          subtitle="Review, approve, reject or return workflows awaiting your input."
        />

        <div className="bg-white rounded-2xl p-6 border border-slate-100/50 shadow-sm flex flex-col h-full space-y-6">
          
          {/* TOOLBAR */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-1.5">
              {["All", "Pending", "Approved", "Returned for Revision"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    statusFilter === status
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  {status === "Returned for Revision" ? "Returned" : status}
                </button>
              ))}
            </div>
            
            <div className="relative shrink-0">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </span>
              <select className="appearance-none bg-slate-50/50 border border-slate-100/80 rounded-xl py-2 pl-4 pr-10 text-xs font-semibold text-slate-700 focus:outline-none min-w-[130px]">
                <option>Newest First</option>
                <option>Oldest First</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto border border-slate-100/50 rounded-2xl">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 pl-4">Document Details</th>
                  <th className="py-4">ID</th>
                  <th className="py-4">Requester</th>
                  <th className="py-4">Submitted Date</th>
                  <th className="py-4 text-center">Current Level</th>
                  <th className="py-4 text-center">Status</th>
                  <th className="py-4 pr-4 text-center">Process Workflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/80">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="inline-block w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                    </td>
                  </tr>
                ) : filteredApprovals.length > 0 ? (
                  filteredApprovals.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 pl-4">
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-snug">{item.name}</p>
                          <span className="text-[10px] font-semibold text-slate-400">Value: {item.amount}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm font-bold text-slate-500">{item.id}</td>
                      <td className="py-4 text-sm font-medium text-slate-600">{item.requester}</td>
                      <td className="py-4 text-sm text-slate-400 font-medium">{item.submittedDate}</td>
                      <td className="py-4 text-center">
                        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                          L{item.currentLevel} / L{item.maxLevels}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                      </td>
                      <td className="py-4 pr-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedDoc(item);
                            setSignatureApplied(false);
                            setComment("");
                          }}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {item.status === "Pending" ? "Review & Sign" : "View Details"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm font-medium text-slate-400">
                      No approval requests found matching active criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Approval Task & Signature / PDF Editor Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 lg:p-8 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <header className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Approval Task & PDF Editor</h3>
                  <p className="text-xs text-slate-400 font-semibold">Review document, apply signature, and sign off workflow.</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Modal Body */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              
              {/* Left Side: PDF Editor / Document Viewer */}
              <div className="flex-1 bg-slate-100 p-6 overflow-y-auto flex items-center justify-center">
                <div className="bg-white w-full max-w-2xl min-h-[700px] shadow-lg rounded-2xl border border-slate-200 p-10 flex flex-col justify-between relative">
                  
                  {/* Watermark for Status */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-5">
                    <h1 className="text-7xl font-extrabold rotate-12 tracking-widest text-slate-900 uppercase">
                      {selectedApproval.status}
                    </h1>
                  </div>

                  {/* Document Header */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                      <div>
                        <h1 className="text-xl font-extrabold text-slate-900">DMS ELECTRONIC FORM</h1>
                        <p className="text-xs text-slate-400 font-bold mt-1">SYSTEM GENERATED DOCUMENT LAYER</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
                          {selectedApproval.id}
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold mt-2">DATE: {selectedApproval.submittedDate}</p>
                      </div>
                    </div>

                    {/* Document Details */}
                    <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-6">
                      <div>
                        <p className="text-slate-400 font-bold uppercase tracking-wider">Submitted By</p>
                        <p className="text-slate-800 font-extrabold mt-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          {selectedApproval.requester}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase tracking-wider">Workflow Route</p>
                        <p className="text-slate-800 font-extrabold mt-1.5">
                          Level {selectedApproval.currentLevel} / {selectedApproval.maxLevels} (Pending Sign-off)
                        </p>
                      </div>
                    </div>

                    {/* Form Specific Content */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Subject & Description</h3>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs font-bold text-slate-800">{selectedApproval.name}</p>
                        <p className="text-[11px] text-slate-400 font-semibold mt-1.5 leading-relaxed">
                          This document is generated automatically by the DMS workflow engine. Please review the attached items and total valuation before appending your electronic signature.
                        </p>
                      </div>

                      {/* Items Table */}
                      <div className="border border-slate-100 rounded-xl overflow-hidden mt-4">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500">
                              <th className="p-3">Item Description</th>
                              <th className="p-3 text-center">Qty</th>
                              <th className="p-3 text-right">Unit Price</th>
                              <th className="p-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            <tr>
                              <td className="p-3 font-bold">{selectedApproval.name.replace("PR - ", "").replace("PO - ", "")}</td>
                              <td className="p-3 text-center">1</td>
                              <td className="p-3 text-right">{selectedApproval.amount}</td>
                              <td className="p-3 text-right">{selectedApproval.amount}</td>
                            </tr>
                            <tr className="bg-slate-50/50 font-bold text-slate-900">
                              <td colSpan={3} className="p-3 text-right">Total Valuation (incl. VAT)</td>
                              <td className="p-3 text-right text-indigo-600">{selectedApproval.amount}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Document Footer: Signatures Placement Area */}
                  <div className="border-t border-slate-100 pt-6 flex justify-between items-end">
                    <div className="text-[10px] text-slate-400 font-semibold">
                      <p>DMS Electronic Sign-off Layer</p>
                      <p className="mt-1">IP Address recorded on action</p>
                    </div>
                    <div className="w-48 h-24 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center relative bg-slate-50/30">
                      {signatureApplied ? (
                        <div className="text-center animate-in zoom-in-95 duration-150">
                          <p className="font-serif italic text-lg text-indigo-700 font-bold leading-none">Jane Doe</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-2">Digitally Signed via DMS</p>
                          <p className="text-[8px] text-slate-300 font-medium">Level {selectedApproval.currentLevel} Approver</p>
                        </div>
                      ) : (
                        <div className="text-center text-slate-400">
                          <PenTool className="w-5 h-5 mx-auto text-slate-300 mb-1" />
                          <p className="text-[9px] font-bold">Signature Placement</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Side: Workflow Actions & Signature Pad */}
              <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-6">
                  
                  {/* Step Info */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Workflow Status</h4>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-400">Current Step</span>
                        <span className="text-slate-800 font-bold">Level {selectedApproval.currentLevel}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-400">Required Role</span>
                        <span className="text-indigo-600 font-bold">Department Head</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-400">Status</span>
                        <Badge variant={getStatusVariant(selectedApproval.status)}>{selectedApproval.status}</Badge>
                      </div>
                    </div>
                  </div>

                  {selectedApproval.status === "Pending" && (
                    <>
                      {/* Signature Selector */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Electronic Signature</h4>
                        <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-white">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSignatureType("saved")}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                signatureType === "saved"
                                  ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                                  : "bg-slate-50 text-slate-500 border-transparent"
                              }`}
                            >
                              Use Saved Signature
                            </button>
                            <button
                              onClick={() => setSignatureType("draw")}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                signatureType === "draw"
                                  ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                                  : "bg-slate-50 text-slate-500 border-transparent"
                              }`}
                            >
                              Draw Signature
                            </button>
                          </div>

                          {signatureType === "saved" ? (
                            <div className="border border-slate-100 rounded-lg p-3 text-center bg-slate-50/50">
                              <p className="font-serif italic text-base text-indigo-700 font-bold">Jane Doe</p>
                              <button
                                onClick={() => setSignatureApplied(true)}
                                className="mt-2.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 block mx-auto"
                              >
                                Apply Signature to PDF
                              </button>
                            </div>
                          ) : (
                            <div className="border border-slate-100 rounded-lg p-4 text-center bg-slate-50/50 space-y-2">
                              <div className="w-full h-20 bg-white border border-slate-200 rounded-lg flex items-center justify-center relative">
                                <span className="text-[10px] text-slate-300 font-semibold select-none">Draw signature here</span>
                              </div>
                              <button
                                onClick={() => setSignatureApplied(true)}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 block mx-auto"
                              >
                                Apply Signature to PDF
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Comment Input */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                          Comment / Remarks
                        </h4>
                        <textarea
                          rows={3}
                          placeholder="Add approval comments or revision notes..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </>
                  )}

                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-6 border-t border-slate-100">
                  {selectedApproval.status === "Pending" ? (
                    <>
                      <button
                        disabled={!signatureApplied}
                        onClick={() => handleAction(selectedApproval.id, "Approved", comment)}
                        className={`w-full py-3 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                          signatureApplied
                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 cursor-pointer active:scale-98"
                            : "bg-slate-300 shadow-none cursor-not-allowed"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        Approve & Apply Signature
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(selectedApproval.id, "Returned", comment)}
                          className="flex-1 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Return
                        </button>
                        <button
                          onClick={() => handleAction(selectedApproval.id, "Rejected", comment)}
                          className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => setSelectedDoc(null)}
                      className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Close Details
                    </button>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
