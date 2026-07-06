import { SemayotHeader } from "./semayot-header";
import { SemayotHero } from "./semayot-hero";
import { AboutSection } from "./about-section";
import { ExperienceSection } from "./experience-section";
import { BengkayangSection } from "./bengkayang-section";
import { SemayotTestimonials } from "./semayot-testimonials";
import { MenuInfoSection } from "./menu-info-section";
import { CtaFinalSection } from "./cta-final-section";
import { LocationSection } from "./location-section";
import { SemayotFooter } from "./semayot-footer";
import { WelcomeBanner } from "./welcome-banner";
import { ChatWidget } from "./chat-widget";

export function SemayotHomepage() {
  return (
    <div className="min-h-screen bg-[#FCF9F2] text-[#1C1917] font-sans antialiased selection:bg-[#FFC2D6] selection:text-[#FF4F79] overflow-x-hidden relative grain-overlay">
      <SemayotHeader />
      <main>
        <SemayotHero />
        <WelcomeBanner />

        <AboutSection />
        <MenuInfoSection />
        <ExperienceSection />
        <BengkayangSection />
        <CtaFinalSection />
        <LocationSection />
        <SemayotTestimonials />
      </main>
      <SemayotFooter />
      <ChatWidget />
    </div>
  );
}
export default SemayotHomepage;
