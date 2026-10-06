"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";
import { Phone, Lock, User, ShieldCheck } from "lucide-react";
import { useSendOtp, useVerifyOtp, useSignup, useLogin } from "@/hooks/auth";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-2 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:border-white/25 focus-visible:ring-1 focus-visible:ring-[#640C0C] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

export function AuthForm({
  className,
  children,
  ...props
}: React.ComponentProps<"form">) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpVerified, setOtpVerified] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [password, setPassword] = React.useState("");

  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const signupMutation = useSignup();
  const loginMutation = useLogin();

  const handleVerify = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (phone.length > 5) {
      try {
        await sendOtpMutation.mutateAsync({ phone });
        setOtpSent(true);
      } catch (error) {
        // Error is handled in the mutation, just don't set otpSent
      }
    }
  };

  const handleVerifyOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      try {
        await verifyOtpMutation.mutateAsync({ phone, otp });
        setOtpVerified(true);
      } catch (error) {
        // Error is handled in the mutation
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Login
      if (phone && password) {
        try {
          await loginMutation.mutateAsync({ phone, password });
        } catch (error) {
          // Error is handled in the mutation
        }
      }
    } else {
     
      if (fullName && phone && otp && password && otpVerified) {
        try {
          await signupMutation.mutateAsync({ fullName, phone, otp, password });
        } catch (error) {
          // Error is handled in the mutation
        }
      }
    }
  };

  const toggleMode = (e: React.MouseEvent) => {
    e.preventDefault();
    
    sendOtpMutation.reset();
    verifyOtpMutation.reset();
    signupMutation.reset();
    loginMutation.reset();
    
    setIsLogin(!isLogin);
    setOtpSent(false);
    setOtpVerified(false);
    setPhone("");
    setFullName("");
    setOtp("");
    setPassword("");
  };

  const currentError = isLogin 
    ? loginMutation.error?.message 
    : (!otpSent 
        ? sendOtpMutation.error?.message 
        : (!otpVerified 
            ? verifyOtpMutation.error?.message 
            : signupMutation.error?.message));

  const isPending = isLogin 
    ? loginMutation.isPending 
    : (!otpSent 
        ? sendOtpMutation.isPending 
        : (!otpVerified 
            ? verifyOtpMutation.isPending 
            : signupMutation.isPending));

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)}>
      <motion.div
        key={isLogin ? "login" : "signup"}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-white/60">
            {isLogin
              ? "Log in to your account to continue"
              : "Sign up to start shopping"}
          </p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit} {...props}>
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="pl-10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
              {!isLogin && !otpSent && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleVerify}
                  disabled={sendOtpMutation.isPending || phone.length < 6}
                  className="px-4"
                >
                  {sendOtpMutation.isPending ? "Sending..." : "Verify"}
                </Button>
              )}
            </div>
          </div>

          {!isLogin && otpSent && !otpVerified && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4 overflow-hidden"
            >
              <div className="text-xs text-white/60 text-center">
                Enter the verification code sent to <span className="font-medium text-white">{phone}</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="pl-10"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);

                        if (verifyOtpMutation.error) {
                          verifyOtpMutation.reset();
                        }
                      }}
                      disabled={isPending}
                      required
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleVerifyOtp}
                    disabled={verifyOtpMutation.isPending || otp.length !== 6}
                    className="px-4"
                  >
                    {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {!isLogin && otpSent && otpVerified && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2 overflow-hidden"
            >
              <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
                <ShieldCheck className="h-4 w-4" />
                Phone number verified successfully
              </div>
            </motion.div>
          )}

          {(isLogin || (!isLogin && otpVerified)) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <a
                    href="/forgot-password"
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
            </motion.div>
          )}

          {currentError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
            >
              {currentError}
            </motion.div>
          )}

          {(isLogin || (!isLogin && otpVerified)) && (
            <Button 
              type="submit" 
              className="w-full mt-2 h-11 text-base"
              disabled={isPending || (!isLogin && !password)}
            >
              {isLogin 
                ? (loginMutation.isPending ? "Logging In..." : "Log In")
                : (signupMutation.isPending ? "Creating..." : "Sign Up")
              }
            </Button>
          )}

          <p className="text-sm text-white/60 text-center mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <a
              href="#"
              onClick={toggleMode}
              className="font-semibold text-white hover:text-white/80 transition-colors"
            >
              {isLogin ? "Sign up" : "Log in"}
            </a>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
export default AuthForm;
