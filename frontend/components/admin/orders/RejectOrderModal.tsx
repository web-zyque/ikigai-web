"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";

export interface RejectableOrder {
  id: string;
  orderNumber: string;
  customerName: string;
}

interface RejectOrderModalProps {
  order: RejectableOrder;
  isSubmitting: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export default function RejectOrderModal({
  order,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: RejectOrderModalProps) {
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setValidationError("Enter a reason for rejecting this order.");
      return;
    }
    if (trimmedReason.length > 1000) {
      setValidationError("The reason must be 1,000 characters or fewer.");
      return;
    }
    setValidationError("");
    onSubmit(trimmedReason);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-order-title"
        className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#121212] text-white shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <header className="flex items-start justify-between border-b border-white/10 bg-[#0a0a0a] px-5 py-4 sm:px-6">
          <div>
            <h2 id="reject-order-title" className="text-lg font-bold">Reject Order</h2>
            <p className="mt-1 text-xs text-white/50">This order will be cancelled.</p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            disabled={isSubmitting}
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-5 sm:p-6">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/50">Order number</span>
                <span className="font-mono font-medium">{order.orderNumber}</span>
              </div>
              <div className="mt-2 flex justify-between gap-4 text-sm">
                <span className="text-white/50">Customer</span>
                <span className="text-right font-medium">{order.customerName}</span>
              </div>
            </div>

            <p className="text-sm leading-6 text-white/75">
              Are you sure you want to reject this order?
            </p>

            <div className="space-y-2">
              <label htmlFor="order-rejection-reason" className="text-sm font-medium text-white/80">
                Reason for rejection <span className="text-red-400">*</span>
              </label>
              <textarea
                id="order-rejection-reason"
                required
                rows={4}
                maxLength={1000}
                value={reason}
                disabled={isSubmitting}
                onChange={event => {
                  setReason(event.target.value);
                  setValidationError("");
                }}
                aria-invalid={Boolean(validationError)}
                aria-describedby={validationError ? "reject-reason-error" : undefined}
                placeholder="Explain why this order is being rejected…"
                className={`w-full resize-y rounded-xl border bg-black/60 px-3.5 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 disabled:opacity-60 ${validationError ? "border-red-500/60 focus:border-red-400" : "border-white/10 focus:border-white/25"}`}
              />
              <div className="flex min-h-5 items-center justify-between gap-3 text-xs">
                {validationError ? (
                  <p id="reject-reason-error" role="alert" className="flex items-center gap-1.5 text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" /> {validationError}
                  </p>
                ) : <span className="text-white/40">A reason is required.</span>}
                <span className="ml-auto text-white/35">{reason.length}/1000</span>
              </div>
            </div>

            {errorMessage && (
              <p role="alert" className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                {errorMessage}
              </p>
            )}
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-white/10 bg-black/20 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#640C0C] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7a1010] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Rejecting…" : "Reject Order"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
