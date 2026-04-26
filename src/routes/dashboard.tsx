import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { checkBadges } from "@/lib/skillMaps";
import {
  BookOpen, CheckCircle2, Circle, Calendar, Trophy, Target,
  Clock, TrendingUp, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LearnPath" },
      { name: "description", content: "Track your learning progress, view your timetable, and earn badges." },
    ],
  }),
  component: DashboardPage,
});

interface Topic {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  estimated_hours: number | null;
  is_completed: boolean | null;
}

interface TimetableEntry {
  id: string;
  day_of_week: string;
  time_slot: string;
  duration_hours: number;
  task_title: string;
  is_completed: boolean | null;
}

interface Profile {
  career_goal: string | null;
  display_name: string | null;
  learning_speed: string | null;
  available_hours_per_day: number | null;
  onboarding_completed: boolean | null;
}

function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"path" | "timetable" | "rewards">("path");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const [profileRes, pathRes, timetableRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase
        .from("learning_paths")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .single(),
      supabase
        .from("timetable_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at"),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      if (!profileRes.data.onboarding_completed) {
        navigate({ to: "/onboarding" });
        return;
      }
    }

    if (pathRes.data) {
      const topicsRes = await supabase
        .from("topics")
        .select("*")
        .eq("learning_path_id", pathRes.data.id)
        .order("sort_order");
      if (topicsRes.data) setTopics(topicsRes.data);
    }

    if (timetableRes.data) setTimetable(timetableRes.data);
    setLoading(false);
  };

  const toggleTopic = async (topicId: string, currentState: boolean | null) => {
    const newState = !currentState;
    await supabase
      .from("topics")
      .update({
        is_completed: newState,
        completed_at: newState ? new Date().toISOString() : null,
      })
      .eq("id", topicId);

    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, is_completed: newState } : t))
    );

    // Check and award badges
    const completed = topics.filter((t) => (t.id === topicId ? newState : t.is_completed)).length;
    const newBadges = checkBadges(completed, topics.length);

    for (const badge of newBadges) {
      const { data: existing } = await supabase
        .from("rewards")
        .select("id")
        .eq("user_id", user!.id)
        .eq("badge_name", badge.name)
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabase.from("rewards").insert({
          user_id: user!.id,
          badge_name: badge.name,
          badge_icon: badge.icon,
          description: badge.description,
        });
      }
    }
  };

  const toggleTimetableEntry = async (entryId: string, currentState: boolean | null) => {
    const newState = !currentState;
    await supabase
      .from("timetable_entries")
      .update({ is_completed: newState })
      .eq("id", entryId);

    setTimetable((prev) =>
      prev.map((t) => (t.id === entryId ? { ...t, is_completed: newState } : t))
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const completedCount = topics.filter((t) => t.is_completed).length;
  const totalCount = topics.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalHours = topics.reduce((sum, t) => sum + (t.estimated_hours ?? 0), 0);
  const completedHours = topics.filter((t) => t.is_completed).reduce((sum, t) => sum + (t.estimated_hours ?? 0), 0);
  const earnedBadges = checkBadges(completedCount, totalCount);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        {/* Welcome & Stats */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.display_name?.split("@")[0] ?? "Learner"}! 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {profile?.career_goal ? `Working towards: ${profile.career_goal}` : "Your learning dashboard"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-card-foreground">{progressPercent}%</div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <Target className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-card-foreground">{completedCount}/{totalCount}</div>
                <div className="text-xs text-muted-foreground">Topics Done</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Clock className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-card-foreground">{completedHours}h</div>
                <div className="text-xs text-muted-foreground">of {totalHours}h learned</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-card-foreground">{earnedBadges.length}</div>
                <div className="text-xs text-muted-foreground">Badges Earned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-card-foreground">Overall Progress</span>
            <span className="text-muted-foreground">{completedCount} of {totalCount} topics</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          {progressPercent > 0 && progressPercent < 100 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {progressPercent < 50 ? "Keep going! You're building momentum! 💪" : "Amazing progress! You're past halfway! 🎉"}
            </p>
          )}
          {progressPercent === 100 && (
            <p className="mt-2 text-sm font-medium text-primary">🎉 Congratulations! You've completed your learning path!</p>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-muted p-1">
          {[
            { key: "path" as const, label: "Learning Path", icon: BookOpen },
            { key: "timetable" as const, label: "Timetable", icon: Calendar },
            { key: "rewards" as const, label: "Rewards", icon: Sparkles },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Learning Path Tab */}
        {activeTab === "path" && (
          <div className="space-y-3 animate-fade-in">
            {topics.map((topic, index) => (
              <div
                key={topic.id}
                className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all ${
                  topic.is_completed
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <button
                  onClick={() => toggleTopic(topic.id, topic.is_completed)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {topic.is_completed ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground group-hover:text-primary/50" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <h3 className={`font-semibold ${topic.is_completed ? "text-primary line-through" : "text-card-foreground"}`}>
                      {topic.title}
                    </h3>
                  </div>
                  {topic.description && (() => {
                    const [mainDesc, subBlock] = topic.description.split("\n\nTopics to learn:");
                    const subs = subBlock
                      ? subBlock.split("\n•").map((s) => s.trim()).filter(Boolean)
                      : [];
                    return (
                      <>
                        <p className="mt-1 text-sm text-muted-foreground">{mainDesc}</p>
                        {subs.length > 0 && (
                          <div className="mt-3 rounded-xl bg-muted/50 p-3">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Topics to learn
                            </div>
                            <ul className="grid gap-1.5 sm:grid-cols-2">
                              {subs.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {topic.estimated_hours}h estimated
                  </div>
                </div>
              </div>
            ))}
            {topics.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                No topics yet. Complete onboarding to generate your learning path.
              </div>
            )}
          </div>
        )}

        {/* Timetable Tab */}
        {activeTab === "timetable" && (
          <div className="space-y-4 animate-fade-in">
            {days.map((day) => {
              const dayEntries = timetable.filter((e) => e.day_of_week === day);
              if (dayEntries.length === 0) return null;
              return (
                <div key={day} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="border-b border-border bg-muted/50 px-5 py-3">
                    <h3 className="font-semibold text-card-foreground">{day}</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {dayEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-4 px-5 py-3">
                        <button onClick={() => toggleTimetableEntry(entry.id, entry.is_completed)}>
                          {entry.is_completed ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${entry.is_completed ? "text-primary line-through" : "text-card-foreground"}`}>
                            {entry.task_title}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {entry.duration_hours}h
                        </div>
                        <div className="text-xs text-muted-foreground">{entry.time_slot}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {timetable.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                No timetable entries yet. Complete onboarding to generate your study schedule.
              </div>
            )}
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === "rewards" && (
          <div className="animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "First Step", icon: "🚀", description: "Complete your first topic", needed: 1 },
                { name: "Beginner Star", icon: "⭐", description: "Complete 3 topics", needed: 3 },
                { name: "Consistency Badge", icon: "🔥", description: "Complete 5 topics", needed: 5 },
                { name: "Halfway Hero", icon: "🏆", description: "Complete half your path", needed: Math.ceil(totalCount / 2) },
                { name: "Path Master", icon: "👑", description: "Complete your entire path", needed: totalCount },
              ].map((badge) => {
                const earned = earnedBadges.some((b) => b.name === badge.name);
                return (
                  <div
                    key={badge.name}
                    className={`rounded-2xl border p-6 text-center transition-all ${
                      earned
                        ? "border-primary/30 bg-primary/5 shadow-sm"
                        : "border-border bg-card opacity-50"
                    }`}
                  >
                    <div className="text-4xl">{badge.icon}</div>
                    <h3 className={`mt-3 font-semibold ${earned ? "text-primary" : "text-muted-foreground"}`}>
                      {badge.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
                    {earned ? (
                      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        ✓ Earned
                      </div>
                    ) : (
                      <div className="mt-3 text-xs text-muted-foreground">
                        {completedCount}/{badge.needed} completed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
