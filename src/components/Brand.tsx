import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logoAsset from "@/assets/multiwings-logo.png.asset.json";

export function Brand({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center ${className}`} aria-label="Multiwings Logistics — Home">
      <img
        src={logoAsset.url}
        alt="Multiwings Logistics Private Limited"
        className="h-10 w-auto md:h-11 object-contain"
        loading="eager"
        decoding="async"
      />
    </Link>
  );
}

export function PublicHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Brand />
        <div className="flex items-center gap-3 text-sm">
          {right}
          <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
            Staff login
          </Link>
        </div>
      </div>
    </header>
  );
}
