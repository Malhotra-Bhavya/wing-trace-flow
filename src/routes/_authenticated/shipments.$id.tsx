import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { STATUSES, statusIndex, formatDateTime } from "@/lib/shipment-utils";
import { StatusBadge } from "./dashboard";
import { ArrowLeft, Printer, Trash2, Check, Circle, Plane } from "lucide-react";

type Shipment = {
  id: string;
  awb_number: string;
  shipment_date: string;
  shipper_name: string; shipper_address: string; shipper_city: string;
  consignee_name: string; consignee_address: string; consignee_city: string;
  handling_info: string | null;
  cargo_description: string | null;
  length_cm: number | null; width_cm: number | null; height_cm: number | null; weight_kg: number | null;
  said_to_contain: string | null;
  origin_airport: string; destination_airport: string;
  flight_number: string | null; airline: string | null;
  issuing_agent: string | null;
  current_status: string;
  updated_at: string;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/shipments/$id")({
  head: () => ({ meta: [{ title: "Shipment — Multiwings" }] }),
  component: ShipmentDetail,
});

function ShipmentDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("shipments").select("*").eq("id", id).maybeSingle();
    setData(data as Shipment | null);
    setLoading(false);
  }

  async function updateStatus(next: string) {
    if (!data) return;
    setSavingStatus(true);
    const { error } = await supabase.from("shipments").update({ current_status: next as never }).eq("id", data.id);
    setSavingStatus(false);
    if (!error) await load();
  }

  async function remove() {
    if (!data) return;
    if (!confirm(`Delete AWB ${data.awb_number}? This cannot be undone.`)) return;
    const { error } = await supabase.from("shipments").delete().eq("id", data.id);
    if (!error) navigate({ to: "/dashboard" });
  }

  if (loading) return <main className="max-w-5xl mx-auto px-6 py-10 text-muted-foreground">Loading…</main>;
  if (!data) return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
      <div className="mt-6">Shipment not found.</div>
    </main>
  );

  const currentIdx = statusIndex(data.current_status);

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="no-print">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <div className="mt-4 flex flex-wrap justify-between items-end gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">AWB</div>
            <h1 className="font-display text-3xl font-bold tracking-tight font-mono">{data.awb_number}</h1>
            <div className="mt-2"><StatusBadge status={data.current_status} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="h-10 px-4 inline-flex items-center gap-1.5 rounded-lg border hover:bg-accent">
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            <button onClick={remove} className="h-10 px-4 inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        {/* Status updater + timeline */}
        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <div className="bg-card border rounded-xl p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold">Update status</h3>
            <p className="text-sm text-muted-foreground mt-1">Set the current shipment milestone. Customers see this immediately.</p>
            <div className="mt-4 flex gap-2">
              <select
                value={data.current_status}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={savingStatus}
                className="flex-1 h-11 px-3 rounded-lg bg-background border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Last updated {formatDateTime(data.updated_at)}</div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold mb-4">Timeline</h3>
            <ol className="relative">
              {STATUSES.map((s, i) => {
                const done = i < currentIdx;
                const active = i === currentIdx;
                return (
                  <li key={s} className="flex gap-3 pb-3 last:pb-0 relative">
                    {i < STATUSES.length - 1 && <span className={`absolute left-[11px] top-6 bottom-0 w-px ${done ? "bg-primary" : "bg-border"}`} />}
                    <span className={`relative z-10 grid place-items-center w-6 h-6 rounded-full shrink-0 ${
                      done ? "bg-primary text-primary-foreground" : active ? "bg-primary/15 text-primary ring-2 ring-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {done ? <Check className="w-3 h-3" /> : <Circle className={`w-2 h-2 ${active ? "fill-primary" : ""}`} />}
                    </span>
                    <span className={`text-sm ${active ? "text-primary font-medium" : done ? "" : "text-muted-foreground"}`}>{s}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>

      {/* Print-friendly Airway Bill document */}
      <div className="print-page mt-8 bg-white text-black rounded-xl border shadow-card overflow-hidden">
        <AirwayBillDocument data={data} />
      </div>
    </main>
  );
}

function AirwayBillDocument({ data }: { data: Shipment }) {
  const Row = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div className="border border-black/30 p-2 min-h-[3.2rem]">
      <div className="text-[10px] uppercase tracking-wider text-black/60">{label}</div>
      <div className="text-sm font-medium">{value || "—"}</div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 text-black" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-12 h-12 rounded-md bg-[#1e3a8a] text-white">
            <Plane className="w-6 h-6 -rotate-45" />
          </span>
          <div>
            <div className="text-2xl font-bold tracking-tight">MULTIWINGS LOGISTICS</div>
            <div className="text-xs text-black/60">Air Waybill — Non-Negotiable</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-black/60">AWB No.</div>
          <div className="text-xl font-bold font-mono">{data.awb_number}</div>
          <div className="text-xs text-black/60 mt-1">Date: {new Date(data.shipment_date).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Shipper / Consignee */}
      <div className="grid grid-cols-2 gap-0 mt-4">
        <div className="border border-black/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-black/60">Shipper's Name and Address</div>
          <div className="text-sm font-semibold mt-1">{data.shipper_name}</div>
          <div className="text-sm whitespace-pre-line">{data.shipper_address}</div>
          <div className="text-sm">{data.shipper_city}</div>
        </div>
        <div className="border border-black/30 border-l-0 p-3">
          <div className="text-[10px] uppercase tracking-wider text-black/60">Consignee's Name and Address</div>
          <div className="text-sm font-semibold mt-1">{data.consignee_name}</div>
          <div className="text-sm whitespace-pre-line">{data.consignee_address}</div>
          <div className="text-sm">{data.consignee_city}</div>
        </div>
      </div>

      {/* Issuing agent */}
      <div className="grid grid-cols-2 gap-0">
        <Row label="Issuing Carrier's Agent Name" value={data.issuing_agent} />
        <Row label="Airline / Carrier" value={data.airline} />
      </div>

      {/* Routing */}
      <div className="grid grid-cols-4 gap-0">
        <Row label="Airport of Departure" value={data.origin_airport} />
        <Row label="Airport of Destination" value={data.destination_airport} />
        <Row label="Flight Number" value={data.flight_number} />
        <Row label="Current Status" value={data.current_status} />
      </div>

      {/* Handling */}
      <div className="grid grid-cols-1">
        <Row label="Handling Information" value={data.handling_info} />
      </div>

      {/* Cargo body */}
      <div className="border border-black/30 mt-0">
        <div className="grid grid-cols-12 text-[10px] uppercase tracking-wider text-black/60 border-b border-black/30 bg-black/[0.04]">
          <div className="col-span-2 p-2 border-r border-black/30">Pieces</div>
          <div className="col-span-3 p-2 border-r border-black/30">Gross Weight (kg)</div>
          <div className="col-span-3 p-2 border-r border-black/30">Dimensions (L × W × H cm)</div>
          <div className="col-span-4 p-2">Nature and Quantity of Goods</div>
        </div>
        <div className="grid grid-cols-12 text-sm min-h-[5rem]">
          <div className="col-span-2 p-2 border-r border-black/30">1</div>
          <div className="col-span-3 p-2 border-r border-black/30">{data.weight_kg ?? "—"}</div>
          <div className="col-span-3 p-2 border-r border-black/30">
            {[data.length_cm, data.width_cm, data.height_cm].some((v) => v != null)
              ? `${data.length_cm ?? "—"} × ${data.width_cm ?? "—"} × ${data.height_cm ?? "—"}`
              : "—"}
          </div>
          <div className="col-span-4 p-2 whitespace-pre-line">{data.cargo_description || "—"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1">
        <Row label='Said to Contain' value={data.said_to_contain} />
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-0 mt-6">
        <div className="border-t border-black p-3 text-xs">
          <div>Signature of Shipper or his Agent</div>
        </div>
        <div className="border-t border-black p-3 text-xs text-right">
          <div>For Carrier: Multiwings Logistics</div>
        </div>
      </div>

      <div className="mt-4 text-[10px] text-black/50 text-center">
        This Air Waybill is generated electronically by Multiwings Logistics and is valid without manual signature.
      </div>
    </div>
  );
}
