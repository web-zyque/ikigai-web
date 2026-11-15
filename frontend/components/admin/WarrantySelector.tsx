"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export type WarrantyUnit = "days" | "weeks" | "months" | "years";
export type WarrantyMode = "none" | "lifetime" | "custom";

interface WarrantySelectorProps {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

function parseWarrantyString(str: string): { mode: WarrantyMode; value: string; unit: WarrantyUnit } {
  const trimmed = (str || "").trim();
  if (!trimmed || trimmed.toLowerCase() === "no warranty") {
    return { mode: "none", value: "1", unit: "years" };
  }
  if (trimmed.toLowerCase().includes("lifetime")) {
    return { mode: "lifetime", value: "1", unit: "years" };
  }
  const match = trimmed.match(/^(\d+)\s*(day|days|week|weeks|month|months|year|years)/i);
  if (match) {
    const val = match[1];
    const rawUnit = match[2].toLowerCase();
    let unit: WarrantyUnit = "years";
    if (rawUnit.startsWith("day")) unit = "days";
    else if (rawUnit.startsWith("week")) unit = "weeks";
    else if (rawUnit.startsWith("month")) unit = "months";
    else if (rawUnit.startsWith("year")) unit = "years";
    return { mode: "custom", value: val, unit };
  }
  return { mode: "custom", value: "1", unit: "years" };
}

function formatCustomWarranty(value: string | number, unit: WarrantyUnit): string {
  const num = Math.max(1, parseInt(String(value), 10) || 1);
  const unitLabels: Record<WarrantyUnit, { singular: string; plural: string }> = {
    days: { singular: "Day", plural: "Days" },
    weeks: { singular: "Week", plural: "Weeks" },
    months: { singular: "Month", plural: "Months" },
    years: { singular: "Year", plural: "Years" },
  };
  const unitLabel = num === 1 ? unitLabels[unit].singular : unitLabels[unit].plural;
  return `${num} ${unitLabel} Warranty`;
}

export function WarrantySelector({
  value,
  onChange,
  isOpen,
  onToggle,
  onClose,
  containerRef,
}: WarrantySelectorProps) {
  const [mode, setMode] = useState<WarrantyMode>("none");
  const [numericValue, setNumericValue] = useState<string>("1");
  const [unit, setUnit] = useState<WarrantyUnit>("years");

  useEffect(() => {
    const parsed = parseWarrantyString(value);
    setMode(parsed.mode);
    setNumericValue(parsed.value);
    setUnit(parsed.unit);
  }, [value, isOpen]);

  const handleSelectNone = () => {
    setMode("none");
    onChange("No Warranty");
    onClose();
  };

  const handleSelectLifetime = () => {
    setMode("lifetime");
    onChange("Lifetime Warranty");
    onClose();
  };

  const handleSelectCustom = () => {
    setMode("custom");
    if (!numericValue || numericValue === "0") {
      setNumericValue("1");
    }
  };

  const handleApplyCustom = () => {
    const formatted = formatCustomWarranty(numericValue, unit);
    onChange(formatted);
    onClose();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-xs text-white flex items-center justify-between hover:border-white/20 transition-colors cursor-pointer"
      >
        <span className="truncate">{value || "No Warranty"}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-white/50 transition-transform shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-full min-w-[280px] z-50 rounded-2xl border border-white/15 bg-[#161616] p-2.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={handleSelectNone}
              className={`w-full flex items-center justify-start px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                mode === "none"
                  ? "bg-white/15 text-white font-medium border border-white/20"
                  : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <span>No Warranty</span>
            </button>

            <button
              type="button"
              onClick={handleSelectLifetime}
              className={`w-full flex items-center justify-start px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                mode === "lifetime"
                  ? "bg-white/15 text-white font-medium border border-white/20"
                  : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <span>Lifetime Warranty</span>
            </button>

            <button
              type="button"
              onClick={handleSelectCustom}
              className={`w-full flex items-center justify-start px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                mode === "custom"
                  ? "bg-white/15 text-white font-medium border border-white/20"
                  : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <span>Custom Duration</span>
            </button>
          </div>

          {mode === "custom" && (
            <div className="pt-2.5 mt-2 border-t border-white/10 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-white/50 block mb-1 font-medium">
                    Duration
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setNumericValue((prev) =>
                          String(Math.max(1, (parseInt(prev, 10) || 1) - 1))
                        )
                      }
                      className="h-9 w-7 flex items-center justify-center rounded-l-xl bg-white/5 border border-r-0 border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={numericValue}
                      onChange={(e) => setNumericValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCustom();
                        }
                      }}
                      placeholder="1"
                      className="w-full h-9 bg-white/5 border border-white/10 px-2 text-xs text-white text-center font-medium outline-none focus:border-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setNumericValue((prev) =>
                          String((parseInt(prev, 10) || 0) + 1)
                        )
                      }
                      className="h-9 w-7 flex items-center justify-center rounded-r-xl bg-white/5 border border-l-0 border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-white/50 block mb-1 font-medium">
                    Unit
                  </label>
                  <div className="relative">
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as WarrantyUnit)}
                      className="w-full h-9 rounded-xl bg-[#1e1e1e] border border-white/10 px-3 pr-7 text-xs text-white outline-none focus:border-white/30 appearance-none cursor-pointer"
                    >
                      <option value="days" className="bg-[#1e1e1e] text-white">
                        Days
                      </option>
                      <option value="weeks" className="bg-[#1e1e1e] text-white">
                        Weeks
                      </option>
                      <option value="months" className="bg-[#1e1e1e] text-white">
                        Months
                      </option>
                      <option value="years" className="bg-[#1e1e1e] text-white">
                        Years
                      </option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50 pointer-events-none" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyCustom}
                className="w-full h-9 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-colors cursor-pointer flex items-center justify-center"
              >
                <span>Apply ({formatCustomWarranty(numericValue, unit)})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
