import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="container py-10 max-w-screen-2xl mx-auto px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2">Welcome Back!</h2>
          <p className="text-muted-foreground">This is your todo dashboard. Start by creating a new task.</p>
        </div>
      </div>
    </div>
  )
}
