"use client"

import { useState } from "react";
import { Search, Swords, Map, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const useCases = [
  {
    id: "research",
    icon: Search,
    title: "Prospect Research",
    description: "Before a first call",
    content: "Walk into discovery calls with rich context about the prospect's tech stack, recent initiatives, and potential pain points. Never ask basic questions you should already know.",
  },
  {
    id: "competitive",
    icon: Swords,
    title: "Competitive Displacement",
    description: "Identify opportunities",
    content: "Spot accounts using competitor solutions and get targeted talking points for displacement conversations. Understand their likely frustrations and how to position against them.",
  },
  {
    id: "territory",
    icon: Map,
    title: "Territory Prioritization",
    description: "Focus your efforts",
    content: "Quickly assess and rank accounts in your territory based on fit signals, tech stack alignment, and timing indicators. Spend time where it counts.",
  },
  {
    id: "expansion",
    icon: TrendingUp,
    title: "QBR & Expansion",
    description: "Grow existing accounts",
    content: "Prepare for quarterly business reviews with expansion angles, cross-sell opportunities, and value realization stories tailored to each account.",
  },
];

const UseCases = () => {
  const [activeCase, setActiveCase] = useState(useCases[0].id);
  const active = useCases.find((uc) => uc.id === activeCase)!;

  return (
    <section id="use-cases" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Built for real{" "}
            <span className="gradient-text">sales workflows</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Whether you're prospecting, competing, or expanding — Phoenix has you covered.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Tab buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {useCases.map((uc) => {
              const Icon = uc.icon;
              return (
                <button
                  key={uc.id}
                  onClick={() => setActiveCase(uc.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                    activeCase === uc.id
                      ? "bg-cta text-cta-foreground shadow-lg shadow-cta/25"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {uc.title}
                </button>
              );
            })}
          </div>

          {/* Content card */}
          <div className="card-teal rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/15 mb-6">
              <active.icon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{active.title}</h3>
            <p className="text-primary text-sm mb-4">{active.description}</p>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {active.content}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCases;
