"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, MessageSquare, Lightbulb, CheckCircle } from "lucide-react";

const Hero = () => {
  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-32 pb-12 overflow-hidden">
      {/* Background glow */}
      <div className="hero-glow absolute inset-0 pointer-events-none" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              Ace your calls with our intelligence
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Walk into every call{" "}
              <span className="gradient-text">already prepared.</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              Show up sharp, responsive, and confident.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/chat">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Phoenix Awaits
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="heroOutline"
                size="xl"
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto"
              >
                See how it works
              </Button>
            </div>
          </div>

          {/* Right preview card */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="animate-float">
              <div className="card-teal rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                      <img
                        src="/snowflake.png"
                        alt="Snowflake logo"
                        className="h-7 w-7 object-contain"
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold">Pre-Sales Battlecard</h3>
                      <p className="text-sm text-muted-foreground">Snowflake • Enterprise</p>
                    </div>
                  </div>
                  <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full">Live</span>
                </div>

                <div className="space-y-4">
                  <BriefSection
                    icon={<Sparkles className="h-4 w-4" />}
                    title="Tech Stack Signals"
                    items={["GitHub", "Jenkins CI/CD", "Kubernetes"]}
                  />
                  <BriefSection
                    icon={<Lightbulb className="h-4 w-4" />}
                    title="Likely Initiatives"
                    items={["Platform security hardening", "Developer velocity (shift-left security)"]}
                  />
                  <BriefSection
                    icon={<MessageSquare className="h-4 w-4" />}
                    title="Discovery Questions"
                    items={["Where do secrets leak most today — PRs, CI, or K8s?"]}
                  />
                  <BriefSection
                    icon={<Target className="h-4 w-4" />}
                    title="Wedge Angles"
                    items={["Pre-commit secret prevention", "Kubernetes + NHI sprawl control"]}
                  />
                  <BriefSection
                    icon={<CheckCircle className="h-4 w-4" />}
                    title="Next Steps"
                    items={["Book Security + Platform Eng Technical Dive"]}
                  />
                </div>
              </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
};

const BriefSection = ({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <span className="text-primary">{icon}</span>
      {title}
    </div>
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className="text-xs bg-secondary/50 text-foreground px-2.5 py-1 rounded-lg border border-border/50"
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

export default Hero;
