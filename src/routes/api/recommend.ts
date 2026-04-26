import { createFileRoute } from "@tanstack/react-router";
import { careerPaths, type CareerPath } from "@/lib/skillMaps";

export const Route = createFileRoute("/api/recommend")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { career_goal, current_skills, learning_speed, hours_per_day } = body as {
            career_goal: string;
            current_skills: string[];
            learning_speed: string;
            hours_per_day: number;
          };

          if (!career_goal) {
            return Response.json({ error: "career_goal is required" }, { status: 400 });
          }

          // --- MOCK ML LOGIC ---
          // Replace this block with a fetch to your real ML model endpoint:
          //
          //   const res = await fetch("https://your-ml-api.com/recommend", {
          //     method: "POST",
          //     headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.ML_API_KEY}` },
          //     body: JSON.stringify({ career_goal, current_skills, learning_speed, hours_per_day }),
          //   });
          //   const recommendation: CareerPath = await res.json();
          //

          const basePath = careerPaths[career_goal];
          if (!basePath) {
            return Response.json(
              { error: `Unknown career goal: ${career_goal}` },
              { status: 404 }
            );
          }

          // Simulate ML personalisation: filter known skills & adjust hours by speed
          const speedMultiplier =
            learning_speed === "Fast Learner" ? 0.7 :
            learning_speed === "Intermediate" ? 1.0 : 1.3;

          const filteredTopics = basePath.topics
            .filter((t) => !current_skills.some((s) =>
              t.title.toLowerCase().includes(s.toLowerCase())
            ))
            .map((t) => ({
              ...t,
              estimatedHours: Math.max(1, Math.round(t.estimatedHours * speedMultiplier)),
              subtopics: t.subtopics ?? [],
            }));

          const recommendation: CareerPath = {
            label: basePath.label,
            description: basePath.description,
            topics: filteredTopics,
          };

          // --- END MOCK ML LOGIC ---

          return Response.json(recommendation);
        } catch (err) {
          console.error("Recommend API error:", err);
          return Response.json(
            { error: "Failed to generate recommendation" },
            { status: 500 }
          );
        }
      },
    },
  },
});
