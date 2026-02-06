import { createRootRouteWithContext, Outlet, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import type { Models } from 'appwrite'

interface MyRouterContext {
  auth: {
    user: Models.User<Models.Preferences> | null
    isLoading: boolean
  }
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith('/auth/');

  return (
    <ThemeProvider defaultTheme="system" storageKey="unstack-ui-theme">
      <div className="flex flex-col min-h-screen font-sans antialiased text-foreground bg-background">
        {!isAuthRoute && <Header />}
        <main className="flex-1 flex flex-col container max-w-screen-2xl mx-auto px-4 py-6">
          <Outlet />
        </main>
        {!isAuthRoute && <Footer />}
        <Toaster />
        <TanStackRouterDevtools />
      </div>
    </ThemeProvider>
  )
}
