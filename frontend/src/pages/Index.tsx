import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import PromoBanner from "@/components/PromoBanner";
import TestimonialSection from "@/components/TestimonialSection";
import Footer from "@/components/Footer";
import PromoOfferPopup from "@/components/PromoOfferPopup";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <PromoBanner />
      <TestimonialSection />
      <Footer />
      <PromoOfferPopup />
    </div>
  );
};

export default Index;
