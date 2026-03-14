import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function processInChunks<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  chunkSize = 15,
  delayMs = 100
): Promise<void> {
  for (let i = 0; i < items.length; i += chunkSize) {
    await Promise.all(items.slice(i, i + chunkSize).map(fn));
    if (delayMs > 0 && i + chunkSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
