import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "email";
  required?: boolean;
  placeholder?: string;
};

export type Column<T> = {
  key: keyof T & string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T extends { id: string }> = {
  title: string;
  subtitle?: string;
  table: string;
  fields: FieldDef[];
  columns: Column<T>[];
  searchKeys: (keyof T & string)[];
};

export function MasterTable<T extends { id: string; [k: string]: unknown }>({ title, subtitle, table, fields, columns, searchKeys }: Props<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<T | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = () => supabase.from(table as any) as any;

  async function load() {
    setLoading(true);
    const { data, error } = await db().select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as T[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [table]);

  function openNew() {
    setEditing(null);
    setForm({});
    setDrawer(true);
  }
  function openEdit(row: T) {
    setEditing(row);
    const f: Record<string, string> = {};
    for (const fd of fields) f[fd.key] = String(row[fd.key] ?? "");
    setForm(f);
    setDrawer(true);
  }

  async function save() {
    const payload: Record<string, unknown> = {};
    for (const fd of fields) {
      const v = form[fd.key];
      if (fd.required && !v) { toast.error(`${fd.label} is required`); return; }
      payload[fd.key] = fd.type === "number" ? (v === "" || v == null ? null : Number(v)) : (v || null);
    }
    if (editing) {
      const { error } = await db().update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Updated");
    } else {
      const { error } = await db().insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Created");
    }
    setDrawer(false);
    load();
  }

  async function remove(row: T) {
    if (!confirm(`Delete this ${title.toLowerCase().replace(/s$/, "")}?`)) return;
    const { error } = await db().delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)));
  }, [rows, query, searchKeys]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-elegant"
        >
          <Plus className="w-4 h-4" /> Add new
        </button>
      </div>

      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full h-11 pl-10 pr-4 rounded-lg bg-card border focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="mt-4 bg-card border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-medium">{c.label}</th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="px-4 py-12 text-center text-muted-foreground">No records yet.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t hover:bg-accent/40">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">{c.render ? c.render(r) : String(r[c.key] ?? "")}</td>
                  ))}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(r)} className="inline-flex items-center gap-1 text-primary hover:underline mr-3"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={() => remove(r)} className="inline-flex items-center gap-1 text-destructive hover:underline"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-foreground/30" onClick={() => setDrawer(false)}>
          <div className="w-full max-w-md bg-card h-full overflow-y-auto shadow-elegant p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-bold">{editing ? "Edit" : "New"} {title.replace(/s$/, "")}</h2>
            <div className="mt-6 space-y-4">
              {fields.map((fd) => (
                <div key={fd.key}>
                  <label className="block text-sm font-medium mb-1">{fd.label}{fd.required && <span className="text-destructive ml-0.5">*</span>}</label>
                  {fd.type === "textarea" ? (
                    <textarea
                      value={form[fd.key] ?? ""}
                      onChange={(e) => setForm({ ...form, [fd.key]: e.target.value })}
                      placeholder={fd.placeholder}
                      rows={3}
                      className="w-full px-3 py-2 rounded-md bg-background border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <input
                      type={fd.type === "number" ? "number" : fd.type === "email" ? "email" : "text"}
                      value={form[fd.key] ?? ""}
                      onChange={(e) => setForm({ ...form, [fd.key]: e.target.value })}
                      placeholder={fd.placeholder}
                      className="w-full h-10 px-3 rounded-md bg-background border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button onClick={() => setDrawer(false)} className="px-4 h-10 rounded-md border hover:bg-accent">Cancel</button>
              <button onClick={save} className="px-4 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Save</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
