import Hero from "@/components/store/Hero";
import Offers from "@/components/store/Offers";
import Categories from "@/components/store/Categories";
import BestSellers from "@/components/store/BestSellers";

export default function Home() {
  return (
    <div>
      <Hero />
      <Offers />
      <Categories />
      <BestSellers />
    </div>
  );
}
