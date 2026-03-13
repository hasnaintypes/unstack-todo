import { createFileRoute, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Loader2, Minimize2 } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { DashboardHeader } from "@/shared/components/layout/dashboard-header";
import { TaskDetailSheet } from "@/features/tasks/components/task-details-sheet";
import { TaskAddDialog } from "@/features/tasks/components/task-add-dialog";
import { QuickAddFAB } from "@/shared/components/quick-add-fab";
import { KeyboardShortcutsDialog } from "@/shared/components/keyboard-shortcuts-dialog";
import { Button } from "@/shared/components/ui/button";
import { useKeyboardShortcuts, type Shortcut } from "@/shared/hooks/use-keyboard-shortcuts";
import { useTasks } from "@/shared/hooks/use-tasks";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { OnboardingDialog, onboardingService } from "@/features/onboarding";
import { reminderService } from "@/features/reminders/services/reminder.service";
import { toast } from "sonner";
import { logger } from "@/shared/lib/logger";

const PAGE_TITLES: Record<string, string> = {
  "/inbox": "Inbox",
  "/today": "Today",
  "/upcoming": "Upcoming",
  "/completed": "Completed",
  "/trash": "Trash",
  "/calendar": "Calendar",
  "/profile": "Profile",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/projects/")) return "Project";
  if (pathname.startsWith("/tasks/")) return "Task";
  return "";
}

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
  const navigate = useNavigate();
  const isCalendarPage = location.pathname === "/calendar";
  const { user, isLoading: authLoading, sessionExpired } = useAuth();
  const { selectedTask, setSelectedTask, updateTask, toggleTaskComplete, moveToTrash, addTask } =
    useTasks();

  const [isQuickAddOpen, setQuickAddOpen] = useState(false);
  const [isShortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [profileDocId, setProfileDocId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  const pageTitle = getPageTitle(location.pathname);

  // Redirect to sign-in once auth check completes with no user
  useEffect(() => {
    if (!authLoading && !user) {
      if (sessionExpired) {
        toast.error("Your session has expired. Please sign in again.");
      }
      navigate({ to: "/auth/sign-in" });
    }
  }, [authLoading, user, sessionExpired, navigate]);

  useEffect(() => {
    if (!user) return;
    onboardingService.getProfile(user.$id).then((profile) => {
      if (profile && !profile.onboardingCompleted) {
        setProfileDocId(profile.$id);
        setOnboardingOpen(true);
      }
    }).catch((err) => logger.warn("Failed to load onboarding profile", { error: err }));
  }, [user]);

  // Load focus mode default from user preferences
  useEffect(() => {
    if (!user) return;
    reminderService.getPreferences(user.$id).then((prefs) => {
      if (prefs.focusModeDefault) {
        setFocusMode(true);
      }
    }).catch((err) => logger.warn("Failed to load focus mode preference", { error: err }));
  }, [user]);

  const toggleFocusMode = useCallback(() => setFocusMode((prev) => !prev), []);

  const shortcuts = useMemo<Shortcut[]>(
    () => [
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
      {
        key: "f",
        handler: toggleFocusMode,
      },
    ],
    [toggleFocusMode]
  );

  useKeyboardShortcuts(shortcuts);

  const handleQuickAdd = (
    taskData: Partial<import("@/features/tasks/types/task.types").CalendarTask>
  ) => {
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
      tags: taskData.tags,
      recurrence: taskData.recurrence ?? null,
      reminderEnabled: taskData.reminderEnabled ?? false,
      reminderBefore: taskData.reminderBefore,
      attachments: taskData.attachments,
    });
  };

  // Block rendering until auth check completes — prevents flash of protected content
  if (authLoading || !user) {
    return (
      <div className="flex h-svh w-full items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (focusMode) {
    return (
      <>
        <div className="flex h-svh w-full flex-col overflow-hidden bg-background font-sans">
          <div className="flex h-12 items-center justify-between border-b bg-background px-4">
            <span className="text-sm font-semibold">{pageTitle}</span>
            <Button variant="ghost" size="sm" onClick={() => setFocusMode(false)}>
              <Minimize2 className="size-4 mr-1.5" /> Exit Focus
            </Button>
          </div>
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className={isCalendarPage ? "max-w-screen-2xl mx-auto" : "max-w-5xl mx-auto"}>
              <Outlet />
            </div>
          </main>
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
        <TaskAddDialog open={isQuickAddOpen} onOpenChange={setQuickAddOpen} onSave={handleQuickAdd} />

        {/* Floating Action Button */}
        <QuickAddFAB onClick={() => setQuickAddOpen(true)} />

        {/* Keyboard Shortcuts Help */}
        <KeyboardShortcutsDialog open={isShortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen} />
      </>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full overflow-hidden bg-background font-sans">
        <AppSidebar />
        <SidebarInset className="flex flex-col overflow-hidden">
          <DashboardHeader
            searchOpen={isSearchOpen}
            onSearchOpenChange={setSearchOpen}
            onToggleFocusMode={toggleFocusMode}
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
      <TaskAddDialog open={isQuickAddOpen} onOpenChange={setQuickAddOpen} onSave={handleQuickAdd} />

      {/* Floating Action Button */}
      <QuickAddFAB onClick={() => setQuickAddOpen(true)} />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsDialog open={isShortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen} />

      {/* Onboarding Dialog */}
      <OnboardingDialog
        open={onboardingOpen}
        onComplete={() => {
          setOnboardingOpen(false);
          if (profileDocId) {
            onboardingService.completeOnboarding(profileDocId).catch((err) => logger.warn("Failed to complete onboarding", { error: err }));
          }
        }}
      />
    </SidebarProvider>
  );
}
