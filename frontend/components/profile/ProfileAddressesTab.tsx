"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Address } from "@/types/address.types";

interface ProfileAddressesTabProps {
  addresses: Address[];
  isAddAddressOpen: boolean;
  setIsAddAddressOpen: (open: boolean) => void;
  newAddr: Omit<Address, "id" | "isDefault">;
  setNewAddr: React.Dispatch<React.SetStateAction<Omit<Address, "id" | "isDefault">>>;
  onAddAddress: (e: React.FormEvent) => void;
  onSetDefaultAddress: (id: string) => void;
  onDeleteAddress: (id: string) => void;
}

export function ProfileAddressesTab({
  addresses,
  isAddAddressOpen,
  setIsAddAddressOpen,
  newAddr,
  setNewAddr,
  onAddAddress,
  onSetDefaultAddress,
  onDeleteAddress,
}: ProfileAddressesTabProps) {
  return (
    <div className="rounded-[20px] bg-[#121212] border border-white/10 p-6 sm:p-7 space-y-6">
      <div className="flex items-center justify-end pb-2">
        <button
          type="button"
          onClick={() => setIsAddAddressOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#640C0C] hover:bg-[#7a1010] px-4 py-2 rounded-full transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Address</span>
        </button>
      </div>

      {isAddAddressOpen && (
        <form
          onSubmit={onAddAddress}
          className="p-5 rounded-2xl border border-white/15 bg-[#0a0a0a] space-y-4"
        >
          <h3 className="text-sm font-bold text-white">New Shipping Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <input
              type="text"
              required
              placeholder="Full Name"
              value={newAddr.name}
              onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
              className="h-10 px-3.5 rounded-lg bg-[#141414] border border-white/10 text-white placeholder:text-white/30"
            />
            <input
              type="text"
              required
              placeholder="Phone Number"
              value={newAddr.phone}
              onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
              className="h-10 px-3.5 rounded-lg bg-[#141414] border border-white/10 text-white placeholder:text-white/30"
            />
            <input
              type="text"
              required
              placeholder="Address Line / Street / Flat"
              value={newAddr.addressLine}
              onChange={(e) =>
                setNewAddr({ ...newAddr, addressLine: e.target.value })
              }
              className="h-10 px-3.5 rounded-lg bg-[#141414] border border-white/10 text-white placeholder:text-white/30 sm:col-span-2"
            />
            <input
              type="text"
              required
              placeholder="City"
              value={newAddr.city}
              onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
              className="h-10 px-3.5 rounded-lg bg-[#141414] border border-white/10 text-white placeholder:text-white/30"
            />
            <input
              type="text"
              required
              placeholder="State"
              value={newAddr.state}
              onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
              className="h-10 px-3.5 rounded-lg bg-[#141414] border border-white/10 text-white placeholder:text-white/30"
            />
            <input
              type="text"
              required
              placeholder="Pincode"
              value={newAddr.pincode}
              onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
              className="h-10 px-3.5 rounded-lg bg-[#141414] border border-white/10 text-white placeholder:text-white/30"
            />
            <div className="flex items-center gap-4">
              <label className="text-xs text-white/70">Type:</label>
              <label className="inline-flex items-center gap-1.5 text-xs text-white cursor-pointer">
                <input
                  type="radio"
                  name="addrType"
                  checked={newAddr.type === "Home"}
                  onChange={() => setNewAddr({ ...newAddr, type: "Home" })}
                  className="accent-[#640C0C]"
                />
                Home
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-white cursor-pointer">
                <input
                  type="radio"
                  name="addrType"
                  checked={newAddr.type === "Work"}
                  onChange={() => setNewAddr({ ...newAddr, type: "Work" })}
                  className="accent-[#640C0C]"
                />
                Work
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddAddressOpen(false)}
              className="px-3.5 py-1.5 text-xs text-white/60 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-xs font-semibold text-white cursor-pointer"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`rounded-2xl border p-5 space-y-3 relative ${
              addr.isDefault
                ? "border-[#640C0C] bg-[#640C0C]/5"
                : "border-white/10 bg-[#0a0a0a]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                {addr.type}
              </span>
              {addr.isDefault ? (
                <span className="text-[10px] font-medium text-emerald-400">
                  Default Address
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSetDefaultAddress(addr.id)}
                  className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                >
                  Set as Default
                </button>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-white">{addr.name}</p>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-xs text-white/40 font-mono mt-1">{addr.phone}</p>
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => onDeleteAddress(addr.id)}
                className="text-white/40 hover:text-red-400 transition-colors p-1 cursor-pointer"
                title="Delete Address"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
