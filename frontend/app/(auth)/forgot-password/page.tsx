"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/login-minimal";
import { Phone, ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function ForgotPasswordPage() {
  const [otpSent, setOtpSent] = React.useState(false);
  const [phone, setPhone] = React.useState("");

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length > 5) {
      setOtpSent(true);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate reset logic
    alert("Password reset successfully!");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black p-6">
      <div className="w-full max-w-sm rounded-[20px] bg-[#121212] border border-white/5 p-8 shadow-2xl">
        <div className="flex flex-col gap-6 w-full">
          <motion.div
            key={otpSent ? "reset" : "phone"}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Reset password
              </h1>
              <p className="text-sm text-white/60">
                {otpSent 
                  ? "Enter the verification code and your new password."
                  : "Enter your phone number to receive a verification code."}
              </p>
            </div>

            <form className="grid gap-4" onSubmit={otpSent ? handleResetPassword : handleSendOtp}>
              {!otpSent ? (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="pl-10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 overflow-hidden"
                >
                  <p className="text-xs text-white/60 text-center">
                    Isn&apos;t  <span className="font-medium text-white">{phone}</span> your number?{" "}
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="font-semibold text-[#640C0C] hover:opacity-80 transition-colors underline underline-offset-4"
                    >
                      Edit it
                    </button>
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter OTP"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <Button type="submit" className="w-full mt-2 h-11 text-base">
                {otpSent ? "Reset Password" : "Send Code"}
              </Button>
            </form>
          </motion.div>

          <div className="text-center mt-2">
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-semibold text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}