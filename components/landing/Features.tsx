"use client"

import { Building2, Cpu, Target, MessageCircle, Swords, Share2 } from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Account Snapshot",
    description: "Get a complete view of any account in seconds with key company details and context.",
  },
  {
    icon: Cpu,
    title: "Tech Stack Signals",
    description: "Understand what technologies they use and where your solution fits.",
  },
  {
    icon: Target,
    title: "Intent → Talking Points",
    description: "Turn buying signals into compelling conversation starters.",
  },
  {
    icon: MessageCircle,
    title: "Discovery Questions",
    description: "Smart questions tailored to the account that uncover real pain points.",
  },
  {
    icon: Swords,
    title: "Battlecard Angles",
    description: "Competitive positioning and displacement strategies at your fingertips.",
  },
  {
    icon: Share2,
    title: "Downloadable Brief",
    description: "Download and review prep briefs before any call.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need to{" "}
            <span className="gradient-text">prep like a pro</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Stop scrambling before calls. Phoenix Prep gives you structured intelligence that makes you sound like you've been on the account for months.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
  index: number;
}) => (
  <div
    className="group card-teal rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="mb-4 h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center transition-colors group-hover:bg-primary/25">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

export default Features;
