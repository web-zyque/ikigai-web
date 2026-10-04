import Image from "next/image";
import Link from "next/link";


const SECTION_TITLE = "Latest Drops & Deals";

const offerPosters = [
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
];

const badgeColors: Record<string, string> = {
  Sale: "bg-[#640C0C]",
  New:  "bg-cyan-950",
  Hot:  "bg-red-700",
};

export default function Offers() {
  return (
    <section className="bg-black text-white py-12">
      <div className="mx-auto w-full max-w-350 px-6 lg:px-12">

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block h-1 w-6 rounded-full bg-[#640C0C]" />
            <span className="text-[10px] sm:text-xs lg:text-sm font-semibold uppercase tracking-widest text-[#640C0C]">
              Limited Time
            </span>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {SECTION_TITLE}
            </h2>
            <Link
              href="/offers"
              className="shrink-0 text-xs sm:text-sm lg:text-sm font-semibold text-[#640C0C] transition-opacity hover:opacity-80"
            >
              View All →
            </Link>
          </div>
        </div>


        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 lg:gap-5">
          {offerPosters.map((poster) => (
            <Link
              key={poster.id}
              href={poster.href}
              className="group relative block w-full aspect-3/3 rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/70"
            >
              <Image
                src={poster.image}
                alt={poster.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-contain mix-blend-screen transition-transform duration-500 group-hover:scale-105 p-4"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

              <span
                className={`absolute top-3 left-3 ${badgeColors[poster.badge] ?? "bg-[#640C0C]"} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full text-white shadow`}
              >
                {poster.badge}
              </span>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-[13px] font-semibold text-white leading-snug line-clamp-2 drop-shadow">
                  {poster.title}
                </p>
              </div>

              <div className="absolute inset-0 rounded-2xl ring-0 ring-white/0 transition-all duration-300 group-hover:ring-1 group-hover:ring-white/15 pointer-events-none" />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}