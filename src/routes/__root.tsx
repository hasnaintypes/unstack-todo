import { createRootRouteWithContext, Outlet, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { TaskProvider } from "@/app/providers/task-provider";
import { ProjectProvider } from "@/app/providers/project-provider";
import { CategoryProvider } from "@/app/providers/category-provider";
import { Toaster } from "@/shared/components/ui/sonner";
import type { Models } from "appwrite";
import { cn } from "@/shared/lib/utils";

interface MyRouterContext {
  auth: {
    user: Models.User<Models.Preferences> | null;
    isLoading: boolean;
  };
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith("/auth/");
  const isProtectedRoute =
    location.pathname.startsWith("/inbox") ||
    location.pathname.startsWith("/today") ||
    location.pathname.startsWith("/upcoming") ||
    location.pathname.startsWith("/calendar") ||
    location.pathname.startsWith("/completed") ||
    location.pathname.startsWith("/trash") ||
    location.pathname.startsWith("/projects") ||
    location.pathname.startsWith("/tasks") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/settings");
  const isMinimalLayout = isAuthRoute || isProtectedRoute;

  return (
    <ThemeProvider defaultTheme="system" storageKey="unstack-ui-theme">
      <TaskProvider>
        <ProjectProvider>
          <CategoryProvider>
            <div className="flex flex-col min-h-screen font-sans antialiased text-foreground bg-background">
              {!isMinimalLayout && <Header />}
              <main
                className={cn(
                  "flex-1 flex flex-col mx-auto w-full",
                  !isMinimalLayout && "container max-w-screen-2xl px-4 py-6"
                )}
              >
                <Outlet />
              </main>
              {!isMinimalLayout && <Footer />}
              <Toaster />
              {import.meta.env.DEV && <TanStackRouterDevtools />}
            </div>
          </CategoryProvider>
        </ProjectProvider>
      </TaskProvider>
    </ThemeProvider>
  );
}
