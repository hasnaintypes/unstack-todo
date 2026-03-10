import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { DashboardHeader } from "@/shared/components/layout/dashboard-header";
import { TaskDetailSheet } from "@/features/tasks/components/task-details-dialog";
import { TaskAddDialog } from "@/features/tasks/components/task-add-dialog";
import { QuickAddFAB } from "@/shared/components/quick-add-fab";
import { KeyboardShortcutsDialog } from "@/shared/components/keyboard-shortcuts-dialog";
import { useKeyboardShortcuts, type Shortcut } from "@/shared/hooks/use-keyboard-shortcuts";
import { useTasks } from "@/app/providers/task-provider";

export const Route = createFileRoute("/_protected")({
  beforeLoad: ({ context }) => {
    if (!context.auth.user && !context.auth.isLoading) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const location = useLocation();
  const isCalendarPage = location.pathname === "/calendar";
  const { selectedTask, setSelectedTask, updateTask, toggleTaskComplete, moveToTrash, addTask } = useTasks();

  const [isQuickAddOpen, setQuickAddOpen] = useState(false);
  const [isShortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);

  const shortcuts = useMemo<Shortcut[]>(() => [
    {
      key: "n",
      handler: () => setQuickAddOpen(true),
    },
    {
      key: "/",
      shift: true,
      handler: () => setShortcutsHelpOpen(true),
    },
    {
      key: "k",
      meta: true,
      handler: () => setSearchOpen((prev) => !prev),
    },
  ], []);

  useKeyboardShortcuts(shortcuts);

  const handleQuickAdd = (taskData: Partial<import("@/features/tasks/types/task.types").CalendarTask>) => {
    if (!taskData.title) return;
    addTask({
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate || "",
      priority: taskData.priority || 2,
      category: taskData.category,
      project: taskData.project || "inbox",
      status: taskData.status || "todo",
      subtasks: taskData.subtasks,
    });
  };

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full overflow-hidden bg-background font-sans">
        <AppSidebar />
        <SidebarInset className="flex flex-col overflow-hidden">
          <DashboardHeader
            searchOpen={isSearchOpen}
            onSearchOpenChange={setSearchOpen}
          />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className={isCalendarPage ? "max-w-screen-2xl mx-auto" : "max-w-5xl mx-auto"}>
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* Global Task Detail Sheet */}
      <TaskDetailSheet
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={() => setSelectedTask(null)}
        onToggleComplete={toggleTaskComplete}
        onEdit={(id, data) => updateTask(id, data)}
        onDelete={moveToTrash}
      />

      {/* Global Quick Add Dialog */}
      <TaskAddDialog
        open={isQuickAddOpen}
        onOpenChange={setQuickAddOpen}
        onSave={handleQuickAdd}
      />

      {/* Floating Action Button */}
      <QuickAddFAB onClick={() => setQuickAddOpen(true)} />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsDialog
        open={isShortcutsHelpOpen}
        onOpenChange={setShortcutsHelpOpen}
      />
    </SidebarProvider>
  );
}
