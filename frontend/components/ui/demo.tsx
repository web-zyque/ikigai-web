import { AuthForm } from "@/components/ui/login-minimal";

export default function LoginMinimalDemo() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black p-6">
      <div className="w-full max-w-sm rounded-[20px] bg-[#121212] border border-white/5 p-8 shadow-2xl">
        <AuthForm />
      </div>
    </div>
  );
}
