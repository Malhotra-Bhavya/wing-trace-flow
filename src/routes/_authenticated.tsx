import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/components/Brand";
import { LogOut, LayoutDashboard, Briefcase, Plane, Truck, FileText, Database, BarChart3, ChevronDown, Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

const linkBase = "px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 flex items-center gap-1.5";
const activeCls = "bg-accent text-accent-foreground";

function AuthedLayout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [mastersOpen, setMastersOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Brand />
            <nav className="hidden lg:flex items-center gap-1 text-sm">
              <Link to="/dashboard" activeProps={{ className: activeCls }} className={linkBase}><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
              <Link to="/jobs" activeProps={{ className: activeCls }} className={linkBase}><Briefcase className="w-4 h-4" /> Jobs</Link>
              <Link to="/mawbs" activeProps={{ className: activeCls }} className={linkBase}><Plane className="w-4 h-4" /> MAWB</Link>
              <Link to="/courier" activeProps={{ className: activeCls }} className={linkBase}><Truck className="w-4 h-4" /> Courier</Link>
              <Link to="/invoices" activeProps={{ className: activeCls }} className={linkBase}><FileText className="w-4 h-4" /> Invoices</Link>
              <div className="relative" onMouseLeave={() => setMastersOpen(false)}>
                <button onClick={() => setMastersOpen(!mastersOpen)} onMouseEnter={() => setMastersOpen(true)} className={linkBase}>
                  <Database className="w-4 h-4" /> Masters <ChevronDown className="w-3 h-3" />
                </button>
                {mastersOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-card border rounded-lg shadow-elegant py-1 min-w-[200px]">
                    <Link to="/masters/shippers" className="block px-4 py-2 hover:bg-accent">Shippers</Link>
                    <Link to="/masters/consignees" className="block px-4 py-2 hover:bg-accent">Consignees</Link>
                    <Link to="/masters/airlines" className="block px-4 py-2 hover:bg-accent">Airlines</Link>
                    <Link to="/masters/agents" className="block px-4 py-2 hover:bg-accent">Agents</Link>
                    <Link to="/masters/rates" className="block px-4 py-2 hover:bg-accent">Rates &amp; Charges</Link>
                    <Link to="/masters/awb-stock" className="block px-4 py-2 hover:bg-accent flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> AWB Stock</Link>
                  </div>
                )}
              </div>
              <Link to="/reports" activeProps={{ className: activeCls }} className={linkBase}><BarChart3 className="w-4 h-4" /> Reports</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground hidden sm:inline">{email}</span>
            <button onClick={signOut} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-accent">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
