import Hero from "@/components/store/Hero";
import Offers from "@/components/store/Offers";
import Categories from "@/components/store/Categories";
import BestSellers from "@/components/store/BestSellers";
import Footer from "@/components/store/Footer";
import FAQ from "@/components/store/FAQ";

export default function Home() {
  return (
    <div>
      <Hero />
      <Offers />
      <Categories />
      <BestSellers />
      <FAQ />
      <Footer />
    </div>
  );
}
