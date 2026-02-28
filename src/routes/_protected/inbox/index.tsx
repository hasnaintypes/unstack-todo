import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { InboxEmptyState } from '@/components/empty-states'
import type { EmptyStateTaskInput } from '@/components/empty-states'

export const Route = createFileRoute('/_protected/inbox/')({
  component: InboxPage,
})

function InboxPage() {
  const [tasks, setTasks] = useState<
    (EmptyStateTaskInput & { id: string; section: 'Inbox' })[]
  >([])

  const handleAddTask = (task: EmptyStateTaskInput) => {
    setTasks((previous) => [
      {
        ...task,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        section: 'Inbox',
      },
      ...previous,
    ])
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {tasks.length === 0 ? (
        <InboxEmptyState onAddTask={handleAddTask} />
      ) : (
        <div className="container py-10 max-w-screen-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Inbox</h1>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-lg border bg-card p-4">
                <p className="font-medium">{task.title}</p>
                {task.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {task.section} · {task.priority} · {task.category}
                  {task.dueDate ? ` · ${task.dueDate}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
