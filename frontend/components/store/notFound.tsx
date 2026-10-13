"use client"

import Image from "next/image"
import { ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotFound() {
    const router = useRouter()

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-12 lg:px-12">
                <div className="w-full max-w-xl text-center">
                    <div className="relative mx-auto w-full max-w-md sm:max-w-lg">
                        <Image
                            src="/images/404Error.webp"
                            alt="404 Page Not Found"
                            width={1536}
                            height={1024}
                            priority
                            className="h-auto w-full object-contain"
                        />
                    </div>
                    <h1 className="mb-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
                        Page Not Found
                    </h1>
                    <p className="mx-auto max-w-md text-sm leading-relaxed text-neutral-400 sm:text-base">
                        The page you&apos;re looking for doesn&apos;t exist, has been moved, or the address you entered is incorrect.
                    </p>
                    <div className="mt-8 flex flex-row items-center justify-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </button>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#640C0C] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                        >
                            <Home className="h-4 w-4" />
                            Home Page
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}