"use client"

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"

const offers = [
    {
        id: 1,
        title: "Brake System Sale — Up to 33% Off",
        image: "/images/category_brakes.jpg",
        href: "/offers/brake-system-sale",
        badge: "Sale",
    },
    {
        id: 2,
        title: "New Arrival: Bilstein Suspension Kits",
        image: "/images/category_suspension.jpg",
        href: "/offers/bilstein-suspension-new",
        badge: "New",
    },
    {
        id: 3,
        title: "Engine Performance — K&N Intake 30% Off",
        image: "/images/category_engine.jpg",
        href: "/offers/engine-performance-deals",
        badge: "Hot",
    },
    {
        id: 4,
        title: "Michelin Tyres — Fresh Stock, Best Prices",
        image: "/images/category_tires.jpg",
        href: "/offers/michelin-tyres-arrivals",
        badge: "New",
    },
    {
        id: 5,
        title: "Premium LED Lighting — Up to 25% Off",
        image: "/images/category_lighting.jpg",
        href: "/offers/led-lighting-sale",
        badge: "Sale",
    },
    {
        id: 6,
        title: "Performance Exhaust Systems — Special Deals",
        image: "/images/category_exhaust.jpg",
        href: "/offers/exhaust-system-deals",
        badge: "Hot",
    },
    {
        id: 7,
        title: "Alloy Wheels — Limited Time Offers",
        image: "/images/category_wheels.jpg",
        href: "/offers/alloy-wheels-sale",
        badge: "Sale",
    },
    {
        id: 8,
        title: "Interior Accessories — New Collection",
        image: "/images/category_interior.jpg",
        href: "/offers/interior-accessories-new",
        badge: "New",
    },
    {
        id: 9,
        title: "Air Intake Systems — Performance Deals",
        image: "/images/category_air-intake.jpg",
        href: "/offers/air-intake-deals",
        badge: "Hot",
    },
    {
        id: 10,
        title: "Car Care Essentials — Up to 20% Off",
        image: "/images/category_car-care.jpg",
        href: "/offers/car-care-sale",
        badge: "Sale",
    },
];

const badgeColors: Record<string, string> = {
    Sale: "bg-[#640C0C]",
    New: "bg-cyan-950",
    Hot: "bg-red-700",
};

export default function OffersPage() {
    const router = useRouter()
    return (
        <main className="min-h-screen bg-black text-white">
            <section className="mx-auto w-full max-w-350 px-6 pt-12 pb-8 lg:px-12 lg:pt-16">
                <button
                    onClick={() => router.back()}
                    className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white sm:mb-10"
                >
                    <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">
                        ←
                    </span>
                    Back
                </button>
                
                <div className="mb-2 flex items-center gap-2">
                    <span className="inline-block h-1 w-6 rounded-full bg-[#640C0C]" />

                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#640C0C] sm:text-xs lg:text-sm">
                        Limited Time
                    </span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            Latest Drops & Deals
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-white/50 sm:text-base">
                            Explore our latest offers, new arrivals, and limited time deals.
                        </p>
                    </div>

                    <span className="text-xs text-white/40 sm:text-sm">
                        {offers.length} Offers
                    </span>
                </div>
            </section>

            {/* Offers Grid */}
            <section className="mx-auto w-full max-w-350 px-6 pb-16 lg:px-12 lg:pb-24">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                    {offers.map((offer) => (
                        <Link
                            key={offer.id}
                            href={offer.href}
                            className="group relative block aspect-square w-full overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/70"
                        >
                            <Image
                                src={offer.image}
                                alt={offer.title}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-contain mix-blend-screen p-4 transition-transform duration-500 group-hover:scale-105"
                            />

                            {/* Bottom Gradient */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

                            {/* Badge */}
                            <span
                                className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow ${badgeColors[offer.badge] ?? "bg-[#640C0C]"
                                    }`}
                            >
                                {offer.badge}
                            </span>

                            {/* Title */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-white drop-shadow">
                                    {offer.title}
                                </p>
                            </div>

                            {/* Hover Border */}
                            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-white/0 transition-all duration-300 group-hover:ring-1 group-hover:ring-white/15" />
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}