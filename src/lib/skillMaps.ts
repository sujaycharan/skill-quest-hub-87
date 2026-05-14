// Predefined skill maps for different career goals
// The /api/recommend endpoint wraps these with mock ML logic.
// Later, replace the mock with your real ML model.

export interface SkillMapTopic {
  title: string;
  description: string;
  estimatedHours: number;
  subtopics?: string[];
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
      {
        title: "Python Basics",
        description: "Variables, data types, control flow, functions",
        estimatedHours: 10,
        subtopics: ["Variables & data types", "Operators & expressions", "If / elif / else", "Loops (for, while)", "Functions & scope", "Modules & imports"],
      },
      {
        title: "Data Structures",
        description: "Lists, dictionaries, sets, tuples, stacks, queues",
        estimatedHours: 8,
        subtopics: ["Lists & list comprehensions", "Tuples & immutability", "Dictionaries & sets", "Stacks & queues", "Iterators & generators"],
      },
      {
        title: "OOP Concepts",
        description: "Classes, inheritance, polymorphism, encapsulation",
        estimatedHours: 8,
        subtopics: ["Classes & objects", "Inheritance", "Polymorphism", "Encapsulation", "Magic / dunder methods", "Abstract base classes"],
      },
      {
        title: "File Handling & Exceptions",
        description: "Working with files, error handling",
        estimatedHours: 4,
        subtopics: ["Reading & writing files", "Working with JSON & CSV", "try / except / finally", "Custom exceptions", "Context managers (with)"],
      },
      {
        title: "Mini Projects",
        description: "Build 2-3 small projects to solidify fundamentals",
        estimatedHours: 12,
        subtopics: ["CLI todo app", "Web scraper with requests + BeautifulSoup", "Number guessing / quiz game", "Expense tracker"],
      },
      {
        title: "Flask Framework",
        description: "Web development basics with Flask",
        estimatedHours: 10,
        subtopics: ["Routing & views", "Jinja templates", "Forms & request handling", "Sessions & cookies", "Blueprints"],
      },
      {
        title: "Database Integration",
        description: "SQLAlchemy, PostgreSQL, CRUD operations",
        estimatedHours: 8,
        subtopics: ["SQL basics (SELECT/INSERT/UPDATE/DELETE)", "SQLAlchemy ORM", "Migrations with Alembic", "Relationships (1:N, N:N)", "Connecting to PostgreSQL"],
      },
      {
        title: "REST API Development",
        description: "Build and consume RESTful APIs",
        estimatedHours: 8,
        subtopics: ["REST principles", "Building endpoints with Flask / FastAPI", "Request validation (Pydantic)", "JWT authentication", "API documentation (Swagger)"],
      },
      {
        title: "Testing & Deployment",
        description: "Unit tests, CI/CD, deployment basics",
        estimatedHours: 6,
        subtopics: ["pytest basics", "Mocking & fixtures", "GitHub Actions CI", "Docker basics", "Deploy to Render / Railway / AWS"],
      },
    ],
  },
  "Web Developer": {
    label: "Web Developer",
    description: "Build modern web applications from frontend to backend",
    topics: [
      {
        title: "HTML & CSS Fundamentals",
        description: "Page structure, styling, responsive design",
        estimatedHours: 8,
        subtopics: ["Semantic HTML", "Box model & positioning", "Flexbox", "CSS Grid", "Responsive design & media queries", "Forms & accessibility"],
      },
      {
        title: "JavaScript Basics",
        description: "Variables, functions, DOM manipulation, events",
        estimatedHours: 10,
        subtopics: ["Variables & types", "Functions & arrow functions", "Arrays & objects", "DOM manipulation", "Event handling", "Fetch API"],
      },
      {
        title: "Advanced JavaScript",
        description: "ES6+, async/await, closures, prototypes",
        estimatedHours: 8,
        subtopics: ["Destructuring & spread", "Promises & async/await", "Closures & scope", "Prototypes & classes", "Modules (import/export)", "Error handling"],
      },
      {
        title: "React Fundamentals",
        description: "Components, state, props, hooks",
        estimatedHours: 12,
        subtopics: ["JSX & components", "Props & state", "useState & useEffect", "Conditional rendering & lists", "Forms in React", "Custom hooks", "React Router"],
      },
      {
        title: "CSS Frameworks",
        description: "Tailwind CSS, responsive design patterns",
        estimatedHours: 6,
        subtopics: ["Tailwind utility classes", "Theming & design tokens", "Responsive utilities", "Component libraries (shadcn/ui)", "Dark mode"],
      },
      {
        title: "Backend with Node.js",
        description: "Express.js, middleware, routing",
        estimatedHours: 10,
        subtopics: ["Node.js basics & npm", "Express routing", "Middleware", "REST API design", "Error handling & validation"],
      },
      {
        title: "Database & Auth",
        description: "MongoDB/PostgreSQL, authentication flows",
        estimatedHours: 8,
        subtopics: ["SQL vs NoSQL", "MongoDB / Mongoose", "PostgreSQL & Prisma", "JWT authentication", "OAuth (Google/GitHub)", "Password hashing (bcrypt)"],
      },
      {
        title: "Full-Stack Project",
        description: "Build a complete web application",
        estimatedHours: 15,
        subtopics: ["Project planning & wireframes", "Frontend with React", "Backend API", "Authentication flow", "Deployment (Vercel + Render)", "Custom domain & analytics"],
      },
    ],
  },
  "Data Scientist": {
    label: "Data Scientist",
    description: "Learn data analysis, visualization, and machine learning",
    topics: [
      {
        title: "Python for Data Science",
        description: "NumPy, Pandas basics",
        estimatedHours: 8,
        subtopics: ["NumPy arrays & vectorization", "Pandas Series & DataFrame", "Indexing & filtering", "GroupBy & aggregation", "Merging & joining"],
      },
      {
        title: "Data Visualization",
        description: "Matplotlib, Seaborn, Plotly",
        estimatedHours: 6,
        subtopics: ["Matplotlib basics", "Seaborn statistical plots", "Plotly interactive charts", "Choosing the right chart", "Dashboards with Streamlit"],
      },
      {
        title: "Statistics & Probability",
        description: "Descriptive stats, distributions, hypothesis testing",
        estimatedHours: 10,
        subtopics: ["Mean, median, variance", "Probability distributions", "Central limit theorem", "Hypothesis testing (t-test, chi-square)", "Confidence intervals", "Correlation vs causation"],
      },
      {
        title: "Data Cleaning",
        description: "Handling missing data, outliers, feature engineering",
        estimatedHours: 6,
        subtopics: ["Missing value imputation", "Outlier detection", "Encoding categorical features", "Scaling & normalization", "Feature engineering"],
      },
      {
        title: "Machine Learning Basics",
        description: "Regression, classification, clustering",
        estimatedHours: 12,
        subtopics: ["Linear & logistic regression", "Decision trees & random forests", "k-NN & SVM", "K-means clustering", "Train/test split & cross-validation", "Evaluation metrics"],
      },
      {
        title: "Deep Learning Intro",
        description: "Neural networks, TensorFlow/PyTorch basics",
        estimatedHours: 10,
        subtopics: ["Perceptron & activation functions", "Forward & backpropagation", "TensorFlow / Keras basics", "PyTorch basics", "CNN for image classification", "RNN / LSTM intro"],
      },
      {
        title: "Capstone Project",
        description: "End-to-end data science project",
        estimatedHours: 15,
        subtopics: ["Problem definition", "Data collection & cleaning", "EDA & visualization", "Model training & tuning", "Deployment (Streamlit / FastAPI)", "Writing the report"],
      },
    ],
  },
  "Mobile App Developer": {
    label: "Mobile App Developer",
    description: "Build cross-platform mobile applications",
    topics: [
      {
        title: "JavaScript/TypeScript",
        description: "Core language fundamentals",
        estimatedHours: 10,
        subtopics: ["JS fundamentals", "TypeScript types & interfaces", "Generics", "Async / await", "Modules"],
      },
      {
        title: "React Native Basics",
        description: "Components, navigation, styling",
        estimatedHours: 10,
        subtopics: ["Core components (View, Text, Image)", "Styling with Flexbox", "React Navigation", "Lists & ScrollView", "Touchables & gestures"],
      },
      {
        title: "State Management",
        description: "Context API, Redux, async storage",
        estimatedHours: 6,
        subtopics: ["Context API", "Redux Toolkit", "Zustand", "AsyncStorage", "React Query for server state"],
      },
      {
        title: "Native APIs",
        description: "Camera, location, notifications, storage",
        estimatedHours: 8,
        subtopics: ["Camera & image picker", "Geolocation & maps", "Push notifications", "Local storage & SQLite", "Permissions handling"],
      },
      {
        title: "Backend Integration",
        description: "REST APIs, Firebase, authentication",
        estimatedHours: 8,
        subtopics: ["Calling REST APIs", "Firebase Auth & Firestore", "Realtime updates", "File upload", "Offline-first patterns"],
      },
      {
        title: "App Store Deployment",
        description: "Build, test, publish to stores",
        estimatedHours: 6,
        subtopics: ["EAS Build (Expo)", "App icons & splash screens", "Play Store submission", "App Store submission", "OTA updates"],
      },
    ],
  },
  "DSA (Data Structures & Algorithms)": {
    label: "DSA (Data Structures & Algorithms)",
    description: "Crack coding interviews and build strong problem-solving skills",
    topics: [
      {
        title: "Time & Space Complexity",
        description: "Big-O analysis foundations",
        estimatedHours: 4,
        subtopics: ["Big-O, Big-Θ, Big-Ω notation", "Best/average/worst case", "Space complexity", "Amortized analysis", "Common complexity classes"],
      },
      {
        title: "Arrays & Strings",
        description: "Two pointers, sliding window, prefix sums",
        estimatedHours: 10,
        subtopics: ["Two pointers", "Sliding window", "Prefix sum & difference array", "Kadane's algorithm", "String matching basics", "Sorting-based problems"],
      },
      {
        title: "Linked Lists",
        description: "Singly, doubly, and circular linked lists",
        estimatedHours: 6,
        subtopics: ["Singly linked list", "Doubly linked list", "Reversing a linked list", "Detecting cycles (Floyd's)", "Merging two lists", "LRU cache"],
      },
      {
        title: "Stacks & Queues",
        description: "Monotonic stacks, deques, priority queues",
        estimatedHours: 6,
        subtopics: ["Stack operations", "Queue & deque", "Monotonic stack/queue", "Next greater element", "Min stack", "Priority queue / heap intro"],
      },
      {
        title: "Recursion & Backtracking",
        description: "Subsets, permutations, N-Queens, Sudoku",
        estimatedHours: 10,
        subtopics: ["Recursion fundamentals", "Subsets & power set", "Permutations & combinations", "N-Queens problem", "Sudoku solver", "Word search / maze problems"],
      },
      {
        title: "Trees & Binary Search Trees",
        description: "Traversals, BST operations, balanced trees",
        estimatedHours: 10,
        subtopics: ["Tree traversals (pre/in/post/level)", "BST insert / search / delete", "Lowest common ancestor", "Diameter & height", "Serialize & deserialize", "AVL / Red-Black tree intro"],
      },
      {
        title: "Heaps & Hashing",
        description: "Priority queues, hash maps, hash sets",
        estimatedHours: 6,
        subtopics: ["Min-heap & max-heap", "Heapify & heap sort", "Top K problems", "Hash map internals", "Collision handling", "Hashing problem patterns"],
      },
      {
        title: "Graphs",
        description: "BFS, DFS, shortest paths, MST",
        estimatedHours: 12,
        subtopics: ["Graph representations", "BFS & DFS", "Topological sort", "Dijkstra's algorithm", "Bellman-Ford & Floyd-Warshall", "Union-Find (DSU)", "Minimum spanning tree (Kruskal/Prim)"],
      },
      {
        title: "Dynamic Programming",
        description: "Memoization, tabulation, classic DP problems",
        estimatedHours: 14,
        subtopics: ["Memoization vs tabulation", "Fibonacci & climbing stairs", "0/1 Knapsack", "Longest common subsequence", "Longest increasing subsequence", "Matrix chain multiplication", "DP on trees & graphs"],
      },
      {
        title: "Greedy & Advanced Topics",
        description: "Greedy, tries, segment trees, bit manipulation",
        estimatedHours: 10,
        subtopics: ["Greedy strategy & proofs", "Activity selection / interval scheduling", "Huffman coding", "Tries & autocomplete", "Segment tree & Fenwick tree", "Bit manipulation tricks"],
      },
    ],
  },
  "DevOps Engineer": {
    label: "DevOps Engineer",
    description: "Master CI/CD, containers, cloud, and infrastructure as code",
    topics: [
      {
        title: "Linux & Shell Scripting",
        description: "Command line, bash, file system",
        estimatedHours: 8,
        subtopics: ["File system & permissions", "Process management", "Bash scripting", "grep / sed / awk", "Cron jobs", "SSH & remote access"],
      },
      {
        title: "Git & Version Control",
        description: "Branching, merging, workflows",
        estimatedHours: 4,
        subtopics: ["Git basics", "Branching & merging", "Rebase vs merge", "Pull requests & code review", "Git workflows (GitFlow, trunk-based)"],
      },
      {
        title: "Docker & Containers",
        description: "Build, run, and manage containers",
        estimatedHours: 8,
        subtopics: ["Containers vs VMs", "Dockerfile best practices", "Docker Compose", "Volumes & networking", "Multi-stage builds", "Container registries"],
      },
      {
        title: "Kubernetes",
        description: "Container orchestration",
        estimatedHours: 12,
        subtopics: ["Pods, Deployments, Services", "ConfigMaps & Secrets", "Ingress & networking", "Helm charts", "Horizontal Pod Autoscaler", "kubectl essentials"],
      },
      {
        title: "CI/CD Pipelines",
        description: "Automate build, test, and deploy",
        estimatedHours: 8,
        subtopics: ["GitHub Actions", "GitLab CI / Jenkins", "Build & test stages", "Artifact management", "Blue-green & canary deployments"],
      },
      {
        title: "Infrastructure as Code",
        description: "Terraform, Ansible, Pulumi",
        estimatedHours: 10,
        subtopics: ["Terraform basics", "Modules & state", "Ansible playbooks", "Pulumi (TypeScript/Python)", "Secrets management"],
      },
      {
        title: "Cloud (AWS / GCP / Azure)",
        description: "Compute, storage, networking on the cloud",
        estimatedHours: 12,
        subtopics: ["EC2 / GCE / VMs", "S3 / GCS / Blob Storage", "VPC & networking", "IAM & roles", "Managed databases (RDS)", "Lambda / Cloud Functions"],
      },
      {
        title: "Monitoring & Observability",
        description: "Metrics, logs, traces, alerts",
        estimatedHours: 6,
        subtopics: ["Prometheus & Grafana", "ELK / Loki for logs", "Distributed tracing (Jaeger)", "Alerting & on-call", "SLI / SLO / SLA"],
      },
    ],
  },
  "Cybersecurity Analyst": {
    label: "Cybersecurity Analyst",
    description: "Learn to defend systems, networks, and applications",
    topics: [
      {
        title: "Networking Fundamentals",
        description: "OSI model, TCP/IP, DNS, HTTP",
        estimatedHours: 8,
        subtopics: ["OSI & TCP/IP model", "IP, subnetting, routing", "DNS, DHCP, NAT", "HTTP/HTTPS & TLS", "Common ports & protocols"],
      },
      {
        title: "Operating Systems & Linux Security",
        description: "File permissions, processes, hardening",
        estimatedHours: 6,
        subtopics: ["Linux file permissions", "User & group management", "System hardening", "Logging (syslog, journald)", "SELinux / AppArmor"],
      },
      {
        title: "Cryptography Basics",
        description: "Symmetric & asymmetric encryption, hashing",
        estimatedHours: 6,
        subtopics: ["Symmetric vs asymmetric", "AES, RSA, ECC", "Hashing (SHA, bcrypt)", "Digital signatures", "PKI & certificates"],
      },
      {
        title: "Web Application Security",
        description: "OWASP Top 10, secure coding",
        estimatedHours: 10,
        subtopics: ["SQL injection", "XSS & CSRF", "Authentication flaws", "SSRF & deserialization", "Security headers", "Secure code review"],
      },
      {
        title: "Network Security & Firewalls",
        description: "Firewalls, IDS/IPS, VPN",
        estimatedHours: 6,
        subtopics: ["Firewall rules (iptables / pf)", "IDS/IPS (Snort, Suricata)", "VPN (OpenVPN, WireGuard)", "Network segmentation", "Zero trust basics"],
      },
      {
        title: "Penetration Testing",
        description: "Recon, exploitation, reporting",
        estimatedHours: 10,
        subtopics: ["Reconnaissance (nmap, recon-ng)", "Vulnerability scanning (Nessus, OpenVAS)", "Exploitation with Metasploit", "Burp Suite for web", "Privilege escalation", "Writing pentest reports"],
      },
      {
        title: "Incident Response & SOC",
        description: "Detect, respond, recover",
        estimatedHours: 6,
        subtopics: ["SIEM (Splunk, ELK)", "Threat intelligence", "Incident response lifecycle", "Forensics basics", "Playbooks & runbooks"],
      },
    ],
  },
  "AI / ML Engineer": {
    label: "AI / ML Engineer",
    description: "Build and deploy machine learning and deep learning systems",
    topics: [
      {
        title: "Math for ML",
        description: "Linear algebra, calculus, probability",
        estimatedHours: 10,
        subtopics: ["Vectors & matrices", "Eigenvalues & SVD", "Derivatives & gradients", "Probability & Bayes", "Statistical inference"],
      },
      {
        title: "Python & ML Tooling",
        description: "NumPy, Pandas, scikit-learn",
        estimatedHours: 6,
        subtopics: ["NumPy & Pandas", "scikit-learn pipelines", "Jupyter / Colab workflows", "Experiment tracking (MLflow / W&B)"],
      },
      {
        title: "Classical Machine Learning",
        description: "Regression, classification, ensembles",
        estimatedHours: 10,
        subtopics: ["Linear & logistic regression", "Decision trees & random forest", "Gradient boosting (XGBoost, LightGBM)", "SVM & k-NN", "Cross-validation & metrics"],
      },
      {
        title: "Deep Learning",
        description: "Neural networks with PyTorch / TensorFlow",
        estimatedHours: 14,
        subtopics: ["Perceptron & MLP", "Backpropagation", "CNNs for vision", "RNN / LSTM / GRU", "Transfer learning", "Regularization & batch norm"],
      },
      {
        title: "NLP & Transformers",
        description: "Modern language models",
        estimatedHours: 10,
        subtopics: ["Tokenization & embeddings", "Attention & Transformers", "Hugging Face Transformers", "Fine-tuning BERT / GPT", "RAG (retrieval-augmented generation)", "Prompt engineering"],
      },
      {
        title: "Computer Vision",
        description: "Image classification, detection, segmentation",
        estimatedHours: 8,
        subtopics: ["Image preprocessing", "CNN architectures (ResNet, EfficientNet)", "Object detection (YOLO, Faster R-CNN)", "Segmentation (U-Net)", "Vision Transformers"],
      },
      {
        title: "MLOps & Deployment",
        description: "Serving, monitoring, scaling models",
        estimatedHours: 8,
        subtopics: ["Model serving (FastAPI, TorchServe)", "Containerizing models with Docker", "CI/CD for ML", "Monitoring drift & performance", "Feature stores"],
      },
      {
        title: "Capstone Project",
        description: "End-to-end ML product",
        estimatedHours: 15,
        subtopics: ["Problem framing", "Data pipeline", "Model training & evaluation", "Deployment as API/app", "Monitoring & retraining"],
      },
    ],
  },
};

export const skillSuggestions = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js",
  "HTML/CSS", "SQL", "Git", "Data Analysis", "Machine Learning",
  "Flask", "Django", "MongoDB", "PostgreSQL", "Docker",
  "Java", "C++", "Swift", "Kotlin", "R",
  "Linux", "AWS", "Kubernetes", "TensorFlow", "PyTorch",
];

/**
 * Fetch a personalised career path from the ML API.
 * Falls back to local careerPaths if the API is unreachable.
 */
export async function fetchRecommendation(
  careerGoal: string,
  currentSkills: string[],
  learningSpeed: string,
  hoursPerDay: number
): Promise<CareerPath> {
  try {
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        career_goal: careerGoal,
        current_skills: currentSkills,
        learning_speed: learningSpeed,
        hours_per_day: hoursPerDay,
      }),
    });

    if (!res.ok) throw new Error("API request failed");
    return (await res.json()) as CareerPath;
  } catch (err) {
    console.warn("ML API unavailable, falling back to local data:", err);
    const fallback = careerPaths[careerGoal];
    if (!fallback) throw new Error(`Unknown career goal: ${careerGoal}`);
    return fallback;
  }
}

function formatTimeSlot(baseHour: number, offsetHours: number): string {
  const totalMinutes = Math.round((baseHour + offsetHours) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const ampm = h < 12 ? "AM" : "PM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// Generate timetable based on topics and user preferences.
// Each subtopic gets its own time-slotted entry within the day.
export function generateTimetable(
  topics: SkillMapTopic[],
  hoursPerDay: number,
  preferredTime: string
): Array<{ day: string; timeSlot: string; taskTitle: string; durationHours: number; topicIndex: number }> {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const baseHour = preferredTime === "Morning" ? 9 : 18;

  const entries: Array<{ day: string; timeSlot: string; taskTitle: string; durationHours: number; topicIndex: number }> = [];

  let dayIndex = 0;
  let dayHoursUsed = 0;

  for (let ti = 0; ti < topics.length; ti++) {
    if (dayIndex >= days.length) break;
    const topic = topics[ti];
    const subs = topic.subtopics && topic.subtopics.length > 0 ? topic.subtopics : [topic.title];
    const subHours = Math.max(0.5, Math.round((topic.estimatedHours / subs.length) * 2) / 2);

    for (const sub of subs) {
      if (dayIndex >= days.length) break;

      // Move to next day if this subtopic won't fit
      if (dayHoursUsed > 0 && dayHoursUsed + subHours > hoursPerDay) {
        dayIndex++;
        dayHoursUsed = 0;
        if (dayIndex >= days.length) break;
      }

      entries.push({
        day: days[dayIndex],
        timeSlot: formatTimeSlot(baseHour, dayHoursUsed),
        taskTitle: sub,
        durationHours: subHours,
        topicIndex: ti,
      });

      dayHoursUsed += subHours;
      if (dayHoursUsed >= hoursPerDay) {
        dayIndex++;
        dayHoursUsed = 0;
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
