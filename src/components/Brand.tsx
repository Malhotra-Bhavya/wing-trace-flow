import { Link } from "@tanstack/react-router";
import { Plane } from "lucide-react";
import type { ReactNode } from "react";

export function Brand({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-display font-bold ${className}`}>
      <span className="grid place-items-center w-9 h-9 rounded-lg bg-gradient-hero text-primary-foreground shadow-elegant">
        <Plane className="w-5 h-5 -rotate-45" />
      </span>
      <span className="text-lg tracking-tight">
        Multiwings <span className="text-primary">Logistics</span>
      </span>
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
