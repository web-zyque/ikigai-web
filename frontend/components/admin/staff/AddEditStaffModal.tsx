"use client";

import { useEffect, useState } from "react";
import { Copy, Eye, EyeOff, RefreshCw, X } from "lucide-react";
import type { StaffMember, StaffFormData } from "@/types/staff.types";

export interface AddEditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StaffFormData, staffId?: string) => Promise<void>;
  staffToEdit?: StaffMember | null;
}

function generatePassword() {
  const groups = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%"];
  const alphabet = groups.join("");
  const values = new Uint32Array(20);
  crypto.getRandomValues(values);
  const password = groups.map((group, index) => group[values[index] % group.length]);
  return password.concat(Array.from(values.slice(4), (value) => alphabet[value % alphabet.length])).join("");
}

export default function AddEditStaffModal({ isOpen, onClose, onSave, staffToEdit }: AddEditStaffModalProps) {
  const editing = Boolean(staffToEdit);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordMode, setPasswordMode] = useState<"auto" | "manual">("auto");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(staffToEdit?.name ?? "");
    setEmail(staffToEdit?.email ?? "");
    setPhone(staffToEdit?.phone ?? "");
    setPasswordMode("auto");
    setPassword(editing ? "" : generatePassword());
    setConfirm("");
    setVisible(false);
    setError("");
  }, [isOpen, staffToEdit, editing]);

  if (!isOpen) return null;
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !phone.trim()) return setError("Name, email, and phone are required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (!/^\+?[\d\s().-]{10,20}$/.test(phone.trim())) return setError("Enter a valid phone number with country code.");
    if (!editing && passwordMode === "manual" && (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password))) return setError("Use 12+ characters with uppercase, lowercase, a number, and a symbol.");
    if (!editing && passwordMode === "manual" && password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      await onSave({ name: name.trim(), email: email.trim(), phone: phone.trim(), address: "", role: "Staff", joinDate: staffToEdit?.joinDate ?? new Date().toISOString().slice(0, 10), status: staffToEdit?.status ?? "Active", password: editing ? undefined : password });
      setPassword("");
      setConfirm("");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save staff member.");
    } finally { setBusy(false); }
  };

  return <div role="dialog" aria-modal="true" onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
    <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-xl space-y-5 rounded-3xl border border-white/10 bg-[#121212] p-6 text-white shadow-2xl">
      <div className="flex items-start justify-between"><div><h2 className="text-lg font-bold">{editing ? "Edit staff member" : "Add staff member"}</h2><p className="mt-1 text-xs text-white/50">Staff accounts use the existing STAFF access role.</p></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-white/60 hover:bg-white/10"><X size={18}/></button></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-xs text-white/70">Full name<input required maxLength={100} value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white" /></label>
        <label className="space-y-1 text-xs text-white/70">Email address<input required type="email" maxLength={254} value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white" /></label>
        <label className="space-y-1 text-xs text-white/70">Phone number<input required type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e)=>setPhone(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white" /></label>
        <label className="space-y-1 text-xs text-white/70">Staff role<select value="Staff" disabled className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white"><option>Staff</option></select></label>
      </div>
      {!editing && <section className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex gap-4 text-sm"><label className="flex items-center gap-2"><input type="radio" checked={passwordMode === "auto"} onChange={()=>setPasswordMode("auto")} />Generate password</label><label className="flex items-center gap-2"><input type="radio" checked={passwordMode === "manual"} onChange={()=>setPasswordMode("manual")} />Enter password</label></div>
        <label className="block text-xs text-white/60">{passwordMode === "auto" ? "Generated password (save it before closing)" : "Password (12+ characters)"}<span className="mt-1 flex gap-2"><input type={visible ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} minLength={12} required className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-black px-3 font-mono text-sm text-white"/><button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={()=>setVisible(!visible)} className="rounded-lg border border-white/10 px-3">{visible?<EyeOff size={16}/>:<Eye size={16}/>}</button>{passwordMode === "auto" && <><button type="button" aria-label="Copy password" onClick={()=>navigator.clipboard.writeText(password)} className="rounded-lg border border-white/10 px-3"><Copy size={16}/></button><button type="button" aria-label="Regenerate password" onClick={()=>setPassword(generatePassword())} className="rounded-lg border border-white/10 px-3"><RefreshCw size={16}/></button></>}</span></label>
        {passwordMode === "manual" && <label className="block text-xs text-white/60">Confirm password<input type={visible ? "text" : "password"} required minLength={12} value={confirm} onChange={(e)=>setConfirm(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white" /></label>}
      </section>}
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-full border border-white/15 px-5 py-2 text-xs">Cancel</button><button disabled={busy} className="rounded-full bg-[#640C0C] px-5 py-2 text-xs font-semibold disabled:opacity-50">{busy ? "Saving…" : editing ? "Save changes" : "Create staff"}</button></div>
    </form>
  </div>;
}
