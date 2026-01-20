"use client"

import { Search } from "lucide-react";

const UseCases = () => {
  return (
    <section id="use-cases" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ace your{" "}
            <span className="gradient-text">sales calls</span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Content card */}
          <div className="card-teal rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/15 mb-6">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Pre-Call Research</h3>
            <p className="text-primary text-sm mb-4">Before every meeting</p>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Walk into discovery calls with rich context about the prospect's tech stack,
              recent initiatives, and potential pain points. Never ask basic questions you
              should already know.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCases;
