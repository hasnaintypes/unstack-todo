import { createFileRoute } from "@tanstack/react-router";
import { HeroSection, Features, PricingSection, Testimonials, CTASection } from "@/features/marketing";

export const Route = createFileRoute("/_public/_marketing/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative min-h-screen bg-background">
      <HeroSection />
      <Features />
      <PricingSection />
      <Testimonials />
      <CTASection />
    </div>
  );
}
