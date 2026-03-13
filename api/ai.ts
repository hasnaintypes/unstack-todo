import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-2.5-flash" });

function sanitize(input: unknown, maxLength = 200): string {
  if (typeof input !== "string") return "";
  return input.replace(/[^\w\s.,!?;:'"()\-@#&+=\/]/g, "").slice(0, maxLength).trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!model) {
    return res.status(501).json({ error: "AI not configured" });
  }

  const { action, ...params } = req.body || {};

  try {
    switch (action) {
      case "suggest-tasks": {
        const projectName = sanitize(params.projectName, 200);
        const projectDescription = sanitize(params.projectDescription, 500);
        const prompt = `You are a project management assistant. Generate 5-8 actionable tasks for a project.

Project name: "${projectName}"
Project description: "${projectDescription || "No description provided"}"

Return ONLY a JSON array (no markdown, no code fences) with objects having these fields:
- "title": string (concise task title)
- "description": string (1-2 sentence description)
- "priority": number (1=Low, 2=Medium, 3=High, 4=Urgent)

Example: [{"title":"Set up repo","description":"Initialize repository with linting.","priority":3}]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text
          .replace(/^```(?:json)?\s*\n?/i, "")
          .replace(/\n?```\s*$/i, "")
          .trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const suggestions = parsed.map((t: { title: string; description: string; priority: number }) => ({
            title: String(t.title),
            description: String(t.description),
            priority: [1, 2, 3, 4].includes(t.priority) ? t.priority : 2,
          }));
          return res.status(200).json(suggestions);
        }
        return res.status(200).json([]);
      }

      case "auto-priority": {
        const taskTitle = sanitize(params.taskTitle, 200);
        const taskDescription = sanitize(params.taskDescription, 500);
        const prompt = `Given this task, return ONLY a single number (1, 2, 3, or 4) representing its priority.

1 = Low (nice-to-have, no deadline pressure)
2 = Medium (standard work, should be done soon)
3 = High (important, time-sensitive)
4 = Urgent (critical, must be done immediately)

Task title: "${taskTitle}"
${taskDescription ? `Task description: "${taskDescription}"` : ""}

Respond with ONLY the number, nothing else.`;

        const result = await model.generateContent(prompt);
        const num = parseInt(result.response.text().trim(), 10);
        return res.status(200).json({ priority: [1, 2, 3, 4].includes(num) ? num : 2 });
      }

      case "generate-description": {
        const taskTitle = sanitize(params.taskTitle, 200);
        const prompt = `Generate a helpful 1-2 sentence description for this task. Be concise and actionable.

Task title: "${taskTitle}"

Respond with ONLY the description text, nothing else.`;

        const result = await model.generateContent(prompt);
        return res.status(200).json({ description: result.response.text().trim() });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error("AI API error:", err);
    return res.status(500).json({ error: "AI request failed" });
  }
}
