interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  period: string;
  badge: {
    text: string;
    color: "emerald" | "primary";
  };
  buttonText: string;
  buttonColor: "emerald" | "primary";
  features: string[];
}

const PricingCard = ({
  title,
  description,
  price,
  period,
  badge,
  buttonText,
  buttonColor,
  features,
}: PricingCardProps) => {
  return (
    <div className="bg-card border border-border rounded-4xl p-8 md:p-10 flex flex-col w-full h-full shadow-lg">
      <h3 className="text-2xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6 min-h-10">{description}</p>

      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-5xl font-bold tracking-tight text-foreground">{price}</span>
        <span className="text-xl text-muted-foreground font-medium">{period}</span>
      </div>

      <div
        className={`flex items-center gap-2 text-sm font-medium mb-8 ${
          badge.color === "emerald" ? "text-emerald-500" : "text-primary"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            badge.color === "emerald" ? "bg-emerald-500" : "bg-primary"
          }`}
        ></span>
        {badge.text}
      </div>

      <button
        className={`w-full ${
          buttonColor === "emerald"
            ? "bg-emerald-600 hover:bg-emerald-500"
            : "bg-primary hover:brightness-110"
        } text-${
          buttonColor === "emerald" ? "white" : "primary-foreground"
        } py-4 rounded-full font-semibold text-base transition-all duration-200 active:scale-[0.98] mb-4 cursor-pointer`}
      >
        {buttonText}
      </button>

      <p className="text-center text-sm text-muted-foreground mb-10">
        Or{" "}
        <a
          href="#"
          className="text-foreground border-b border-border pb-0.5 hover:text-primary transition-colors cursor-pointer"
        >
          get in touch
        </a>{" "}
        to learn more
      </p>

      <ul className="space-y-4 mt-auto">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="shrink-0 w-4 h-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

const PricingSection = () => {
  const pricingPlans = [
    {
      title: "Free",
      description: "Perfect for individuals getting started with task management.",
      price: "$0",
      period: "forever",
      badge: {
        text: "Always free",
        color: "emerald" as const,
      },
      buttonText: "Get started",
      buttonColor: "emerald" as const,
      features: [
        "Up to 50 tasks per month",
        "Basic task organization",
        "Mobile & desktop access",
        "Dark/light theme support",
      ],
    },
    {
      title: "Pro",
      description: "For power users who need unlimited tasks and advanced features.",
      price: "$5",
      period: "/month",
      badge: {
        text: "Limited time offer",
        color: "primary" as const,
      },
      buttonText: "Get started",
      buttonColor: "primary" as const,
      features: [
        "Unlimited tasks & projects",
        "AI-powered task generation",
        "Priority support & updates",
        "Advanced analytics dashboard",
      ],
    },
  ];

  return (
    <section className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans">
      {/* Header */}
      <div className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-sm font-medium text-primary">Pricing</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground">
          Simple flexible plans
          <br />
          for every needs
        </h2>
      </div>

      {/* Cards Container */}
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-212.5">
        {pricingPlans.map((plan) => (
          <PricingCard key={plan.title} {...plan} />
        ))}
      </div>
    </section>
  );
};

export default PricingSection;
