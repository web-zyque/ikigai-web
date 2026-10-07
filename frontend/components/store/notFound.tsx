"use client"

import Image from "next/image"
import { ArrowLeft, Home, SearchX } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotFound() {
    const router = useRouter()

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-20 lg:px-12">
                <div className="w-full max-w-2xl text-center">
                    <div className="mx-auto mb-8 grid h-20 w-20 place-items-center rounded-[20px] border border-white/2 bg-[#0a0a0a]">
                        <Image
                            src="/images/logo.png"
                            alt="Ikigai"
                            width={82}
                            height={82}
                            className="object-contain"
                        />
                    </div>
                    <p className="mb-3 text-xs sm:text-sm lg:text-sm font-semibold uppercase tracking-[0.25em] text-[#640C0C]">
                        Page Not Found
                    </p>
                    <h1 className="bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent text-[80px] font-bold tracking-[-0.06em] leading-none sm:text-[100px] lg:text-[120px]">
                        404
                    </h1>

                    <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                        We couldn&apos;t find that page.
                    </h2>
                    <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/50 sm:text-base">
                        The page you&apos;re looking for doesn&apos;t exist, has been moved, or the
                        address you entered is incorrect.
                    </p>
                    <div className="mt-8 flex flex-row items-center justify-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex w-auto items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:w-auto"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </button>
                        <Link
                            href="/"
                            className="inline-flex w-auto items-center justify-center gap-2 rounded-full bg-[#640C0C] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
                        >
                            <Home className="h-4 w-4" />
                            Home Page
                        </Link>

                    </div>
                    <div className="mx-auto mt-12 h-px w-24 bg-[#640C0C]/60" />

                    <p className="mt-4 text-xs text-white/30">
                        IKIGAI CAR ACCESSORIES
                    </p>
                </div>
            </div>
        </main>
    )
}