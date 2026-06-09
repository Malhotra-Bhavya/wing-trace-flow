import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PublicHeader } from "@/components/Brand";
import { Search, ShieldCheck, Plane, Globe2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Multiwings Logistics — Track your shipment" },
      { name: "description", content: "Track your air cargo shipment with Multiwings Logistics. Enter your AWB number for real-time status updates." },
      { property: "og:title", content: "Multiwings Logistics — Track your shipment" },
      { property: "og:description", content: "Real-time air cargo tracking by AWB number." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [awb, setAwb] = useState("");
  const navigate = useNavigate();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const v = awb.trim();
    if (!v) return;
    navigate({ to: "/track/$awb", params: { awb: v } });
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-[0.97]" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px, 64px 64px",
          }} />
          <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
            <div className="max-w-2xl text-primary-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium ring-1 ring-white/20">
                <Plane className="w-3.5 h-3.5" /> Global air cargo tracking
              </span>
              <h1 className="mt-5 text-4xl md:text-6xl font-bold leading-[1.05]">
                Track your shipment, anywhere in the world.
              </h1>
              <p className="mt-5 text-lg text-primary-foreground/85 max-w-xl">
                Enter your Airway Bill (AWB) number below to view the latest status of your cargo across our global network.
              </p>

              <form onSubmit={onSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    value={awb}
                    onChange={(e) => setAwb(e.target.value)}
                    placeholder="e.g. 297-12345678"
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-white text-foreground placeholder:text-muted-foreground shadow-elegant ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-primary-glow text-base"
                    aria-label="AWB number"
                  />
                </div>
                <button
                  type="submit"
                  className="h-14 px-7 rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/90 transition-colors shadow-elegant"
                >
                  Track shipment
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
          {[
            { icon: Globe2, title: "Worldwide reach", text: "Active routes across 60+ destinations on six continents." },
            { icon: ShieldCheck, title: "Trusted handling", text: "IATA-compliant procedures from pickup to final delivery." },
            { icon: Plane, title: "Real-time status", text: "Every milestone logged from booking to delivery." },
          ].map((f) => (
            <div key={f.title} className="bg-card rounded-2xl p-6 shadow-card border">
              <f.icon className="w-6 h-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t mt-8">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-muted-foreground flex justify-between flex-wrap gap-3">
          <span>© {new Date().getFullYear()} Multiwings Logistics</span>
          <span>Air cargo · Freight forwarding · Customs</span>
        </div>
      </footer>
    </div>
  );
}
