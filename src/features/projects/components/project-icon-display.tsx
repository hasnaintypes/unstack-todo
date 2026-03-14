import { PROJECT_ICON_MAP } from "@/features/projects/utils/icons";
import { Folder } from "lucide-react";

export function ProjectIconDisplay({ icon, className }: { icon?: string; className?: string }) {
  const Icon = icon ? (PROJECT_ICON_MAP[icon] ?? Folder) : Folder;
  return <Icon className={className} />;
}
