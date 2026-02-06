import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_public')({
  beforeLoad: ({ context }) => {
    if (context.auth.user) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: () => <Outlet />,
})
