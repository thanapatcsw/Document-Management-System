"use client";

import React, { useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PenTool, Save, UploadCloud, CheckCircle2 } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfEditorContent() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(1);
  const [note, setNote] = useState("");
  const [signature, setSignature] = useState("");
  const [saved, setSaved] = useState(false);

  const fileUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const onSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full px-6 lg:px-8 xl:px-10 py-8">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">In-Browser PDF Editor</h2>
          <p className="text-xs text-slate-400 font-medium">View, annotate, and sign documents.</p>
        </div>
        <label className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 cursor-pointer">
          <UploadCloud className="h-4 w-4" />
          Upload PDF
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          {fileUrl ? (
            <Document file={fileUrl} onLoadSuccess={(doc) => setNumPages(doc.numPages)}>
              {Array.from({ length: numPages }).map((_, idx) => (
                <div key={idx} className="mb-6 flex justify-center">
                  <Page pageNumber={idx + 1} width={720} />
                </div>
              ))}
            </Document>
          ) : (
            <div className="h-[480px] flex items-center justify-center text-xs text-slate-400 font-semibold">
              Upload a PDF to begin.
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <PenTool className="h-4 w-4 text-indigo-600" />
              Annotations
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add notes or approval remarks..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 h-24"
            />
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Signature</label>
              <input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 mt-2"
              />
            </div>
            <button
              onClick={onSave}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
            >
              <Save className="h-4 w-4" />
              Save to Document
            </button>
            {saved && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Saved to document record.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
