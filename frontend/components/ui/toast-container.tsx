"use client";

import { useToastStore } from "@/stores/toast-store";

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 sm:right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in fade-in slide-in-from-top-5 duration-300"
        >
          <div className="bg-[#2a2a2a] border border-white/10 shadow-xl shadow-black/50 text-white px-5 py-3 rounded-xl flex items-center gap-3 min-w-[250px]">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="font-medium text-sm">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
