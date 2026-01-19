"use client"

import { Building, MessageSquare, FileCheck } from "lucide-react";

const steps = [
  {
    icon: Building,
    step: "01",
    title: "Pick an account",
    description: "Enter the company name or domain you're preparing for.",
  },
  {
    icon: MessageSquare,
    step: "02",
    title: "Ask what you need",
    description: "Tell Phoenix what context you need — tech stack, pain points, competitive angles, or discovery questions.",
  },
  {
    icon: FileCheck,
    step: "03",
    title: "Get a brief you can use",
    description: "Receive a structured prep brief ready to use in your next call.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="absolute inset-0 section-fade pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            From zero to{" "}
            <span className="gradient-text">call-ready</span> in minutes
          </h2>
          <p className="text-muted-foreground text-lg">
            Three simple steps to transform your prep workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <StepCard key={i} {...step} isLast={i === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
};

const StepCard = ({
  icon: Icon,
  step,
  title,
  description,
  isLast,
}: {
  icon: typeof Building;
  step: string;
  title: string;
  description: string;
  isLast: boolean;
}) => (
  <div className="relative">
    <div className="card-teal rounded-2xl p-8 text-center h-full transition-all duration-300 hover:-translate-y-1">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/15 mb-6">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <div className="text-xs font-bold text-primary mb-2 tracking-widest">{step}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
    
    {/* Connector line */}
    {!isLast && (
      <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-border/50" />
    )}
  </div>
);

export default HowItWorks;
