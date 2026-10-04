"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

const categories = [
  {
    name: "Brakes",
    image: "/images/category_brakes.jpg",
    count: 12,
  },
  {
    name: "Suspension",
    image: "/images/category_suspension.jpg",
    count: 8,
  },
  {
    name: "Engine",
    image: "/images/category_engine.jpg",
    count: 4,
  },
  {
    name: "Tires",
    image: "/images/category_tires.jpg",
    count: 15,
  },
  {
    name: "Exhaust",
    image: "/images/category_exhaust.jpg",
    count: 9,
  },
  {
    name: "Lighting",
    image: "/images/category_lighting.jpg",
    count: 11,
  },
  {
    name: "Wheels",
    image: "/images/category_wheels.jpg",
    count: 18,
  },
  {
    name: "Interior",
    image: "/images/category_interior.jpg",
    count: 14,
  },
  {
    name: "Exterior",
    image: "/images/category_exterior.jpg",
    count: 16,
  },
  {
    name: "Performance",
    image: "/images/category_air-intake.jpg",
    count: 10,
  },
  {
    name: "Car Electronics",
    image: "/images/category_car-electronics.jpg",
    count: 13,
  },
  {
    name: "Car Care",
    image: "/images/category_car-care.jpg",
    count: 20,
  },
]

export default function CategoriesPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-10 sm:py-12 lg:px-12 lg:py-16">
        <button
          onClick={() => router.back()}
          className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white sm:mb-10"
        >
          <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          Back
        </button>
        <div className="mb-10 sm:mb-12 lg:mb-14">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-1 w-6 rounded-full bg-[#640C0C]" />

            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#640C0C] sm:text-xs lg:text-sm">
              Explore
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Categories
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50 sm:text-base">
                Explore our collection of automotive parts and accessories by category.
              </p>
            </div>

            <span className="text-xs text-white/40 sm:text-sm">
              {categories.length} Categories
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/categories/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-[#0d0d0d] hover:shadow-2xl hover:shadow-black/60 sm:p-5 lg:p-6"
            >
              <div className="relative mx-auto aspect-square w-full max-w-[180px]">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 20vw"
                  className="object-contain mix-blend-screen transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="mt-3 text-center sm:mt-4">
                <h2 className="text-sm font-semibold sm:text-base lg:text-lg">
                  {category.name}
                </h2>

                <p className="mt-1 text-[11px] text-white/40 sm:text-xs">
                  {category.count} Products
                </p>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-white/0 transition-all duration-300 group-hover:ring-1 group-hover:ring-white/10" />
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}