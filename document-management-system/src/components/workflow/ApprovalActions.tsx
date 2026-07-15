"use client";

import React, { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { submitApprove, submitReject } from "@/features/workflow/api";
import { useRouter } from "next/navigation";

interface ApprovalActionsProps {
  documentId: string;
}

export function ApprovalActions({ documentId }: ApprovalActionsProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !comment.trim()) {
      alert("กรุณาระบุเหตุผลในการไม่อนุมัติ");
      return;
    }

    setIsSubmitting(true);
    try {
      if (action === "approve") {
        await submitApprove(documentId, comment);
      } else {
        await submitReject(documentId, comment);
      }
      alert(`ดำเนินการ${action === "approve" ? "อนุมัติ" : "ไม่อนุมัติ"}เอกสารเรียบร้อยแล้ว`);
      router.push("/approvals");
      router.refresh();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการดำเนินการ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mt-6">
      <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">ดำเนินการพิจารณา</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ความคิดเห็น (Comment)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-sm"
            rows={3}
            placeholder="ระบุความคิดเห็น (จำเป็นต้องระบุหากไม่อนุมัติ)..."
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleAction("reject")}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
            ไม่อนุมัติ (Reject)
          </button>
          
          <button
            onClick={() => handleAction("approve")}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            อนุมัติ (Approve)
          </button>
        </div>
      </div>
    </div>
  );
}
