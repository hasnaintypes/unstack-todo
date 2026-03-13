import type { TaskPriority } from "@/features/tasks/types/task.types";

export interface TaskSuggestion {
  title: string;
  description: string;
  priority: 1 | 2 | 3 | 4;
}

// --- Template-based fallback data ---
const TASK_TEMPLATES: Record<string, TaskSuggestion[]> = {
  development: [
    {
      title: "Set up project repository and structure",
      description: "Initialize the repo, configure linting, formatting, and CI.",
      priority: 3,
    },
    {
      title: "Define technical requirements",
      description: "Document tech stack, architecture decisions, and constraints.",
      priority: 4,
    },
    {
      title: "Design database schema",
      description: "Model entities, relationships, and write migration scripts.",
      priority: 3,
    },
    {
      title: "Build core API endpoints",
      description: "Implement CRUD operations for primary resources.",
      priority: 3,
    },
    {
      title: "Create UI component library",
      description: "Build reusable components following the design system.",
      priority: 2,
    },
    {
      title: "Write unit and integration tests",
      description: "Achieve adequate test coverage for critical paths.",
      priority: 2,
    },
    {
      title: "Set up deployment pipeline",
      description: "Configure CI/CD for staging and production environments.",
      priority: 2,
    },
    {
      title: "Perform security audit",
      description: "Review auth, input validation, and OWASP top 10.",
      priority: 4,
    },
  ],
  marketing: [
    {
      title: "Define target audience and personas",
      description: "Research demographics, pain points, and behaviors.",
      priority: 4,
    },
    {
      title: "Create content calendar",
      description: "Plan blog posts, social media, and email campaigns.",
      priority: 3,
    },
    {
      title: "Design brand assets",
      description: "Create logos, banners, social media templates.",
      priority: 2,
    },
    {
      title: "Set up analytics tracking",
      description: "Configure GA, conversion funnels, and UTM parameters.",
      priority: 3,
    },
    {
      title: "Launch social media campaigns",
      description: "Schedule and publish posts across platforms.",
      priority: 2,
    },
    {
      title: "Write landing page copy",
      description: "Craft headlines, CTAs, and value propositions.",
      priority: 3,
    },
    {
      title: "Plan email drip sequences",
      description: "Design onboarding and nurture email flows.",
      priority: 2,
    },
    {
      title: "Measure and report on KPIs",
      description: "Track ROI, engagement, and conversion metrics.",
      priority: 2,
    },
  ],
  design: [
    {
      title: "Conduct user research",
      description: "Interview users, analyze pain points, and document findings.",
      priority: 4,
    },
    {
      title: "Create wireframes",
      description: "Sketch low-fidelity layouts for key screens.",
      priority: 3,
    },
    {
      title: "Design high-fidelity mockups",
      description: "Create pixel-perfect designs in Figma.",
      priority: 3,
    },
    {
      title: "Build interactive prototype",
      description: "Link screens with transitions for user testing.",
      priority: 2,
    },
    {
      title: "Define design system tokens",
      description: "Document colors, typography, spacing, and components.",
      priority: 3,
    },
    {
      title: "Conduct usability testing",
      description: "Run moderated tests and synthesize feedback.",
      priority: 2,
    },
    {
      title: "Create icon and illustration set",
      description: "Design custom icons matching the brand style.",
      priority: 1,
    },
    {
      title: "Prepare developer handoff",
      description: "Export assets, document specs, and annotate designs.",
      priority: 2,
    },
  ],
  event: [
    {
      title: "Define event goals and budget",
      description: "Set objectives, KPIs, and allocate budget.",
      priority: 4,
    },
    {
      title: "Book venue and vendors",
      description: "Research, compare, and finalize venue and catering.",
      priority: 4,
    },
    {
      title: "Create event schedule",
      description: "Plan agenda, speakers, and session timings.",
      priority: 3,
    },
    {
      title: "Design invitations and marketing",
      description: "Create invite designs and promotional materials.",
      priority: 2,
    },
    {
      title: "Set up registration system",
      description: "Configure ticketing, RSVP tracking, and confirmation emails.",
      priority: 3,
    },
    {
      title: "Coordinate logistics",
      description: "Arrange AV equipment, seating, signage, and parking.",
      priority: 2,
    },
    {
      title: "Prepare day-of run sheet",
      description: "Minute-by-minute schedule for staff and volunteers.",
      priority: 3,
    },
    {
      title: "Post-event follow-up",
      description: "Send thank-you emails, share photos, gather feedback.",
      priority: 1,
    },
  ],
  default: [
    {
      title: "Define project scope and objectives",
      description: "Clarify goals, deliverables, and success criteria.",
      priority: 4,
    },
    {
      title: "Identify key stakeholders",
      description: "List who needs to be involved and their roles.",
      priority: 3,
    },
    {
      title: "Create project timeline",
      description: "Set milestones, deadlines, and dependencies.",
      priority: 3,
    },
    {
      title: "Gather requirements",
      description: "Document functional and non-functional requirements.",
      priority: 3,
    },
    {
      title: "Allocate resources",
      description: "Assign team members, tools, and budget.",
      priority: 2,
    },
    {
      title: "Set up communication channels",
      description: "Establish meeting cadence, Slack channels, and docs.",
      priority: 2,
    },
    {
      title: "Execute core deliverables",
      description: "Work through the main tasks and track progress.",
      priority: 3,
    },
    {
      title: "Review and retrospective",
      description: "Evaluate outcomes, document lessons learned.",
      priority: 1,
    },
  ],
};

const KEYWORDS: Record<string, string[]> = {
  development: [
    "app",
    "website",
    "software",
    "api",
    "code",
    "build",
    "develop",
    "platform",
    "system",
    "saas",
    "mvp",
    "feature",
    "backend",
    "frontend",
    "mobile",
    "web",
  ],
  marketing: [
    "marketing",
    "campaign",
    "launch",
    "brand",
    "growth",
    "seo",
    "content",
    "social",
    "ads",
    "promotion",
    "awareness",
    "funnel",
  ],
  design: [
    "design",
    "redesign",
    "ui",
    "ux",
    "prototype",
    "wireframe",
    "mockup",
    "rebrand",
    "visual",
    "interface",
    "figma",
  ],
  event: [
    "event",
    "conference",
    "meetup",
    "workshop",
    "party",
    "wedding",
    "hackathon",
    "summit",
    "retreat",
    "trip",
    "travel",
  ],
};

function detectCategory(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();
  let best = "default";
  let bestScore = 0;

  for (const [category, words] of Object.entries(KEYWORDS)) {
    const score = words.filter((w) => text.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }

  return best;
}

function fallbackTaskSuggestions(
  projectName: string,
  projectDescription: string
): TaskSuggestion[] {
  const category = detectCategory(projectName, projectDescription);
  return TASK_TEMPLATES[category] || TASK_TEMPLATES.default;
}

// --- AI-powered functions (via Vercel API proxy) ---

async function callAiProxy(body: Record<string, unknown>): Promise<Response> {
  return fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function generateTaskSuggestions(
  projectName: string,
  projectDescription: string
): Promise<TaskSuggestion[]> {
  try {
    const res = await callAiProxy({
      action: "suggest-tasks",
      projectName,
      projectDescription,
    });

    if (!res.ok) throw new Error("AI proxy error");

    const data = (await res.json()) as TaskSuggestion[];
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (err) {
    console.error("AI suggest-tasks failed, using fallback:", err);
  }

  return fallbackTaskSuggestions(projectName, projectDescription);
}

export async function autoSetPriority(
  taskTitle: string,
  taskDescription?: string
): Promise<TaskPriority> {
  try {
    const res = await callAiProxy({
      action: "auto-priority",
      taskTitle,
      taskDescription,
    });

    if (!res.ok) throw new Error("AI proxy error");

    const data = (await res.json()) as { priority: number };
    if ([1, 2, 3, 4].includes(data.priority)) return data.priority as TaskPriority;
  } catch (err) {
    console.error("AI auto-priority failed:", err);
  }

  return 2;
}

export async function generateDescription(taskTitle: string): Promise<string> {
  try {
    const res = await callAiProxy({
      action: "generate-description",
      taskTitle,
    });

    if (!res.ok) throw new Error("AI proxy error");

    const data = (await res.json()) as { description: string };
    return data.description || "";
  } catch (err) {
    console.error("AI generate-description failed:", err);
  }

  return "";
}

export function hasAiKey(): boolean {
  // In production, AI is always available through the proxy.
  // The proxy returns 501 if GEMINI_API_KEY is not configured,
  // and each function falls back gracefully.
  return true;
}
