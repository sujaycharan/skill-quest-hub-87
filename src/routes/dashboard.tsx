import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { checkBadges } from "@/lib/skillMaps";
import {
  BookOpen, CheckCircle2, Circle, Calendar,
  Clock, Sparkles, PlayCircle,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Label,
} from "recharts";

type TopicStatus = "not_started" | "in_progress" | "completed";

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
  status: TopicStatus;
}

interface TimetableEntry {
  id: string;
  day_of_week: string;
  time_slot: string;
  duration_hours: number;
  task_title: string;
  is_completed: boolean | null;
  topics: { title: string; description: string | null } | null;
}

interface Profile {
  career_goal: string | null;
  display_name: string | null;
  learning_speed: string | null;
  available_hours_per_day: number | null;
  preferred_study_time: string | null;
  onboarding_completed: boolean | null;
}

const GREEN = "#4ade80";
const AMBER = "#f59e0b";
const GREY = "#4b5563";

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
      {label && <p className="mb-1 font-medium text-card-foreground">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color ?? p.fill }}>
          {p.name}: {p.value}{p.name === "hours" ? "h" : ""}
        </p>
      ))}
    </div>
  );
};

function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
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
        .select("*, topics(title, description)")
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
      if (topicsRes.data) setTopics(topicsRes.data as Topic[]);
    }

    if (timetableRes.data) setTimetable(timetableRes.data);
    setLoading(false);
  };

  const updateTopicStatus = async (topicId: string, newStatus: TopicStatus) => {
    const isCompleted = newStatus === "completed";
    await supabase
      .from("topics")
      .update({
        status: newStatus,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq("id", topicId);

    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId ? { ...t, status: newStatus, is_completed: isCompleted } : t
      )
    );

    const completed = topics.filter((t) =>
      t.id === topicId ? isCompleted : t.is_completed
    ).length;
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

  const regenerateTimetable = async () => {
    if (!user || !profile || topics.length === 0) return;
    setRegenerating(true);

    // Convert DB topics → SkillMapTopic format (parse subtopics from description)
    const skillTopics = topics.map((t) => {
      const subBlock = t.description?.split("\n\nTopics to learn:")?.[1] ?? null;
      const subtopics = subBlock
        ? subBlock.split("\n•").map((s) => s.trim()).filter(Boolean)
        : [];
      return {
        title: t.title,
        description: t.description?.split("\n\nTopics to learn:")?.[0] ?? "",
        estimatedHours: t.estimated_hours ?? 1,
        subtopics,
      };
    });

    const hoursPerDay = profile.available_hours_per_day ?? 2;
    const preferredTime = profile.preferred_study_time ?? "Morning";

    const { generateTimetable } = await import("@/lib/skillMaps");
    const newEntries = generateTimetable(skillTopics, hoursPerDay, preferredTime);

    // Map sort_order → topic DB id
    const topicIdByIndex: Record<number, string> = {};
    topics.forEach((t, i) => { topicIdByIndex[i] = t.id; });

    // Replace old entries
    await supabase.from("timetable_entries").delete().eq("user_id", user.id);
    if (newEntries.length > 0) {
      await supabase.from("timetable_entries").insert(
        newEntries.map((e) => ({
          user_id: user.id,
          day_of_week: e.day,
          time_slot: e.timeSlot,
          duration_hours: e.durationHours,
          task_title: e.taskTitle,
          topic_id: topicIdByIndex[e.topicIndex] ?? null,
        }))
      );
    }

    await fetchData();
    setRegenerating(false);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const completedCount = topics.filter((t) => t.status === "completed").length;
  const inProgressCount = topics.filter((t) => t.status === "in_progress").length;
  const notStartedCount = topics.filter((t) => t.status === "not_started").length;
  const totalCount = topics.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalHours = topics.reduce((sum, t) => sum + (t.estimated_hours ?? 0), 0);
  const completedHours = topics.filter((t) => t.is_completed).reduce((sum, t) => sum + (t.estimated_hours ?? 0), 0);
  const earnedBadges = checkBadges(completedCount, totalCount);

  const donutData = [
    { name: "Completed", value: completedCount > 0 ? completedCount : 0 },
    { name: "Remaining", value: totalCount - completedCount > 0 ? totalCount - completedCount : totalCount === 0 ? 1 : 0 },
  ];

  const statusData = [
    { name: "Completed", value: completedCount, color: GREEN },
    { name: "In Progress", value: inProgressCount, color: AMBER },
    { name: "Not Started", value: notStartedCount, color: GREY },
  ].filter((d) => d.value > 0);

  const hoursData = topics.map((t) => ({
    name: t.title.length > 14 ? t.title.slice(0, 14) + "…" : t.title,
    hours: t.estimated_hours ?? 0,
    fill: t.status === "completed" ? GREEN : t.status === "in_progress" ? AMBER : GREY,
  }));

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        {/* Welcome */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.display_name?.split("@")[0] ?? "Learner"}! 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {profile?.career_goal ? `Working towards: ${profile.career_goal}` : "Your learning dashboard"}
          </p>
        </div>

        {/* Charts */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {/* Donut — Overall Progress */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-card-foreground">Overall Progress</h3>
            <p className="text-xs text-muted-foreground">{completedCount} of {totalCount} topics complete</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={64}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                >
                  <Cell fill={GREEN} />
                  <Cell fill={GREY} />
                  <Label
                    content={({ viewBox }: any) => {
                      const { cx, cy } = viewBox;
                      return (
                        <text textAnchor="middle" dominantBaseline="central">
                          <tspan x={cx} y={cy - 6} fontSize="22" fontWeight="bold" fill="white">
                            {progressPercent}%
                          </tspan>
                          <tspan x={cx} y={cy + 11} fontSize="10" fill="#9ca3af">
                            complete
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
                <RechartsTooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pie — Topic Status Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-card-foreground">Topic Status</h3>
            <p className="text-xs text-muted-foreground">{totalCount} topics total</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={statusData.length > 0 ? statusData : [{ name: "No topics yet", value: 1, color: GREY }]}
                  cx="50%"
                  cy="45%"
                  outerRadius={55}
                  dataKey="value"
                  strokeWidth={0}
                  label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""}
                  labelLine={false}
                >
                  {(statusData.length > 0 ? statusData : [{ color: GREY }]).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>{value}</span>
                  )}
                />
                <RechartsTooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar — Hours per Topic */}
          <div className="col-span-full rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-card-foreground">Hours per Topic</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              {completedHours}h completed · {totalHours - completedHours}h remaining
            </p>
            {hoursData.length > 0 ? (
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={hoursData} barCategoryGap="30%">
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    unit="h"
                  />
                  <RechartsTooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {hoursData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">
                No topic data yet
              </div>
            )}
            <div className="mt-3 flex gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: GREEN }} />
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: AMBER }} />
                In Progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: GREY }} />
                Not Started
              </span>
            </div>
          </div>
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
            {topics.map((topic, index) => {
              const status = topic.status;
              const statusConfig = {
                not_started: { label: "Not started", icon: Circle, color: "text-muted-foreground", bg: "bg-muted" },
                in_progress: { label: "In progress", icon: PlayCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
                completed: { label: "Completed", icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
              }[status];
              const StatusIcon = statusConfig.icon;
              return (
                <div
                  key={topic.id}
                  className={`group rounded-2xl border p-5 transition-all ${
                    status === "completed"
                      ? "border-primary/30 bg-primary/5"
                      : status === "in_progress"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <StatusIcon className={`mt-0.5 h-6 w-6 flex-shrink-0 ${statusConfig.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                        <h3 className={`font-semibold ${status === "completed" ? "text-primary line-through" : "text-card-foreground"}`}>
                          {topic.title}
                        </h3>
                        <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
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
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {topic.estimated_hours}h estimated
                        </div>
                        <div className="flex gap-1.5">
                          {status !== "completed" && status !== "in_progress" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTopicStatus(topic.id, "in_progress")}
                            >
                              Start
                            </Button>
                          )}
                          {status !== "completed" ? (
                            <Button
                              size="sm"
                              onClick={() => updateTopicStatus(topic.id, "completed")}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Mark as Complete
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTopicStatus(topic.id, "not_started")}
                            >
                              Completed ✓ (Undo)
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
                          {(() => {
                            const [parent, ...rest] = entry.task_title.split(" — ");
                            const sub = rest.join(" — ");
                            return (
                              <>
                                <div className={`text-sm font-medium ${entry.is_completed ? "text-primary line-through" : "text-card-foreground"}`}>
                                  {sub || parent}
                                </div>
                                {sub && (
                                  <div className="text-xs text-muted-foreground mt-0.5">{parent}</div>
                                )}
                              </>
                            );
                          })()}
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
