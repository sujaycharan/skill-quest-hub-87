import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Header } from "@/components/Header";
import { ShieldCheck, Users, BookOpen, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — LearnPath" },
      { name: "description", content: "LearnPath admin dashboard." },
    ],
  }),
  component: AdminPage,
});

interface UserRow {
  user_id: string;
  display_name: string | null;
  career_goal: string | null;
  onboarding_completed: boolean;
  created_at: string;
  totalTopics: number;
  completedTopics: number;
}

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading || adminLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (!isAdmin) {
      navigate({ to: "/dashboard" });
      return;
    }

    const load = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, career_goal, onboarding_completed, created_at")
        .order("created_at", { ascending: false });

      const { data: topics } = await supabase
        .from("topics")
        .select("user_id, is_completed");

      const stats = new Map<string, { total: number; completed: number }>();
      for (const t of topics ?? []) {
        const s = stats.get(t.user_id) ?? { total: 0, completed: 0 };
        s.total += 1;
        if (t.is_completed) s.completed += 1;
        stats.set(t.user_id, s);
      }

      setUsers(
        (profiles ?? []).map((p) => ({
          ...p,
          totalTopics: stats.get(p.user_id)?.total ?? 0,
          completedTopics: stats.get(p.user_id)?.completed ?? 0,
        }))
      );
      setLoadingData(false);
    };
    load();
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  if (authLoading || adminLoading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const totalUsers = users.length;
  const onboarded = users.filter((u) => u.onboarding_completed).length;
  const totalCompleted = users.reduce((sum, u) => sum + u.completedTopics, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Overview of all LearnPath users</p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" /> Total users
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{totalUsers}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" /> Onboarding completed
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{onboarded}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" /> Topics completed
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{totalCompleted}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Career goal</th>
                <th className="px-4 py-3 font-medium">Onboarding</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loadingData ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No users yet.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.user_id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {u.display_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.career_goal || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          u.onboarding_completed
                            ? "rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
                            : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        }
                      >
                        {u.onboarding_completed ? "Done" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.completedTopics}/{u.totalTopics} topics
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
