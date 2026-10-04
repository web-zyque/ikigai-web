import Image from "next/image";
import Link from "next/link";

const categories = [
  { name: "Brakes", image: "/images/category_brakes.jpg", count: 12 },
  { name: "Suspension", image: "/images/category_suspension.jpg", count: 8 },
  { name: "Engine", image: "/images/category_engine.jpg", count: 4 },
  { name: "Tires", image: "/images/category_tires.jpg", count: 15 },
];

export default function Categories() {
  return (
    <section className="bg-black text-white py-12 lg:h-[50vh] flex flex-col justify-center">
      <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Categories</h2>
          <Link href="/categories" className="shrink-0 text-sm font-semibold text-[#640C0C] transition-opacity hover:opacity-80">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:gap-12">
          {categories.map((category) => (
            <Link 
              key={category.name} 
              href={`/category/${category.name.toLowerCase()}`}
              className="group flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-2"
            >
              <div className="relative mb-4 h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 20vw"
                  className="object-contain mix-blend-screen transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="text-base font-semibold">{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
