import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Sparkles, Sun, Moon } from "lucide-react";
import { careerPaths, skillSuggestions } from "@/lib/skillMaps";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set Up Your Profile — LearnPath" },
      { name: "description", content: "Tell us about your skills and goals to personalize your learning path." },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [learningSpeed, setLearningSpeed] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setCustomSkill("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!careerGoal || !learningSpeed || !hoursPerDay || !preferredTime) {
      setError("Please fill in all fields.");
      return;
    }
    setSubmitting(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          career_goal: careerGoal,
          current_skills: skills,
          learning_speed: learningSpeed,
          available_hours_per_day: Number(hoursPerDay),
          preferred_study_time: preferredTime,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Create learning path from skill map
      const pathData = careerPaths[careerGoal];
      if (pathData) {
        // Filter out topics the user already knows
        const topicsToLearn = pathData.topics.filter(
          (t) => !skills.some((s) => t.title.toLowerCase().includes(s.toLowerCase()))
        );

        const { data: lp, error: lpError } = await supabase
          .from("learning_paths")
          .insert({
            user_id: user.id,
            title: `${careerGoal} Path`,
            description: pathData.description,
          })
          .select()
          .single();

        if (lpError) throw lpError;

        // Insert topics
        if (lp && topicsToLearn.length > 0) {
          const topicRows = topicsToLearn.map((t, i) => ({
            learning_path_id: lp.id,
            user_id: user.id,
            title: t.title,
            description: t.description,
            sort_order: i,
            estimated_hours: t.estimatedHours,
          }));

          const { error: topicsError } = await supabase.from("topics").insert(topicRows);
          if (topicsError) throw topicsError;
        }

        // Generate timetable entries
        const { generateTimetable } = await import("@/lib/skillMaps");
        const timetable = generateTimetable(topicsToLearn, Number(hoursPerDay), preferredTime);
        if (timetable.length > 0) {
          const timetableRows = timetable.map((entry) => ({
            user_id: user.id,
            day_of_week: entry.day,
            time_slot: entry.timeSlot,
            duration_hours: entry.durationHours,
            task_title: entry.taskTitle,
          }));
          await supabase.from("timetable_entries").insert(timetableRows);
        }
      }

      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-4 pt-28 pb-16">
        <div className="mb-10 text-center animate-fade-up">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Let's personalize your path</h1>
          <p className="mt-2 text-muted-foreground">Tell us about yourself so we can create the perfect learning experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {/* Career Goal */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <Label className="text-base font-semibold text-card-foreground">What's your career goal?</Label>
            <p className="mt-1 text-sm text-muted-foreground">Choose the path you want to pursue.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(careerPaths).map(([key, path]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setCareerGoal(key)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    careerGoal === key
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold text-card-foreground">{path.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{path.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Skills */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <Label className="text-base font-semibold text-card-foreground">What skills do you already have?</Label>
            <p className="mt-1 text-sm text-muted-foreground">We'll skip these in your learning path.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {skillSuggestions.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                    skills.includes(skill)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Add a custom skill…"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); } }}
              />
              <Button type="button" variant="outline" onClick={addCustomSkill}>Add</Button>
            </div>
          </div>

          {/* Learning Speed */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <Label className="text-base font-semibold text-card-foreground">Learning speed</Label>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {["Beginner", "Intermediate", "Fast Learner"].map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setLearningSpeed(level)}
                  className={`rounded-xl border p-3 text-sm font-medium transition-all ${
                    learningSpeed === level
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <Label className="text-base font-semibold text-card-foreground">Study schedule</Label>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hours" className="text-sm text-muted-foreground">Hours per day</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                  placeholder="e.g., 2"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Preferred time</Label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {[
                    { value: "Morning", icon: Sun, label: "Morning" },
                    { value: "Evening", icon: Moon, label: "Evening" },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setPreferredTime(value)}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                        preferredTime === value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full py-6 text-base font-semibold" disabled={submitting || !careerGoal}>
            {submitting ? "Generating your learning path…" : "Generate My Learning Path"}
          </Button>
        </form>
      </div>
    </div>
  );
}
