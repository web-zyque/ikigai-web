import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import BestSellers from "@/components/BestSellers";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Hero />
      <Categories />
      <BestSellers />
    </div>
  );
}
