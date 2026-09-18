// src/pages/Landing.jsx
import HeroSection from "../features/landing/components/HeroSection";
import TrustBar from "../features/landing/components/TrustBar";
import ModulesBento from "../features/landing/components/ModulesBento";
import CampusPreviewSection from "../features/landing/components/CampusPreviewSection";
import CTASection from "../features/landing/components/CTASection";

export default function Landing() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <ModulesBento />
      <CampusPreviewSection />
      <CTASection />
    </>
  );
}