"use client";

import Image from "next/image";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 overflow-hidden">
              <Image
                src="/hg-logo.jpg"
                alt="HG Insights"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="font-semibold">Phoenix Prep</span>
          </div>

          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Phoenix Prep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
