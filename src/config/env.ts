import { z } from "zod";

const envSchema = z.object({
  VITE_APPWRITE_ENDPOINT: z.string().url("VITE_APPWRITE_ENDPOINT must be a valid URL"),
  VITE_APPWRITE_PROJECT_ID: z.string().min(1, "VITE_APPWRITE_PROJECT_ID is required"),
  VITE_APPWRITE_DATABASE_ID: z.string().min(1, "VITE_APPWRITE_DATABASE_ID is required"),
  VITE_APPWRITE_BUCKET_ID: z.string().default("uploads"),
  VITE_APPWRITE_TASKS_COLLECTION_ID: z.string().default("tasks"),
  VITE_APPWRITE_PROJECTS_COLLECTION_ID: z.string().default("projects"),
  VITE_APPWRITE_CATEGORIES_COLLECTION_ID: z.string().default("categories"),
  VITE_APPWRITE_PROFILES_COLLECTION_ID: z.string().default("profiles"),
  VITE_APPWRITE_SUBTASKS_COLLECTION_ID: z.string().default("subtasks"),
  VITE_APPWRITE_PREFERENCES_COLLECTION_ID: z.string().default("user_preferences"),
  VITE_APPWRITE_TASK_COMMENTS_COLLECTION_ID: z.string().default("task_comments"),
  VITE_APPWRITE_TASK_TEMPLATES_COLLECTION_ID: z.string().default("task_templates"),
  VITE_BETTERSTACK_TOKEN: z.string().optional(),
});

function validateEnv() {
  const raw = {
    VITE_APPWRITE_ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT,
    VITE_APPWRITE_PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    VITE_APPWRITE_DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    VITE_APPWRITE_BUCKET_ID: import.meta.env.VITE_APPWRITE_BUCKET_ID,
    VITE_APPWRITE_TASKS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID,
    VITE_APPWRITE_PROJECTS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_PROJECTS_COLLECTION_ID,
    VITE_APPWRITE_CATEGORIES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID,
    VITE_APPWRITE_PROFILES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID,
    VITE_APPWRITE_SUBTASKS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_SUBTASKS_COLLECTION_ID,
    VITE_APPWRITE_PREFERENCES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_PREFERENCES_COLLECTION_ID,
    VITE_APPWRITE_TASK_COMMENTS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_TASK_COMMENTS_COLLECTION_ID,
    VITE_APPWRITE_TASK_TEMPLATES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_TASK_TEMPLATES_COLLECTION_ID,
    VITE_BETTERSTACK_TOKEN: import.meta.env.VITE_BETTERSTACK_TOKEN,
  };

  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Environment variable validation failed:\n${errors}`);
  }

  return result.data;
}

export const env = validateEnv();
