"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white overflow-hidden">
            <img src="/hg-logo.jpg" alt="HG Insights Logo" className="h-full w-full object-cover" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Phoenix Prep</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollTo("features")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Product
          </button>
          <button
            onClick={() => scrollTo("use-cases")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Use Cases
          </button>
          <button
            onClick={() => scrollTo("faq")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            FAQ
          </button>
        </div>

        <Link href="/chat">
          <Button variant="hero" size="default">
            Try It Now
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
