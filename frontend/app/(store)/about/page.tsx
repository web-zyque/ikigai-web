"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { motion, useInView, useMotionValue, useSpring } from "framer-motion"
import Link from "next/link"
import {
    ArrowRight,
    ArrowUpRight,
    Compass,
    Heart,
    Sparkles,
} from "lucide-react"

const values = [
    {
        icon: Sparkles,
        title: "Personalisation",
        description:
            "Explore accessories that help your vehicle reflect your individual style and personality.",
    },
    {
        icon: Compass,
        title: "Choice",
        description:
            "Discover different automotive accessory categories and explore options for your vehicle.",
    },
    {
        icon: Heart,
        title: "Customer Focus",
        description:
            "We aim to make your shopping experience straightforward with clear product information and helpful support.",
    },
]

const highlights = [
    "Explore different accessory categories",
    "Find products that match your style",
    "Review product details before purchasing",
    "Get help with product-related questions",
]
interface Stat {
    value: number
    suffix: string
    label: string
}

const stats: Stat[] = [
    { value: 10, suffix: "+", label: "Years of Experience" },
    { value: 150, suffix: "+", label: "Cars Transformed" },
    { value: 500, suffix: "+", label: "Projects Completed" },
]

function Counter({
    value,
    suffix,
}: {
    value: number
    suffix: string
}) {
    const ref = useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, {
        once: true,
        margin: "-80px",
    })

    const motionValue = useMotionValue(0)
    const spring = useSpring(motionValue, {
        duration: 1600,
        bounce: 0,
    })

    useEffect(() => {
        if (inView) {
            motionValue.set(value)
        }
    }, [inView, motionValue, value])

    useEffect(() => {
        const unsubscribe = spring.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = `${Math.round(latest)}${suffix}`
            }
        })

        return unsubscribe
    }, [spring, suffix])

    return <span ref={ref}>0{suffix}</span>
}

export default function AboutPage() {
    return (
        <main className="min-h-screen overflow-hidden bg-black text-white">
            <section className="relative isolate overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 -z-20">
                    <Image
                        src="/images/hero-about.png"
                        alt="Automotive styling and car accessories"
                        fill
                        priority
                        sizes="100vw"
                        className="hidden md:block object-cover object-center"
                    />
                    <Image
                        src="/images/hero-about-mobile.png"
                        alt="Automotive styling and car accessories"
                        fill
                        priority
                        sizes="100vw"
                        className="block md:hidden object-cover object-center"
                    />
                </div>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/85 to-black/40" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-transparent to-black/30" />

                <div className="mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-20 lg:px-12 lg:pb-36 lg:pt-24">
                    <div className="max-w-3xl">
                        <div className="mb-5 flex items-center gap-2">
                            <span className="h-1 w-6 rounded-full bg-[#640C0C]" />

                            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b91c1c] sm:text-xs">
                                Our Story
                            </span>
                        </div>

                        <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                            Built for Those
                            <span className="mt-2 block text-white/50">
                                Who Love the Drive.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base lg:text-lg">
                            At Ikigai Car Accessories, we believe every vehicle deserves
                            its own identity. Discover accessories that help you express
                            your style and make every drive your own.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#7a1010]"
                            >
                                Our Products
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>

                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                            >
                                Contact Us
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="mt-16 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.25em] text-white/35 sm:mt-24">
                        <span className="h-px w-10 bg-[#640C0C]" />
                        IKIGAI CAR ACCESSORIES
                    </div>
                </div>
            </section>

            <section
                id="about"
                className="relative overflow-hidden bg-black py-16 text-white sm:py-20 lg:py-24"
            >
                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="order-1"
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <span className="h-1 w-6 rounded-full bg-[#640C0C]" />

                                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#640C0C] sm:text-xs">
                                    Who We Are
                                </span>
                            </div>

                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                Built for the
                                <span className="mt-1 block text-white/50">
                                    Passion.
                                </span>
                            </h2>

                            <p className="mt-4 text-xs uppercase tracking-[0.15em] text-white/40 sm:text-sm">
                                Engineered. Refined. Personal.
                            </p>

                            <div className="mt-6 max-w-xl space-y-4 text-sm leading-relaxed text-white/50 sm:text-base">
                                <p>We don&apos;t just modify cars.</p>

                                <p>
                                    We engineer them around the people who drive them.
                                </p>

                                <p>
                                    From performance upgrades and exterior transformations
                                    to precision interiors and custom builds, every detail
                                    is shaped with one purpose: to make the machine feel like yours.
                                </p>
                            </div>

                            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                                {[
                                    "Performance Engineering",
                                    "Exterior Transformation",
                                    "Interior Refinement",
                                    "Custom Fabrication",
                                    "Premium Components",
                                    "Complete Builds",
                                ].map((service) => (
                                    <div key={service} className="flex items-center gap-3">
                                        <span className="h-1.5 w-1.5 shrink-0 bg-[#640C0C]" />

                                        <span className="text-sm text-white/60">
                                            {service}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-10 border-t border-white/10 pt-7 sm:mt-12 sm:pt-8">
                                <div className="grid grid-cols-3 gap-3 sm:gap-5">
                                    {stats.map((stat) => (
                                        <div key={stat.label} className="text-center">
                                            <div className="mb-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                                <Counter
                                                    value={stat.value}
                                                    suffix={stat.suffix}
                                                />
                                            </div>

                                            <p className="text-[9px] font-medium uppercase leading-relaxed tracking-wide text-white/40 sm:text-[10px] lg:text-xs">
                                                {stat.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="order-2 flex flex-col items-center justify-center"
                        >
                            <h2 className="mb-8 text-center text-3xl font-normal uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
                                About
                            </h2>

                            <div className="w-full max-w-[680px]">
                                <Image
                                    src="/images/about.png"
                                    alt="Automotive chassis technical blueprint"
                                    width={680}
                                    height={400}
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="h-auto w-full object-contain object-center"
                                    style={{
                                        filter: "brightness(0.98) contrast(1.02)",
                                    }}
                                />
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-base uppercase leading-tight tracking-[0.1em] sm:text-lg">
                                    Engineered in detail.
                                    <br />
                                    <span className="text-[#640C0C]">
                                        Built to be felt.
                                    </span>
                                </p>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            <section className="border-y border-white/5 bg-[#050505] py-16 sm:py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mb-3 flex items-center justify-center gap-2">
                            <span className="h-1 w-6 rounded-full bg-[#640C0C]" />

                            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#640C0C] sm:text-xs">
                                What Matters to Us
                            </span>
                        </div>

                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            What We Stand For.
                        </h2>

                        <p className="mt-4 text-sm leading-relaxed text-white/50 sm:text-base">
                            Our approach is built around helping you explore products
                            and make informed choices for your vehicle.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
                        {values.map((value, index) => {
                            const Icon = value.icon

                            return (
                                <div
                                    key={value.title}
                                    className="group rounded-[20px] border border-white/10 bg-[#0a0a0a] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 sm:p-8"
                                >
                                    <div className="mb-7 flex items-center gap-3">
                                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-[#121212]">
                                            <Icon className="h-5 w-5 text-[#640C0C]" />
                                        </div>

                                        <h3 className="text-lg font-semibold text-white">
                                            {value.title}
                                        </h3>

                                        <span className="ml-auto shrink-0 text-xs font-medium tracking-widest text-white/20">
                                            0{index + 1}
                                        </span>
                                    </div>

                                    <p className="text-sm leading-relaxed text-white/45">
                                        {value.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0a0a0a] p-6 sm:p-10 lg:p-16">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#640C0C]/10 blur-3xl" />

                        <div className="relative max-w-5xl">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="h-1 w-6 rounded-full bg-[#640C0C]" />

                                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#640C0C] sm:text-xs">
                                    Our Approach
                                </span>
                            </div>

                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                Your Car.
                                <span className="block text-white/50">
                                    Your Style. Your Ikigai.
                                </span>
                            </h2>

                            <div className="mt-6 space-y-5 leading-7 text-white/50 text-base">
                                <p>
                                    Every driver has a different vision for their vehicle. Our approach is
                                    simple: make it easier to explore automotive accessories, understand
                                    product details, and discover options that match your preferences.
                                </p>

                                <p>
                                    From subtle interior upgrades to bold exterior modifications, the right
                                    accessories help bring your vision to life. We aim to make exploring
                                    products easier by presenting clear information, useful categories,
                                    and options for different styles.
                                </p>

                                <p>
                                    At Ikigai, we believe personalising your car should be an enjoyable
                                    experience. Whether you want to enhance its appearance, improve everyday
                                    comfort, or add your own distinctive touch, we want to help you find
                                    accessories that suit your needs.
                                </p>

                                <p className="font-medium text-white/75">
                                    Our goal is simple: help every driver find their style, one detail at a time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-white/5 bg-[#050505] py-16 sm:py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-6 text-center lg:px-12">
                    <div className="mb-3 flex items-center justify-center gap-2">
                        <span className="h-1 w-6 rounded-full bg-[#640C0C]" />

                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#640C0C] sm:text-xs">
                            Find Your Fit
                        </span>
                    </div>

                    <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        Ready to Upgrade
                        <span className="block text-white/50">
                            Your Ride?
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
                        Explore our collection and find accessories that match
                        your style.
                    </p>

                    <div className="mt-8 flex flex-row items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/products"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#640C0C] px-6 py-3 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-[#7a1010] sm:w-auto"
                        >
                            Our Products
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>

                        <Link
                            href="/contact"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-white/10 sm:w-auto"
                        >
                            Contact Us
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}