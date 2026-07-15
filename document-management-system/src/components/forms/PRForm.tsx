"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface PRItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface PRFormProps {
  onSubmit: (data: {
    title: string;
    sender: string;
    amount: string;
    items: PRItem[];
  }) => void;
  onCancel: () => void;
}

export default function PRForm({ onSubmit, onCancel }: PRFormProps) {
  const [title, setTitle] = useState("");
  const [sender, setSender] = useState("");
  const [items, setItems] = useState<PRItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0 },
  ]);

  const handleAddItem = () => {
    const newId = String(items.length + 1);
    setItems([...items, { id: newId, description: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof PRItem,
    value: string | number
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Calculate totals
  const grandTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !sender) {
      alert("Please fill in document title and requester!");
      return;
    }
    onSubmit({
      title,
      sender,
      amount: `฿${grandTotal.toLocaleString()}`,
      items,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Document Title / Subject
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. ขอซื้อวัสดุสำนักงาน Q3/2026"
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Requester Name
          </label>
          <input
            type="text"
            required
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="e.g. สมชาย ใจดี"
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Line Items
          </h4>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </button>
        </div>

        <div className="border border-slate-100/50 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 pl-4">Description</th>
                <th className="py-3 w-24 text-center">Qty</th>
                <th className="py-3 w-32 text-right">Unit Price (฿)</th>
                <th className="py-3 w-32 text-right">Total Price (฿)</th>
                <th className="py-3 w-16 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/80">
              {items.map((item) => {
                const total = item.quantity * item.unitPrice;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="py-2.5 pl-4">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(item.id, "description", e.target.value)
                        }
                        placeholder="Item name / details"
                        className="w-full bg-transparent border-none text-sm font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-0 p-0"
                      />
                    </td>
                    <td className="py-2.5 text-center">
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "quantity",
                            Math.max(1, parseInt(e.target.value) || 0)
                          )
                        }
                        className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        required
                        value={item.unitPrice || ""}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "unitPrice",
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        placeholder="0"
                        className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-right text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2.5 text-right text-sm font-bold text-slate-700 pr-4">
                      {total.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                        className="text-slate-300 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRAND TOTAL */}
      <div className="flex justify-end items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Grand Total
        </span>
        <span className="text-xl font-extrabold text-blue-600">
          ฿{grandTotal.toLocaleString()}
        </span>
      </div>

      {/* SUBMIT BUTTONS */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-slate-100 hover:bg-slate-50 text-slate-500 font-bold rounded-full text-sm transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-sm transition-all shadow-sm shadow-blue-100 cursor-pointer active:scale-95"
        >
          Submit PR Document
        </button>
      </div>
    </form>
  );
}
