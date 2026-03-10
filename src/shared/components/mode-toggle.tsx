import { MoonIcon, SunIcon } from "lucide-react";
import { useId } from "react";
import { Switch } from "@/shared/components/ui/switch";
import { useTheme } from "@/app/providers/theme-provider";

export function ModeToggle() {
  const id = useId();
  const { theme, setTheme } = useTheme();

  // Determine if checked based on current theme
  // If system, we need to check the actual rendered theme
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="inline-flex items-center gap-2">
      <MoonIcon className={`size-4 ${isDark ? "text-primary" : "text-muted-foreground"}`} />
      <Switch
        checked={!isDark}
        className="h-5 w-9 rounded-sm [&_span]:size-4 [&_span]:rounded cursor-pointer"
        id={id}
        onCheckedChange={(checked: boolean) => setTheme(checked ? "light" : "dark")}
      />
      <SunIcon className={`size-4 ${!isDark ? "text-primary" : "text-muted-foreground"}`} />
    </div>
  );
}
