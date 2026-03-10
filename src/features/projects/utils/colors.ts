export const PROJECT_COLORS = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "cyan", label: "Cyan", class: "bg-cyan-500" },
];

export const PROJECT_COLOR_MAP: Record<string, string> = Object.fromEntries(
  PROJECT_COLORS.map((c) => [c.value, c.class])
);

export function getColorClass(color: string): string {
  return PROJECT_COLOR_MAP[color] || "bg-blue-500";
}
