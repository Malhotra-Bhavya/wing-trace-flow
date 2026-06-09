import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Airline = { id: string; name: string; awb_prefix: string | null };
type Stock = { id: string; airline_id: string | null; prefix: string; serial_from: number; serial_to: number; notes: string | null };
type StockNum = { id: string; stock_id: string; awb_number: string; status: string };

export const Route = createFileRoute("/_authenticated/masters/awb-stock")({
  head: () => ({ meta: [{ title: "AWB Stock — Multiwings" }] }),
  component: AwbStockPage,
});

function AwbStockPage() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [numbers, setNumbers] = useState<StockNum[]>([]);
  const [showOnlyUnused, setShowOnlyUnused] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ airline_id: "", prefix: "", serial_from: "", serial_to: "", notes: "" });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [a, s, n] = await Promise.all([
      supabase.from("airlines").select("id,name,awb_prefix").order("name"),
      supabase.from("awb_stock").select("*").order("created_at", { ascending: false }),
      supabase.from("awb_stock_numbers").select("id,stock_id,awb_number,status").order("awb_number"),
    ]);
    setAirlines((a.data as Airline[]) ?? []);
    setStocks((s.data as Stock[]) ?? []);
    setNumbers((n.data as StockNum[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function addBlock() {
    const from = parseInt(form.serial_from, 10);
    const to = parseInt(form.serial_to, 10);
    if (!form.prefix || !from || !to || to < from) return toast.error("Enter valid prefix and serial range");
    if (to - from > 1000) return toast.error("Block too large (max 1000 numbers at a time)");
    const { data: stock, error } = await supabase.from("awb_stock").insert({
      airline_id: form.airline_id || null,
      prefix: form.prefix,
      serial_from: from,
      serial_to: to,
      notes: form.notes || null,
    }).select().single();
    if (error || !stock) return toast.error(error?.message ?? "Failed");
    const rows: { stock_id: string; awb_number: string; status: string }[] = [];
    for (let i = from; i <= to; i++) {
      rows.push({ stock_id: stock.id as string, awb_number: `${form.prefix}-${String(i).padStart(8, "0")}`, status: "unused" });
    }
    const { error: insErr } = await supabase.from("awb_stock_numbers").insert(rows);
    if (insErr) return toast.error(insErr.message);
    toast.success(`Added ${rows.length} AWBs`);
    setAdding(false);
    setForm({ airline_id: "", prefix: "", serial_from: "", serial_to: "", notes: "" });
    load();
  }

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("awb_stock_numbers").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  async function removeBlock(id: string) {
    if (!confirm("Delete this AWB block and all its numbers?")) return;
    const { error } = await supabase.from("awb_stock").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  const filtered = useMemo(() => showOnlyUnused ? numbers.filter((n) => n.status === "unused") : numbers, [numbers, showOnlyUnused]);
  const airlineFor = (sid: string) => {
    const stock = stocks.find((s) => s.id === sid);
    return airlines.find((a) => a.id === stock?.airline_id)?.name ?? "—";
  };

  const byStock = useMemo(() => {
    const m = new Map<string, { unused: number; used: number; void: number }>();
    for (const n of numbers) {
      const k = n.stock_id;
      const cur = m.get(k) ?? { unused: 0, used: 0, void: 0 };
      if (n.status === "unused") cur.unused++;
      else if (n.status === "void") cur.void++;
      else cur.used++;
      m.set(k, cur);
    }
    return m;
  }, [numbers]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">AWB Stock Register</h1>
          <p className="text-muted-foreground mt-1">Pre-allocated AWB numbers grouped by airline.</p>
        </div>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-elegant">
          <Plus className="w-4 h-4" /> Add AWB block
        </button>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {loading && <div className="text-muted-foreground">Loading…</div>}
        {!loading && stocks.length === 0 && <div className="text-muted-foreground">No AWB blocks yet.</div>}
        {stocks.map((s) => {
          const c = byStock.get(s.id) ?? { unused: 0, used: 0, void: 0 };
          return (
            <div key={s.id} className="bg-card border rounded-xl shadow-card p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-display font-bold text-lg">{airlineFor(s.id)}</div>
                  <div className="text-sm text-muted-foreground font-mono mt-1">{s.prefix}-{String(s.serial_from).padStart(8, "0")} → {s.prefix}-{String(s.serial_to).padStart(8, "0")}</div>
                </div>
                <button onClick={() => removeBlock(s.id)} className="text-destructive hover:underline text-xs inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
              </div>
              <div className="mt-3 flex gap-4 text-sm">
                <span className="text-success">Unused: {c.unused}</span>
                <span className="text-primary">Used: {c.used}</span>
                <span className="text-muted-foreground">Void: {c.void}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">AWB Numbers</h2>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showOnlyUnused} onChange={(e) => setShowOnlyUnused(e.target.checked)} />
          Show only unused
        </label>
      </div>
      <div className="mt-3 bg-card border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 sticky top-0 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">AWB Number</th>
                <th className="px-4 py-3 font-medium">Airline</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={n.id} className="border-t hover:bg-accent/40">
                  <td className="px-4 py-3 font-mono">{n.awb_number}</td>
                  <td className="px-4 py-3">{airlineFor(n.stock_id)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                      n.status === "unused" ? "bg-success/15 text-success ring-success/30" :
                      n.status === "void" ? "bg-muted text-muted-foreground ring-border" :
                      "bg-primary/10 text-primary ring-primary/20"
                    }`}>{n.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs">
                    {n.status !== "unused" && <button onClick={() => setStatus(n.id, "unused")} className="text-primary hover:underline mr-3">Mark unused</button>}
                    {n.status !== "used" && <button onClick={() => setStatus(n.id, "used")} className="text-primary hover:underline mr-3">Mark used</button>}
                    {n.status !== "void" && <button onClick={() => setStatus(n.id, "void")} className="text-destructive hover:underline">Void</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-foreground/30" onClick={() => setAdding(false)}>
          <div className="w-full max-w-md bg-card h-full overflow-y-auto shadow-elegant p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-bold">Add AWB block</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Airline</label>
                <select value={form.airline_id} onChange={(e) => {
                  const a = airlines.find((x) => x.id === e.target.value);
                  setForm({ ...form, airline_id: e.target.value, prefix: a?.awb_prefix ?? form.prefix });
                }} className="w-full h-10 px-3 rounded-md bg-background border">
                  <option value="">— Select airline —</option>
                  {airlines.map((a) => <option key={a.id} value={a.id}>{a.name}{a.awb_prefix ? ` (${a.awb_prefix})` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">AWB prefix *</label>
                <input value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value })} placeholder="e.g. 020" className="w-full h-10 px-3 rounded-md bg-background border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Serial from *</label>
                  <input type="number" value={form.serial_from} onChange={(e) => setForm({ ...form, serial_from: e.target.value })} className="w-full h-10 px-3 rounded-md bg-background border" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Serial to *</label>
                  <input type="number" value={form.serial_to} onChange={(e) => setForm({ ...form, serial_to: e.target.value })} className="w-full h-10 px-3 rounded-md bg-background border" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-md bg-background border" />
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button onClick={() => setAdding(false)} className="px-4 h-10 rounded-md border hover:bg-accent">Cancel</button>
              <button onClick={addBlock} className="px-4 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Add block</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
