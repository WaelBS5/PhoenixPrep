"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/15 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="card-teal rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/15 mb-6">
            <Flame className="h-8 w-8 text-primary" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Ready to prep{" "}
            <span className="gradient-text">like a pro?</span>
          </h2>
          
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Stop scrambling before calls. Try Phoenix Prep now and see how prepared you can be.
          </p>

          <Link href="/chat">
            <Button variant="hero" size="xl">
              Try the demo now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
