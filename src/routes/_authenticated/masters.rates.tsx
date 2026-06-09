import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Airline = { id: string; name: string };
type Agent = { id: string; name: string };
type Rate = {
  id: string;
  airline_id: string | null;
  agent_id: string | null;
  per_kg_rate: number;
  min_charge: number;
  fuel_surcharge_pct: number;
  security_per_kg: number;
  handling_flat: number;
  documentation_flat: number;
  notes: string | null;
};

export const Route = createFileRoute("/_authenticated/masters/rates")({
  head: () => ({ meta: [{ title: "Rates & Charges — Multiwings" }] }),
  component: RatesPage,
});

const empty = (): Partial<Rate> => ({
  airline_id: null, agent_id: null,
  per_kg_rate: 0, min_charge: 0, fuel_surcharge_pct: 0, security_per_kg: 0, handling_flat: 0, documentation_flat: 0, notes: "",
});

function RatesPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [editing, setEditing] = useState<Partial<Rate> | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [r, a, g] = await Promise.all([
      supabase.from("rate_cards").select("*").order("created_at", { ascending: false }),
      supabase.from("airlines").select("id,name").order("name"),
      supabase.from("agents").select("id,name").order("name"),
    ]);
    setRates((r.data as Rate[]) ?? []);
    setAirlines((a.data as Airline[]) ?? []);
    setAgents((g.data as Agent[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    const payload = {
      airline_id: editing.airline_id || null,
      agent_id: editing.agent_id || null,
      per_kg_rate: Number(editing.per_kg_rate || 0),
      min_charge: Number(editing.min_charge || 0),
      fuel_surcharge_pct: Number(editing.fuel_surcharge_pct || 0),
      security_per_kg: Number(editing.security_per_kg || 0),
      handling_flat: Number(editing.handling_flat || 0),
      documentation_flat: Number(editing.documentation_flat || 0),
      notes: editing.notes || null,
    };
    const { error } = editing.id
      ? await supabase.from("rate_cards").update(payload).eq("id", editing.id)
      : await supabase.from("rate_cards").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete rate card?")) return;
    const { error } = await supabase.from("rate_cards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  const airlineName = (id: string | null) => airlines.find((a) => a.id === id)?.name ?? "—";
  const agentName = (id: string | null) => agents.find((a) => a.id === id)?.name ?? "—";

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Rates &amp; Charges</h1>
          <p className="text-muted-foreground mt-1">Airline and agent-specific freight rates auto-populated into invoices.</p>
        </div>
        <button onClick={() => setEditing(empty())} className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-elegant">
          <Plus className="w-4 h-4" /> Add rate
        </button>
      </div>

      <div className="mt-6 bg-card border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Airline</th>
                <th className="px-4 py-3 font-medium">Agent</th>
                <th className="px-4 py-3 font-medium">Per kg</th>
                <th className="px-4 py-3 font-medium">Min</th>
                <th className="px-4 py-3 font-medium">Fuel %</th>
                <th className="px-4 py-3 font-medium">Security/kg</th>
                <th className="px-4 py-3 font-medium">Handling</th>
                <th className="px-4 py-3 font-medium">Doc</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && rates.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">No rate cards yet.</td></tr>}
              {rates.map((r) => (
                <tr key={r.id} className="border-t hover:bg-accent/40">
                  <td className="px-4 py-3">{airlineName(r.airline_id)}</td>
                  <td className="px-4 py-3">{agentName(r.agent_id)}</td>
                  <td className="px-4 py-3">{r.per_kg_rate}</td>
                  <td className="px-4 py-3">{r.min_charge}</td>
                  <td className="px-4 py-3">{r.fuel_surcharge_pct}%</td>
                  <td className="px-4 py-3">{r.security_per_kg}</td>
                  <td className="px-4 py-3">{r.handling_flat}</td>
                  <td className="px-4 py-3">{r.documentation_flat}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(r)} className="inline-flex items-center gap-1 text-primary hover:underline mr-3"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={() => remove(r.id)} className="inline-flex items-center gap-1 text-destructive hover:underline"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-foreground/30" onClick={() => setEditing(null)}>
          <div className="w-full max-w-lg bg-card h-full overflow-y-auto shadow-elegant p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-bold">{editing.id ? "Edit" : "New"} rate card</h2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Airline</label>
                <select value={editing.airline_id ?? ""} onChange={(e) => setEditing({ ...editing, airline_id: e.target.value || null })} className="w-full h-10 px-3 rounded-md bg-background border">
                  <option value="">— Any —</option>
                  {airlines.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Agent (optional)</label>
                <select value={editing.agent_id ?? ""} onChange={(e) => setEditing({ ...editing, agent_id: e.target.value || null })} className="w-full h-10 px-3 rounded-md bg-background border">
                  <option value="">— Any —</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              {[
                ["per_kg_rate", "Per-kg rate (₹)"],
                ["min_charge", "Minimum charge (₹)"],
                ["fuel_surcharge_pct", "Fuel surcharge %"],
                ["security_per_kg", "Security per kg (₹)"],
                ["handling_flat", "Handling (flat ₹)"],
                ["documentation_flat", "Documentation (flat ₹)"],
              ].map(([k, label]) => (
                <div key={k}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <input type="number" step="0.01" value={String((editing as Record<string, unknown>)[k] ?? 0)} onChange={(e) => setEditing({ ...editing, [k]: Number(e.target.value) })} className="w-full h-10 px-3 rounded-md bg-background border" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-md bg-background border" />
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 h-10 rounded-md border hover:bg-accent">Cancel</button>
              <button onClick={save} className="px-4 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Save</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
