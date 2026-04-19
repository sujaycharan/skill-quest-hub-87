"""
training_data.py
────────────────
Synthetic labelled dataset for the LearnPath recommendation model.

Each record describes a user profile and maps to an ordered list of topic
indices that are appropriate for that profile.  Topic indices reference the
TOPICS catalogue defined here — the FastAPI server assembles the final
CareerPath JSON from those indices.

Schema per record:
  career_goal      : str   — one of the four career paths
  current_skills   : list  — skills the user already knows
  learning_speed   : str   — "Beginner" | "Intermediate" | "Fast Learner"
  hours_per_day    : float — study hours available per day
  topic_indices    : list  — ordered topic indices to recommend (0-based,
                             relative to the career path's topic list)
"""

# ── Topic catalogues (mirrors skillMaps.ts exactly) ─────────────────────────

TOPICS: dict[str, list[dict]] = {
    "Python Developer": [
        {"title": "Python Basics",             "description": "Variables, data types, control flow, functions",       "baseHours": 10},
        {"title": "Data Structures",           "description": "Lists, dicts, sets, tuples, stacks, queues",           "baseHours": 8},
        {"title": "OOP Concepts",              "description": "Classes, inheritance, polymorphism, encapsulation",    "baseHours": 8},
        {"title": "File Handling & Exceptions","description": "Working with files, error handling",                   "baseHours": 4},
        {"title": "Mini Projects",             "description": "Build 2-3 small projects to solidify fundamentals",   "baseHours": 12},
        {"title": "Flask Framework",           "description": "Web development basics with Flask",                   "baseHours": 10},
        {"title": "Database Integration",      "description": "SQLAlchemy, PostgreSQL, CRUD operations",             "baseHours": 8},
        {"title": "REST API Development",      "description": "Build and consume RESTful APIs",                      "baseHours": 8},
        {"title": "Testing & Deployment",      "description": "Unit tests, CI/CD, deployment basics",               "baseHours": 6},
    ],
    "Web Developer": [
        {"title": "HTML & CSS Fundamentals",   "description": "Page structure, styling, responsive design",          "baseHours": 8},
        {"title": "JavaScript Basics",         "description": "Variables, functions, DOM manipulation, events",      "baseHours": 10},
        {"title": "Advanced JavaScript",       "description": "ES6+, async/await, closures, prototypes",             "baseHours": 8},
        {"title": "React Fundamentals",        "description": "Components, state, props, hooks",                     "baseHours": 12},
        {"title": "CSS Frameworks",            "description": "Tailwind CSS, responsive design patterns",            "baseHours": 6},
        {"title": "Backend with Node.js",      "description": "Express.js, middleware, routing",                     "baseHours": 10},
        {"title": "Database & Auth",           "description": "MongoDB/PostgreSQL, authentication flows",            "baseHours": 8},
        {"title": "Full-Stack Project",        "description": "Build a complete web application",                   "baseHours": 15},
    ],
    "Data Scientist": [
        {"title": "Python for Data Science",   "description": "NumPy, Pandas basics",                                "baseHours": 8},
        {"title": "Data Visualization",        "description": "Matplotlib, Seaborn, Plotly",                        "baseHours": 6},
        {"title": "Statistics & Probability",  "description": "Descriptive stats, distributions, hypothesis testing","baseHours": 10},
        {"title": "Data Cleaning",             "description": "Handling missing data, outliers, feature engineering","baseHours": 6},
        {"title": "Machine Learning Basics",   "description": "Regression, classification, clustering",              "baseHours": 12},
        {"title": "Deep Learning Intro",       "description": "Neural networks, TensorFlow/PyTorch basics",         "baseHours": 10},
        {"title": "Capstone Project",          "description": "End-to-end data science project",                    "baseHours": 15},
    ],
    "Mobile App Developer": [
        {"title": "JavaScript/TypeScript",     "description": "Core language fundamentals",                          "baseHours": 10},
        {"title": "React Native Basics",       "description": "Components, navigation, styling",                    "baseHours": 10},
        {"title": "State Management",          "description": "Context API, Redux, async storage",                  "baseHours": 6},
        {"title": "Native APIs",               "description": "Camera, location, notifications, storage",           "baseHours": 8},
        {"title": "Backend Integration",       "description": "REST APIs, Firebase, authentication",               "baseHours": 8},
        {"title": "App Store Deployment",      "description": "Build, test, publish to stores",                     "baseHours": 6},
    ],
}

CAREER_PATH_DESCRIPTIONS: dict[str, str] = {
    "Python Developer":      "Master Python programming from basics to advanced frameworks",
    "Web Developer":         "Build modern web applications from frontend to backend",
    "Data Scientist":        "Learn data analysis, visualization, and machine learning",
    "Mobile App Developer":  "Build cross-platform mobile applications",
}

# Fixed skill columns — order must never change after training
SKILL_COLUMNS: list[str] = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js",
    "HTML/CSS", "SQL", "Git", "Data Analysis", "Machine Learning",
    "Flask", "Django", "MongoDB", "PostgreSQL", "Docker",
    "Java", "C++", "Swift", "Kotlin", "R",
]

# ── Skill → topic-index overlap maps ────────────────────────────────────────
# Maps a known skill tag to the topic indices it covers for each career path.
# If a user already has that skill, those topic indices are skipped.

SKILL_TOPIC_OVERLAP: dict[str, dict[str, list[int]]] = {
    "Python": {
        "Python Developer":     [0],       # Python Basics
        "Data Scientist":       [0],       # Python for Data Science
        "Mobile App Developer": [],
        "Web Developer":        [],
    },
    "JavaScript": {
        "Web Developer":        [0, 1],    # HTML/CSS, JS Basics
        "Mobile App Developer": [0],       # JS/TS
        "Python Developer":     [],
        "Data Scientist":       [],
    },
    "TypeScript": {
        "Mobile App Developer": [0],
        "Web Developer":        [1, 2],
        "Python Developer":     [],
        "Data Scientist":       [],
    },
    "React": {
        "Web Developer":        [3],       # React Fundamentals
        "Mobile App Developer": [1],       # React Native Basics
        "Python Developer":     [],
        "Data Scientist":       [],
    },
    "Node.js": {
        "Web Developer":        [5],       # Backend with Node.js
        "Python Developer":     [],
        "Data Scientist":       [],
        "Mobile App Developer": [],
    },
    "HTML/CSS": {
        "Web Developer":        [0],
        "Python Developer":     [],
        "Data Scientist":       [],
        "Mobile App Developer": [],
    },
    "SQL": {
        "Python Developer":     [6],       # Database Integration
        "Web Developer":        [6],       # Database & Auth (partial)
        "Data Scientist":       [],
        "Mobile App Developer": [],
    },
    "Data Analysis": {
        "Data Scientist":       [0, 1, 3], # Python DS, Visualisation, Cleaning
        "Python Developer":     [],
        "Web Developer":        [],
        "Mobile App Developer": [],
    },
    "Machine Learning": {
        "Data Scientist":       [4, 5],    # ML Basics, Deep Learning
        "Python Developer":     [],
        "Web Developer":        [],
        "Mobile App Developer": [],
    },
    "Flask": {
        "Python Developer":     [5],
        "Data Scientist":       [],
        "Web Developer":        [],
        "Mobile App Developer": [],
    },
    "Django": {
        "Python Developer":     [5, 6],
        "Data Scientist":       [],
        "Web Developer":        [],
        "Mobile App Developer": [],
    },
    "MongoDB": {
        "Web Developer":        [6],
        "Python Developer":     [6],
        "Data Scientist":       [],
        "Mobile App Developer": [],
    },
    "PostgreSQL": {
        "Python Developer":     [6],
        "Web Developer":        [6],
        "Data Scientist":       [],
        "Mobile App Developer": [],
    },
}

# ── Synthetic training records ───────────────────────────────────────────────

TRAINING_DATA: list[dict] = [
    # ── Python Developer ─────────────────────────────────────────────────────
    {
        "career_goal": "Python Developer",
        "current_skills": [],
        "learning_speed": "Beginner",
        "hours_per_day": 1.0,
        "topic_indices": [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
        "career_goal": "Python Developer",
        "current_skills": [],
        "learning_speed": "Intermediate",
        "hours_per_day": 2.0,
        "topic_indices": [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
        "career_goal": "Python Developer",
        "current_skills": [],
        "learning_speed": "Fast Learner",
        "hours_per_day": 4.0,
        "topic_indices": [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
        "career_goal": "Python Developer",
        "current_skills": ["Python"],
        "learning_speed": "Beginner",
        "hours_per_day": 1.5,
        "topic_indices": [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
        "career_goal": "Python Developer",
        "current_skills": ["Python"],
        "learning_speed": "Intermediate",
        "hours_per_day": 2.0,
        "topic_indices": [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
        "career_goal": "Python Developer",
        "current_skills": ["Python", "Flask"],
        "learning_speed": "Intermediate",
        "hours_per_day": 2.0,
        "topic_indices": [1, 2, 3, 4, 6, 7, 8],
    },
    {
        "career_goal": "Python Developer",
        "current_skills": ["Python", "SQL"],
        "learning_speed": "Fast Learner",
        "hours_per_day": 3.0,
        "topic_indices": [1, 2, 3, 4, 5, 7, 8],
    },
    {
        "career_goal": "Python Developer",
        "current_skills": ["Python", "Flask", "PostgreSQL"],
        "learning_speed": "Fast Learner",
        "hours_per_day": 4.0,
        "topic_indices": [1, 2, 3, 4, 7, 8],
    },
    {
        "career_goal": "Python Developer",
        "current_skills": ["Python", "Django", "PostgreSQL"],
        "learning_speed": "Intermediate",
        "hours_per_day": 2.0,
        "topic_indices": [1, 2, 3, 4, 7, 8],
    },
    {
        "career_goal": "Python Developer",
        "current_skills": ["Python"],
        "learning_speed": "Fast Learner",
        "hours_per_day": 6.0,
        "topic_indices": [1, 2, 3, 4, 5, 6, 7, 8],
    },

    # ── Web Developer ─────────────────────────────────────────────────────────
    {
        "career_goal": "Web Developer",
        "current_skills": [],
        "learning_speed": "Beginner",
        "hours_per_day": 1.0,
        "topic_indices": [0, 1, 2, 3, 4, 5, 6, 7],
    },
    {
        "career_goal": "Web Developer",
        "current_skills": [],
        "learning_speed": "Intermediate",
        "hours_per_day": 2.0,
        "topic_indices": [0, 1, 2, 3, 4, 5, 6, 7],
    },
    {
        "career_goal": "Web Developer",
        "current_skills": [],
        "learning_speed": "Fast Learner",
        "hours_per_day": 4.0,
        "topic_indices": [0, 1, 2, 3, 4, 5, 6, 7],
    },
    {
        "career_goal": "Web Developer",
        "current_skills": ["HTML/CSS"],
        "learning_speed": "Beginner",
        "hours_per_day": 1.5,
        "topic_indices": [1, 2, 3, 4, 5, 6, 7],
    },
    {
        "career_goal": "Web Developer",
        "current_skills": ["HTML/CSS", "JavaScript"],
        "learning_speed": "Intermediate",
        "hours_per_day": 2.0,
        "topic_indices": [2, 3, 4, 5, 6, 7],
    },
    {
        "career_goal": "Web Developer",
        "current_skills": ["HTML/CSS", "JavaScript", "React"],
        "learning_speed": "Intermediate",
        "hours_per_day": 3.0,
        "topic_indices": [2, 4, 5, 6, 7],
    },
    {
        "career_goal": "Web Developer",
        "current_skills": ["HTML/CSS", "JavaScript", "React", "Node.js"],
        "learning_speed": "Fast Learner",
        "hours_per_day": 4.0,
        "topic_indices": [2, 4, 6, 7],
    },
    {
        "career_goal": "Web Developer",
        "current_skills": ["JavaScript", "TypeScript"],
        "learning_speed": "Intermediate",
        "hours_per_day": 2.0,
        "topic_indices": [0, 3, 4, 5, 6, 7],
    },
    {
        "career_goal": "Web Developer",
        "current_skills": ["React", "Node.js", "MongoDB"],
        "learning_speed": "Fast Learner",
        "hours_per_day": 5.0,
        "topic_indices": [0, 2, 4, 7],
    },
    {
        "career_goal": "Web Developer",
        "current_skills": ["HTML/CSS", "JavaScript", "SQL"],
        "learning_speed": "Beginner",
        "hours_per_day": 1.0,
        "topic_indices": [2, 3, 4, 5, 7],
    },

    # ── Data Scientist ────────────────────────────────────────────────────────
    {
        "career_goal": "Data Scientist",
        "current_skills": [],
        "learning_speed": "Beginner",
        "hours_per_day": 1.0,
        "topic_indices": [0, 1, 2, 3, 4, 5, 6],
    },
    {
        "career_goal": "Data Scientist",
        "current_skills": [],
        "learning_speed": "Intermediate",
        "hours_per_day": 2.0,
        "topic_indices": [0, 1, 2, 3, 4, 5, 6],
    },
    {
        "career_goal": "Data Scientist",
        "current_skills": [],
        "learning_speed": "Fast Learner",
        "hours_per_day": 4.0,
        "topic_indices": [0, 1, 2, 3, 4, 5, 6],
    },
    {
        "career_goal": "Data Scientist",
        "current_skills": ["Python"],
        "learning_speed": "Intermediate",
        "hours_per_day": 2.0,
        "topic_indices": [1, 2, 3, 4, 5, 6],
    },
    {
        "career_goal": "Data Scientist",
        "current_skills": ["Python", "Data Analysis"],
        "learning_speed": "Intermediate",
        "hours_per_day": 2.0,
        "topic_indices": [2, 4, 5, 6],
    },
    {
        "career_goal": "Data Scientist",
        "current_skills": ["Python", "Data Analysis"],
        "learning_speed": "Fast Learner",
        "hours_per_day": 4.0,
        "topic_indices": [2, 4, 5, 6],
    },
    {
        "career_goal": "Data Scientist",
        "current_skills": ["Python", "Data Analysis", "Machine Learning"],
        "learning_speed": "Fast Learner",
        "hours_per_day": 4.0,
        "topic_indices": [2, 6],
    },
    {
        "career_goal": "Data Scientist",
        "current_skills": ["Python", "Data Analysis", "Machine Learning"],
        "learning_speed": "Intermediate",
        "hours_per_day": 3.0,
        "topic_indices": [2, 6],
    },
    {
        "career_goal": "Data Scientist",
        "current_skills": ["Python"],
        "learning_speed": "Beginner",
        "hours_per_day": 1.5,
        "topic_indices": [1, 2, 3, 4, 5, 6],
    },
    {
        "career_goal": "Data Scientist",
        "current_skills": ["R", "Data Analysis"],
        "learning_speed": "Intermediate",
        "hours_per_day": 2.0,
        "topic_indices": [0, 2, 4, 5, 6],
    },

    # ── Mobile App Developer ─────────────────────────────────────────────────
    {
        "career_goal": "Mobile App Developer",
        "current_skills": [],
        "learning_speed": "Beginner",
        "hours_per_day": 1.0,
        "topic_indices": [0, 1, 2, 3, 4, 5],
    },
    {
        "career_goal": "Mobile App Developer",
        "current_skills": [],
        "learning_speed": "Intermediate",
        "hours_per_day": 2.0,
        "topic_indices": [0, 1, 2, 3, 4, 5],
    },
    {
        "career_goal": "Mobile App Developer",
        "current_skills": [],
        "learning_speed": "Fast Learner",
        "hours_per_day": 4.0,
        "topic_indices": [0, 1, 2, 3, 4, 5],
    },
    {
        "career_goal": "Mobile App Developer",
        "current_skills": ["JavaScript"],
        "learning_speed": "Beginner",
        "hours_per_day": 1.5,
        "topic_indices": [1, 2, 3, 4, 5],
    },
    {
        "career_goal": "Mobile App Developer",
        "current_skills": ["JavaScript", "TypeScript"],
        "learning_speed": "Intermediate",
        "hours_per_day": 2.0,
        "topic_indices": [1, 2, 3, 4, 5],
    },
    {
        "career_goal": "Mobile App Developer",
        "current_skills": ["JavaScript", "React"],
        "learning_speed": "Intermediate",
        "hours_per_day": 2.0,
        "topic_indices": [0, 2, 3, 4, 5],
    },
    {
        "career_goal": "Mobile App Developer",
        "current_skills": ["JavaScript", "TypeScript", "React"],
        "learning_speed": "Fast Learner",
        "hours_per_day": 3.0,
        "topic_indices": [2, 3, 4, 5],
    },
    {
        "career_goal": "Mobile App Developer",
        "current_skills": ["TypeScript", "React"],
        "learning_speed": "Fast Learner",
        "hours_per_day": 4.0,
        "topic_indices": [2, 3, 4, 5],
    },
    {
        "career_goal": "Mobile App Developer",
        "current_skills": ["JavaScript"],
        "learning_speed": "Fast Learner",
        "hours_per_day": 5.0,
        "topic_indices": [1, 2, 3, 4, 5],
    },
    {
        "career_goal": "Mobile App Developer",
        "current_skills": ["JavaScript", "TypeScript", "React", "Node.js"],
        "learning_speed": "Fast Learner",
        "hours_per_day": 4.0,
        "topic_indices": [2, 3, 5],
    },
]
