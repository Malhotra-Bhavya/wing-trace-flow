import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateAwb } from "@/lib/shipment-utils";
import { ArrowLeft, RotateCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/shipments/new")({
  head: () => ({ meta: [{ title: "New shipment — Multiwings" }] }),
  component: NewShipment,
});

function NewShipment() {
  const navigate = useNavigate();
  const [awb, setAwb] = useState(generateAwb());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const num = (k: string) => {
      const v = fd.get(k);
      return v === null || v === "" ? null : Number(v);
    };
    const str = (k: string) => (fd.get(k) as string) || null;
    const payload = {
      awb_number: awb,
      shipment_date: (fd.get("shipment_date") as string) || new Date().toISOString().slice(0, 10),
      shipper_name: str("shipper_name")!,
      shipper_address: str("shipper_address")!,
      shipper_city: str("shipper_city")!,
      consignee_name: str("consignee_name")!,
      consignee_address: str("consignee_address")!,
      consignee_city: str("consignee_city")!,
      handling_info: str("handling_info"),
      cargo_description: str("cargo_description"),
      length_cm: num("length_cm"),
      width_cm: num("width_cm"),
      height_cm: num("height_cm"),
      weight_kg: num("weight_kg"),
      said_to_contain: str("said_to_contain"),
      origin_airport: str("origin_airport")!,
      destination_airport: str("destination_airport")!,
      flight_number: str("flight_number"),
      airline: str("airline"),
      issuing_agent: str("issuing_agent"),
    };
    const { data, error } = await supabase.from("shipments").insert(payload).select("id").single();
    setSaving(false);
    if (error) { setError(error.message); return; }
    navigate({ to: "/shipments/$id", params: { id: data.id } });
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>
      <h1 className="font-display text-3xl font-bold tracking-tight">Create new Airway Bill</h1>
      <p className="text-muted-foreground mt-1">Issue a Multiwings AWB and add it to the tracking system.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-8">
        {/* AWB header */}
        <Section title="Airway Bill">
          <Field label="AWB Number">
            <div className="flex gap-2">
              <input value={awb} onChange={(e) => setAwb(e.target.value)} required className={inputCls + " font-mono"} />
              <button type="button" onClick={() => setAwb(generateAwb())} className="h-11 px-3 rounded-lg border hover:bg-accent inline-flex items-center gap-1 text-sm">
                <RotateCw className="w-3.5 h-3.5" /> Regenerate
              </button>
            </div>
          </Field>
          <Field label="Date">
            <input type="date" name="shipment_date" defaultValue={new Date().toISOString().slice(0,10)} className={inputCls} />
          </Field>
          <Field label="Issuing Agent">
            <input name="issuing_agent" placeholder="Agent name" className={inputCls} />
          </Field>
        </Section>

        <Section title="Shipper">
          <Field label="Name" required><input name="shipper_name" required className={inputCls} /></Field>
          <Field label="City" required><input name="shipper_city" required className={inputCls} /></Field>
          <Field label="Full address" required span2><textarea name="shipper_address" required rows={2} className={inputCls} /></Field>
        </Section>

        <Section title="Consignee">
          <Field label="Name" required><input name="consignee_name" required className={inputCls} /></Field>
          <Field label="City" required><input name="consignee_city" required className={inputCls} /></Field>
          <Field label="Full address" required span2><textarea name="consignee_address" required rows={2} className={inputCls} /></Field>
        </Section>

        <Section title="Routing">
          <Field label="Origin airport" required><input name="origin_airport" placeholder="e.g. DEL" required className={inputCls} /></Field>
          <Field label="Destination airport" required><input name="destination_airport" placeholder="e.g. JFK" required className={inputCls} /></Field>
          <Field label="Airline"><input name="airline" placeholder="e.g. Emirates" className={inputCls} /></Field>
          <Field label="Flight number"><input name="flight_number" placeholder="e.g. EK 502" className={inputCls} /></Field>
        </Section>

        <Section title="Cargo">
          <Field label="Cargo description" span2><textarea name="cargo_description" rows={2} className={inputCls} /></Field>
          <Field label="Said to contain" span2><textarea name="said_to_contain" rows={2} className={inputCls} /></Field>
          <Field label="Handling information" span2><textarea name="handling_info" rows={2} className={inputCls} /></Field>
          <Field label="Length (cm)"><input type="number" step="0.01" name="length_cm" className={inputCls} /></Field>
          <Field label="Width (cm)"><input type="number" step="0.01" name="width_cm" className={inputCls} /></Field>
          <Field label="Height (cm)"><input type="number" step="0.01" name="height_cm" className={inputCls} /></Field>
          <Field label="Weight (kg)"><input type="number" step="0.01" name="weight_kg" className={inputCls} /></Field>
        </Section>

        {error && <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">{error}</div>}

        <div className="flex justify-end gap-3">
          <Link to="/dashboard" className="h-11 px-5 inline-flex items-center rounded-lg border hover:bg-accent">Cancel</Link>
          <button disabled={saving} className="h-11 px-6 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 shadow-elegant">
            {saving ? "Saving…" : "Create shipment"}
          </button>
        </div>
      </form>
    </main>
  );
}

const inputCls = "w-full h-11 px-3 rounded-lg bg-background border focus:outline-none focus:ring-2 focus:ring-primary";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-xl shadow-card p-6">
      <h2 className="font-display text-lg font-semibold tracking-tight mb-4">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children, required, span2 }: { label: string; children: React.ReactNode; required?: boolean; span2?: boolean }) {
  return (
    <label className={`block ${span2 ? "sm:col-span-2" : ""}`}>
      <div className="text-sm font-medium mb-1">{label}{required && <span className="text-destructive"> *</span>}</div>
      {children}
    </label>
  );
}
