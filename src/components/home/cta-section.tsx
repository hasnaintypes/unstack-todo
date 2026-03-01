import { Link } from "@tanstack/react-router";

const CTASection = () => {
  return (
    <div className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground">
          Ready to get started?
        </h2>
        <p className="text-lg text-muted-foreground">
          Join thousands of users who've already made the switch.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth/sign-up">
            <button className="px-8 py-4 bg-primary text-primary-foreground hover:brightness-110 rounded-full font-semibold text-base transition-all duration-200 active:scale-[0.98]">
              Get Started
            </button>
          </Link>
          <Link to="/about">
            <button className="px-8 py-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border rounded-full font-semibold text-base transition-all duration-200 active:scale-[0.98]">
              Learn More
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
