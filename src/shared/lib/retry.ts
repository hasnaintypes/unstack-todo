import { AppwriteException } from "appwrite";
import { logger } from "@/shared/lib/logger";

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (
        error instanceof AppwriteException &&
        error.code === 429 &&
        attempt < maxRetries
      ) {
        const delay = baseDelay * Math.pow(2, attempt);
        logger.warn("Appwrite rate limit hit, retrying", {
          attempt: attempt + 1,
          maxRetries,
          delayMs: delay,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
