"use client"

import React from "react";

const SocialProof = () => {
  return (
    <section className="py-8 border-y border-border/10 bg-secondary/5 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 font-semibold animate-in fade-in duration-700">
            Powered by :
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 group">
            <div className="bg-white/95 rounded-xl p-3 shadow-lg shadow-teal-500/5 hover:shadow-teal-500/10 hover:scale-105 transition-all duration-500 border border-white/20">
              <img
                src="/HG-Insights-Logo.webp"
                alt="HG Insights Official Logo"
                className="h-10 sm:h-20 w-auto object-contain"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 opacity-50">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-border/50" />
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/30 px-3 py-1 rounded-full border border-border/20">
                Sales Representatives
              </span>
            </div>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-border/50" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
