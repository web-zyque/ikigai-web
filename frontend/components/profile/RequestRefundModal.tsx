"use client";

import React from "react";
import { X } from "lucide-react";
import { ProfileOrder, RefundFormData } from "./profile.types";

interface RequestRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: ProfileOrder[];
  refundForm: RefundFormData;
  setRefundForm: React.Dispatch<React.SetStateAction<RefundFormData>>;
  onSubmit: (e: React.FormEvent) => void;
}

export function RequestRefundModal({
  isOpen,
  onClose,
  orders,
  refundForm,
  setRefundForm,
  onSubmit,
}: RequestRefundModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-[20px] border border-white/10 bg-[#121212] p-6 shadow-2xl text-white space-y-4"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white">Request a Refund or Return</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Select Order
            </label>
            <select
              required
              value={refundForm.orderId}
              onChange={(e) => {
                const sel = orders.find((o) => o.id === e.target.value);
                setRefundForm({
                  ...refundForm,
                  orderId: e.target.value,
                  productName: sel ? sel.productName : "",
                });
              }}
              className="w-full h-10 rounded-xl bg-[#0a0a0a] border border-white/10 px-3 text-xs text-white outline-none focus:border-white/30 cursor-pointer"
            >
              <option value="">Select a past purchase...</option>
              {orders.map((ord) => (
                <option key={ord.id} value={ord.id}>
                  {ord.id} — {ord.productName} (₹{ord.amount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Reason for Return / Refund
            </label>
            <textarea
              required
              rows={3}
              value={refundForm.reason}
              onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
              placeholder="Describe why you want to return or request a refund (e.g. fitment issue, damaged package, defect)..."
              className="w-full rounded-xl bg-[#0a0a0a] border border-white/10 p-3 text-xs text-white outline-none focus:border-white/30"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-white/15 text-white/70 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-white font-semibold cursor-pointer"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
