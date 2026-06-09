import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/components/Brand";
import { LogOut, LayoutDashboard, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

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
          <div className="flex items-center gap-6">
            <Brand />
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <Link
                to="/dashboard"
                activeProps={{ className: "bg-accent text-accent-foreground" }}
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link
                to="/shipments/new"
                activeProps={{ className: "bg-accent text-accent-foreground" }}
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> New shipment
              </Link>
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
