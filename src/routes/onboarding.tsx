import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/Header";
import { BookOpen, Sparkles } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set Up Your Profile — LearnPath" },
      { name: "description", content: "Tell us about your skills and goals to personalize your learning path." },
    ],
  }),
  component: OnboardingPage,
});

const skillSuggestions = [
  "JavaScript", "Python", "React", "Data Science", "UI/UX Design",
  "Machine Learning", "TypeScript", "Node.js", "SQL", "Cloud Computing",
];

function OnboardingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    // For now, just log — can save to DB later
    console.log({ skills, goal, experience, hoursPerWeek });
    setTimeout(() => {
      setSubmitting(false);
      alert("Profile saved! Your learning path is being generated.");
    }, 1000);
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
          {/* Skills */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <Label className="text-base font-semibold text-card-foreground">What skills do you have or want to learn?</Label>
            <p className="mt-1 text-sm text-muted-foreground">Select from suggestions or add your own.</p>
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
            {skills.filter((s) => !skillSuggestions.includes(s)).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.filter((s) => !skillSuggestions.includes(s)).map((skill) => (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className="rounded-full border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                  >
                    {skill} ×
                  </button>
                ))}
              </div>
            )}
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

          {/* Goal */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <Label htmlFor="goal" className="text-base font-semibold text-card-foreground">What's your learning goal?</Label>
            <p className="mt-1 text-sm text-muted-foreground">e.g., "Get a frontend developer job" or "Build a SaaS product"</p>
            <Textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Describe your main goal…"
              className="mt-3"
              rows={3}
              required
            />
          </div>

          {/* Experience */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <Label className="text-base font-semibold text-card-foreground">Experience level</Label>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {["Beginner", "Intermediate", "Advanced"].map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setExperience(level)}
                  className={`rounded-xl border p-3 text-sm font-medium transition-all ${
                    experience === level
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <Label htmlFor="hours" className="text-base font-semibold text-card-foreground">Hours per week you can dedicate</Label>
            <Input
              id="hours"
              type="number"
              min="1"
              max="80"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
              placeholder="e.g., 10"
              className="mt-3 max-w-32"
              required
            />
          </div>

          <Button type="submit" size="lg" className="w-full py-6 text-base font-semibold" disabled={submitting || skills.length === 0}>
            {submitting ? "Generating your path…" : "Generate My Learning Path"}
          </Button>
        </form>
      </div>
    </div>
  );
}
