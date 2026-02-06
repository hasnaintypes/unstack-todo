import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/_marketing/about/')({
  component: About,
})

function About() {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">About Unstack Todo</h3>
      <p className="text-muted-foreground">
        Unstack Todo is a modern task management application built with speed and simplicity in mind.
      </p>
    </div>
  )
}
