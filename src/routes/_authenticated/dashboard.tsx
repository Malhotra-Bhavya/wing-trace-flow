import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime, STATUSES } from "@/lib/shipment-utils";
import { Search, Plus, ArrowUpDown, Eye } from "lucide-react";

type Row = {
  id: string;
  awb_number: string;
  shipper_name: string;
  consignee_name: string;
  origin_airport: string;
  destination_airport: string;
  current_status: string;
  updated_at: string;
};

type SortKey = keyof Row;

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Operations Dashboard — Multiwings" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    supabase
      .from("shipments")
      .select("id,awb_number,shipper_name,consignee_name,origin_airport,destination_airport,current_status,updated_at")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as Row[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = !q ? rows : rows.filter((x) =>
      [x.awb_number, x.shipper_name, x.consignee_name, x.origin_airport, x.destination_airport, x.current_status]
        .join(" ").toLowerCase().includes(q),
    );
    r = [...r].sort((a, b) => {
      const va = String(a[sortKey] ?? "");
      const vb = String(b[sortKey] ?? "");
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return r;
  }, [rows, query, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  }

  const stats = useMemo(() => {
    const byStatus = new Map<string, number>();
    for (const r of rows) byStatus.set(r.current_status, (byStatus.get(r.current_status) ?? 0) + 1);
    return {
      total: rows.length,
      inTransit: (byStatus.get("In Transit") ?? 0) + (byStatus.get("At Origin Airport") ?? 0) + (byStatus.get("At Destination Airport") ?? 0),
      delivered: byStatus.get("Delivered") ?? 0,
      booked: byStatus.get("Booked") ?? 0,
    };
  }, [rows]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground mt-1">Manage and update all active Multiwings shipments.</p>
        </div>
        <Link
          to="/shipments/new"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-elegant"
        >
          <Plus className="w-4 h-4" /> Create new shipment
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total shipments", value: stats.total },
          { label: "Booked", value: stats.booked },
          { label: "In transit", value: stats.inTransit },
          { label: "Delivered", value: stats.delivered },
        ].map((s) => (
          <div key={s.label} className="bg-card border rounded-xl px-5 py-4 shadow-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{s.label}</div>
            <div className="font-display text-2xl font-bold mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by AWB, shipper, consignee, airport…"
          className="w-full h-11 pl-10 pr-4 rounded-lg bg-card border focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="mt-4 bg-card border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {([
                  ["awb_number", "AWB"],
                  ["shipper_name", "Shipper"],
                  ["consignee_name", "Consignee"],
                  ["origin_airport", "Origin"],
                  ["destination_airport", "Destination"],
                  ["current_status", "Status"],
                  ["updated_at", "Updated"],
                ] as [SortKey, string][]).map(([k, label]) => (
                  <th key={k} className="px-4 py-3 font-medium">
                    <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-foreground">
                      {label} <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No shipments yet. Create one to get started.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t hover:bg-accent/40">
                  <td className="px-4 py-3 font-mono font-medium">{r.awb_number}</td>
                  <td className="px-4 py-3">{r.shipper_name}</td>
                  <td className="px-4 py-3">{r.consignee_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.origin_airport}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.destination_airport}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.current_status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDateTime(r.updated_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/shipments/$id"
                      params={{ id: r.id }}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const isDelivered = status === "Delivered";
  const isBooked = status === "Booked";
  const cls = isDelivered
    ? "bg-success/15 text-success ring-success/30"
    : isBooked
    ? "bg-muted text-muted-foreground ring-border"
    : "bg-primary/10 text-primary ring-primary/20";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cls}`}>
      {status}
    </span>
  );
}

// Make sure STATUSES is referenced so unused-import lint doesn't fire if needed elsewhere.
void STATUSES;
