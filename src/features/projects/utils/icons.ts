import {
  Folder,
  Briefcase,
  Code,
  BookOpen,
  Heart,
  Home,
  Music,
  Camera,
  ShoppingCart,
  Plane,
  Gamepad2,
  Palette,
  Rocket,
  Target,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const PROJECT_ICONS = [
  { value: "folder", label: "Folder", icon: Folder },
  { value: "briefcase", label: "Briefcase", icon: Briefcase },
  { value: "code", label: "Code", icon: Code },
  { value: "book", label: "Book", icon: BookOpen },
  { value: "heart", label: "Heart", icon: Heart },
  { value: "home", label: "Home", icon: Home },
  { value: "music", label: "Music", icon: Music },
  { value: "camera", label: "Camera", icon: Camera },
  { value: "shopping-cart", label: "Shopping Cart", icon: ShoppingCart },
  { value: "plane", label: "Plane", icon: Plane },
  { value: "gamepad", label: "Gamepad", icon: Gamepad2 },
  { value: "palette", label: "Palette", icon: Palette },
  { value: "rocket", label: "Rocket", icon: Rocket },
  { value: "target", label: "Target", icon: Target },
  { value: "star", label: "Star", icon: Star },
  { value: "zap", label: "Zap", icon: Zap },
] as const;

export const PROJECT_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  PROJECT_ICONS.map((i) => [i.value, i.icon])
);

export function getProjectIcon(icon?: string): LucideIcon {
  if (!icon) return Folder;
  return PROJECT_ICON_MAP[icon] ?? Folder;
}
