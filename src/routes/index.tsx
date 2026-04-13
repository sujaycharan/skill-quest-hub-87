import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Zap, Users } from "lucide-react";
import { Header } from "@/components/Header";
import heroImage from "@/assets/hero-illustration.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LearnPath — Personalized Learning Platform" },
      { name: "description", content: "Master new skills with a personalized learning path tailored to your goals." },
      { property: "og:title", content: "LearnPath — Personalized Learning Platform" },
      { property: "og:description", content: "Master new skills with a personalized learning path tailored to your goals." },
    ],
  }),
  component: HomePage,
});

const features = [
  {
    icon: Target,
    title: "Goal-Oriented",
    description: "Set clear learning goals and track your progress with smart milestones.",
  },
  {
    icon: Zap,
    title: "Adaptive Learning",
    description: "AI-powered paths that adjust to your pace and learning style.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Learn alongside peers and get support from mentors worldwide.",
  },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-1.5 text-sm font-medium text-hero-text backdrop-blur-sm">
              <BookOpen className="h-4 w-4" />
              Your journey starts here
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-hero-text">
              Learn Smarter,
              <br />
              Grow Faster
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-hero-text/80">
              Tell us your skills and goals — we'll craft a personalized learning path
              that gets you where you want to be.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="text-base px-8 py-6 font-semibold shadow-lg">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="ghost" className="text-base px-8 py-6 font-semibold text-hero-text border border-hero-text/30 hover:bg-hero-text/10 hover:text-hero-text">
                  I Have an Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-foreground sm:text-4xl">
            Why LearnPath?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            A smarter way to learn, built around you.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Ready to start learning?</h2>
          <p className="mt-3 text-muted-foreground">Join thousands of learners building real skills.</p>
          <Link to="/signup" className="mt-8 inline-block">
            <Button size="lg" className="px-8 py-6 text-base font-semibold">
              Create Your Path
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          © 2026 LearnPath. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
