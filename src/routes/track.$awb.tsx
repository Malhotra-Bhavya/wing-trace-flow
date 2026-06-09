import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PublicHeader } from "@/components/Brand";
import { STATUSES, statusIndex, formatDateTime } from "@/lib/shipment-utils";
import { Check, Circle, MapPin, Package, ArrowLeft, Search } from "lucide-react";

type Shipment = {
  awb_number: string;
  shipper_name: string;
  shipper_city: string;
  consignee_name: string;
  consignee_city: string;
  origin_airport: string;
  destination_airport: string;
  current_status: string;
  updated_at: string;
};

export const Route = createFileRoute("/track/$awb")({
  head: ({ params }) => ({
    meta: [
      { title: `Track ${params.awb} — Multiwings Logistics` },
      { name: "description", content: `Live status for AWB ${params.awb}.` },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { awb } = Route.useParams();
  const router = useRouter();
  const [data, setData] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [searchValue, setSearchValue] = useState(awb);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    supabase
      .from("shipments")
      .select("awb_number,shipper_name,shipper_city,consignee_name,consignee_city,origin_airport,destination_airport,current_status,updated_at")
      .eq("awb_number", awb)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) setNotFound(true);
        else setData(data as Shipment);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [awb]);

  const currentIdx = data ? statusIndex(data.current_status) : -1;

  return (
    <div className="min-h-screen bg-gradient-soft">
      <PublicHeader />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to tracking
        </Link>

        {/* Mini search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = searchValue.trim();
            if (v && v !== awb) router.navigate({ to: "/track/$awb", params: { awb: v } });
          }}
          className="mb-8 flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg bg-card border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter AWB number"
            />
          </div>
          <button className="h-11 px-5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90">Track</button>
        </form>

        {loading && <div className="text-muted-foreground">Loading shipment…</div>}

        {!loading && notFound && (
          <div className="bg-card rounded-2xl p-10 text-center shadow-card border">
            <Package className="mx-auto w-10 h-10 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No shipment found</h2>
            <p className="mt-1 text-muted-foreground">We couldn't find an AWB matching <span className="font-mono text-foreground">{awb}</span>.</p>
          </div>
        )}

        {!loading && data && (
          <>
            {/* Header card */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AWB Number</div>
                  <div className="font-display font-bold text-2xl md:text-3xl tracking-tight mt-1">{data.awb_number}</div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium ring-1 ring-primary/20">
                  <Circle className="w-2 h-2 fill-primary" /> {data.current_status}
                </span>
              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider font-medium text-muted-foreground mb-2">Shipper</div>
                  <div className="font-semibold">{data.shipper_name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {data.shipper_city} · {data.origin_airport}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-medium text-muted-foreground mb-2">Consignee</div>
                  <div className="font-semibold">{data.consignee_name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {data.consignee_city} · {data.destination_airport}
                  </div>
                </div>
              </div>

              <div className="mt-6 text-xs text-muted-foreground">
                Last updated {formatDateTime(data.updated_at)}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border mt-6">
              <h3 className="font-display text-lg font-semibold mb-6">Shipment timeline</h3>
              <ol className="relative">
                {STATUSES.map((s, i) => {
                  const done = i < currentIdx;
                  const active = i === currentIdx;
                  return (
                    <li key={s} className="flex gap-4 pb-6 last:pb-0 relative">
                      {i < STATUSES.length - 1 && (
                        <span className={`absolute left-[15px] top-8 bottom-0 w-px ${done ? "bg-primary" : "bg-border"}`} />
                      )}
                      <span
                        className={`relative z-10 mt-0.5 grid place-items-center w-8 h-8 rounded-full shrink-0 ${
                          done
                            ? "bg-primary text-primary-foreground"
                            : active
                            ? "bg-primary/15 text-primary ring-2 ring-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {done ? <Check className="w-4 h-4" /> : <Circle className={`w-2.5 h-2.5 ${active ? "fill-primary" : ""}`} />}
                      </span>
                      <div className="flex-1 pt-0.5">
                        <div className={`font-medium ${active ? "text-primary" : done ? "" : "text-muted-foreground"}`}>{s}</div>
                        {active && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Updated {formatDateTime(data.updated_at)}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
