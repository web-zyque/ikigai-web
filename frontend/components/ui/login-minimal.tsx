"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";
import { Phone, Lock, User, ShieldCheck } from "lucide-react";

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
  const [phone, setPhone] = React.useState("");

  const handleVerify = () => {
    if (phone.length > 5) {
      setOtpSent(true);
    }
  };

  const toggleMode = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLogin(!isLogin);
    setOtpSent(false);
    setPhone("");
  };

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

        <form className="grid gap-4" {...props}>
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
                  required
                />
              </div>
              {!isLogin && !otpSent && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleVerify}
                  className="px-4"
                >
                  Verify
                </Button>
              )}
            </div>
          </div>

          {!isLogin && otpSent && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2 overflow-hidden"
            >
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
            </motion.div>
          )}

          {(isLogin || (!isLogin && otpSent)) && (
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
                  required
                />
              </div>
            </motion.div>
          )}

          <Button type="submit" className="w-full mt-2 h-11 text-base">
            {isLogin ? "Log In" : "Sign Up"}
          </Button>

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
