import { useContext } from "react";
import { ProjectContext } from "@/app/context/project-context";

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
