import { useEffect } from "react";

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  /** Allow shortcut to fire when an input/textarea is focused */
  allowInInput?: boolean;
  handler: (e: KeyboardEvent) => void;
}

export interface ShortcutEntry {
  keys: string;
  description: string;
  category: string;
}

export const SHORTCUT_REGISTRY: ShortcutEntry[] = [
  { keys: "N", description: "Create new task", category: "Tasks" },
  { keys: "?", description: "Show keyboard shortcuts", category: "General" },
  { keys: "Ctrl+K", description: "Open search", category: "General" },
  { keys: "E", description: "Edit selected task", category: "Tasks" },
  { keys: "Delete", description: "Delete selected task", category: "Tasks" },
];

function isInputElement(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        // For Cmd/Ctrl shortcuts, match either meta or ctrl
        const modMatch = shortcut.meta || shortcut.ctrl
          ? (e.metaKey || e.ctrlKey) && (shortcut.shift ? e.shiftKey : true)
          : ctrlMatch && metaMatch && shiftMatch && altMatch;

        const finalKeyMatch = shortcut.meta || shortcut.ctrl
          ? keyMatch && modMatch
          : keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch;

        if (finalKeyMatch) {
          if (!shortcut.allowInInput && isInputElement(e.target)) continue;
          e.preventDefault();
          shortcut.handler(e);
          return;
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [shortcuts]);
}
