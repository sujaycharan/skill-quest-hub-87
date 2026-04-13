// Predefined skill maps for different career goals
// Later this will be replaced by ML model recommendations

export interface SkillMapTopic {
  title: string;
  description: string;
  estimatedHours: number;
}

export interface CareerPath {
  label: string;
  description: string;
  topics: SkillMapTopic[];
}

export const careerPaths: Record<string, CareerPath> = {
  "Python Developer": {
    label: "Python Developer",
    description: "Master Python programming from basics to advanced frameworks",
    topics: [
      { title: "Python Basics", description: "Variables, data types, control flow, functions", estimatedHours: 10 },
      { title: "Data Structures", description: "Lists, dictionaries, sets, tuples, stacks, queues", estimatedHours: 8 },
      { title: "OOP Concepts", description: "Classes, inheritance, polymorphism, encapsulation", estimatedHours: 8 },
      { title: "File Handling & Exceptions", description: "Working with files, error handling", estimatedHours: 4 },
      { title: "Mini Projects", description: "Build 2-3 small projects to solidify fundamentals", estimatedHours: 12 },
      { title: "Flask Framework", description: "Web development basics with Flask", estimatedHours: 10 },
      { title: "Database Integration", description: "SQLAlchemy, PostgreSQL, CRUD operations", estimatedHours: 8 },
      { title: "REST API Development", description: "Build and consume RESTful APIs", estimatedHours: 8 },
      { title: "Testing & Deployment", description: "Unit tests, CI/CD, deployment basics", estimatedHours: 6 },
    ],
  },
  "Web Developer": {
    label: "Web Developer",
    description: "Build modern web applications from frontend to backend",
    topics: [
      { title: "HTML & CSS Fundamentals", description: "Page structure, styling, responsive design", estimatedHours: 8 },
      { title: "JavaScript Basics", description: "Variables, functions, DOM manipulation, events", estimatedHours: 10 },
      { title: "Advanced JavaScript", description: "ES6+, async/await, closures, prototypes", estimatedHours: 8 },
      { title: "React Fundamentals", description: "Components, state, props, hooks", estimatedHours: 12 },
      { title: "CSS Frameworks", description: "Tailwind CSS, responsive design patterns", estimatedHours: 6 },
      { title: "Backend with Node.js", description: "Express.js, middleware, routing", estimatedHours: 10 },
      { title: "Database & Auth", description: "MongoDB/PostgreSQL, authentication flows", estimatedHours: 8 },
      { title: "Full-Stack Project", description: "Build a complete web application", estimatedHours: 15 },
    ],
  },
  "Data Scientist": {
    label: "Data Scientist",
    description: "Learn data analysis, visualization, and machine learning",
    topics: [
      { title: "Python for Data Science", description: "NumPy, Pandas basics", estimatedHours: 8 },
      { title: "Data Visualization", description: "Matplotlib, Seaborn, Plotly", estimatedHours: 6 },
      { title: "Statistics & Probability", description: "Descriptive stats, distributions, hypothesis testing", estimatedHours: 10 },
      { title: "Data Cleaning", description: "Handling missing data, outliers, feature engineering", estimatedHours: 6 },
      { title: "Machine Learning Basics", description: "Regression, classification, clustering", estimatedHours: 12 },
      { title: "Deep Learning Intro", description: "Neural networks, TensorFlow/PyTorch basics", estimatedHours: 10 },
      { title: "Capstone Project", description: "End-to-end data science project", estimatedHours: 15 },
    ],
  },
  "Mobile App Developer": {
    label: "Mobile App Developer",
    description: "Build cross-platform mobile applications",
    topics: [
      { title: "JavaScript/TypeScript", description: "Core language fundamentals", estimatedHours: 10 },
      { title: "React Native Basics", description: "Components, navigation, styling", estimatedHours: 10 },
      { title: "State Management", description: "Context API, Redux, async storage", estimatedHours: 6 },
      { title: "Native APIs", description: "Camera, location, notifications, storage", estimatedHours: 8 },
      { title: "Backend Integration", description: "REST APIs, Firebase, authentication", estimatedHours: 8 },
      { title: "App Store Deployment", description: "Build, test, publish to stores", estimatedHours: 6 },
    ],
  },
};

export const skillSuggestions = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js",
  "HTML/CSS", "SQL", "Git", "Data Analysis", "Machine Learning",
  "Flask", "Django", "MongoDB", "PostgreSQL", "Docker",
  "Java", "C++", "Swift", "Kotlin", "R",
];

// Generate timetable based on topics and user preferences
export function generateTimetable(
  topics: SkillMapTopic[],
  hoursPerDay: number,
  preferredTime: string
): Array<{ day: string; timeSlot: string; taskTitle: string; durationHours: number; topicIndex: number }> {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timePrefix = preferredTime === "Morning" ? "9:00 AM" : "6:00 PM";
  
  const entries: Array<{ day: string; timeSlot: string; taskTitle: string; durationHours: number; topicIndex: number }> = [];
  let topicIndex = 0;
  let remainingHoursForTopic = topics[0]?.estimatedHours ?? 0;

  for (const day of days) {
    if (topicIndex >= topics.length) break;
    
    let dayHours = hoursPerDay;
    while (dayHours > 0 && topicIndex < topics.length) {
      const hours = Math.min(dayHours, remainingHoursForTopic);
      entries.push({
        day,
        timeSlot: timePrefix,
        taskTitle: topics[topicIndex].title,
        durationHours: hours,
        topicIndex,
      });
      dayHours -= hours;
      remainingHoursForTopic -= hours;
      if (remainingHoursForTopic <= 0) {
        topicIndex++;
        remainingHoursForTopic = topics[topicIndex]?.estimatedHours ?? 0;
      }
    }
  }

  return entries;
}

// Determine which badges a user has earned
export function checkBadges(completedCount: number, totalCount: number): Array<{ name: string; icon: string; description: string }> {
  const badges: Array<{ name: string; icon: string; description: string }> = [];
  
  if (completedCount >= 1) {
    badges.push({ name: "First Step", icon: "🚀", description: "Completed your first topic!" });
  }
  if (completedCount >= 3) {
    badges.push({ name: "Beginner Star", icon: "⭐", description: "Completed 3 topics" });
  }
  if (completedCount >= 5) {
    badges.push({ name: "Consistency Badge", icon: "🔥", description: "Completed 5 topics" });
  }
  if (completedCount >= Math.floor(totalCount / 2) && totalCount > 0) {
    badges.push({ name: "Halfway Hero", icon: "🏆", description: "Completed half your path!" });
  }
  if (completedCount === totalCount && totalCount > 0) {
    badges.push({ name: "Path Master", icon: "👑", description: "Completed your entire learning path!" });
  }

  return badges;
}
