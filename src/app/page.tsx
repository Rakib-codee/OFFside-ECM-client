import Hero from "@/components/home/Hero";
import LiveMatchBanner from "@/components/home/LiveMatchBanner";
import CategoryExplorer from "@/components/home/CategoryExplorer";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CustomizerTeaser from "@/components/home/CustomizerTeaser";
import SocialProof from "@/components/home/SocialProof";
import Newsletter from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <main>
      <LiveMatchBanner />
      <Hero />
      <CategoryExplorer />
      <FeaturedProducts />
      <CustomizerTeaser />
      <SocialProof />
      <Newsletter />
    </main>
  );
}
