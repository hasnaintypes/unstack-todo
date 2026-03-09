import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { DashboardHeader } from "@/shared/components/layout/dashboard-header";

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

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full overflow-hidden bg-background font-sans">
        <AppSidebar />
        <SidebarInset className="flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className={isCalendarPage ? "max-w-screen-2xl mx-auto" : "max-w-5xl mx-auto"}>
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
