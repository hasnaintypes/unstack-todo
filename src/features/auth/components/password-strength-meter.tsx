import { cn } from "@/shared/lib/utils";

const rules = [
  (p: string) => p.length >= 8,
  (p: string) => /[a-z]/.test(p),
  (p: string) => /[A-Z]/.test(p),
  (p: string) => /\d/.test(p),
];

const labels = ["Weak", "Fair", "Good", "Strong"] as const;
const colors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
];

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const passed = rules.filter((rule) => rule(password)).length;
  const colorClass = colors[passed - 1] ?? "bg-muted";
  const label = passed > 0 ? labels[passed - 1] : "";

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={`strength-${i}`}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < passed ? colorClass : "bg-muted"
            )}
          />
        ))}
      </div>
      {label && (
        <p className={cn(
          "text-xs",
          passed <= 2 ? "text-muted-foreground" : "text-green-600"
        )}>
          {label}
        </p>
      )}
    </div>
  );
}
