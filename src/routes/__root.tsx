import { createRootRouteWithContext, Outlet, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/shared/components/error-fallback";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { QueryProvider } from "@/app/providers/query-provider";
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
    sessionExpired?: boolean;
  };
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const showRouterDevtools =
    import.meta.env.DEV && import.meta.env.VITE_SHOW_ROUTER_DEVTOOLS !== "false";
  const location = useLocation();
  const isMarketingRoute = location.pathname === "/" || location.pathname.startsWith("/about") || location.pathname.startsWith("/terms") || location.pathname.startsWith("/privacy");
  const isMinimalLayout = !isMarketingRoute;

  return (
    <QueryProvider>
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
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Outlet />
                  </ErrorBoundary>
                </main>
                {!isMinimalLayout && <Footer />}
                <Toaster />
                {showRouterDevtools && <TanStackRouterDevtools />}
              </div>
            </CategoryProvider>
          </ProjectProvider>
        </TaskProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
