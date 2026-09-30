import Hero from "@/components/store/Hero";
import Categories from "@/components/store/Categories";
import BestSellers from "@/components/store/BestSellers";
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
