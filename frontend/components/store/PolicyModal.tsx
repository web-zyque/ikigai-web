"use client"

import { X } from "lucide-react"
import { ReactNode, useEffect } from "react"

interface PolicyModalProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
  lastUpdated?: string
  children: ReactNode
}

export default function PolicyModal({
  open,
  onClose,
  title,
  description,
  lastUpdated,
  children,
}: PolicyModalProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-modal-title"
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/70"
      >
        <div className="shrink-0 border-b border-white/10 bg-[#121212] px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1 w-6 rounded-full bg-[#640C0C]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#640C0C] sm:text-xs">
                  Ikigai Car Accessories
                </span>
              </div>

              <h2
                id="policy-modal-title"
                className="text-xl font-bold tracking-tight text-white sm:text-2xl"
              >
                {title}
              </h2>

              <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-white/40 sm:text-sm">
                {description}
              </p>

              {lastUpdated && (
                <p className="mt-2 text-[11px] text-white/30">
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close policy"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#640C0C]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
          <div className="space-y-7 text-sm leading-7 text-white/65">
            {children}
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-[#121212] px-5 py-4 sm:px-7">
          <p className="text-[10px] uppercase tracking-widest text-white/25">
            IKIGAI CAR ACCESSORIES
          </p>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#640C0C] px-5 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}