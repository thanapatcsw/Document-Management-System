"use client";

import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/shared";

const PdfEditorContent = dynamic(() => import("./PdfEditorContent"), { ssr: false });

export default function PdfEditorPage() {
  return (
    <DashboardLayout>
      <PdfEditorContent />
    </DashboardLayout>
  );
}
