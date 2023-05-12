import { Outlet, RootRoute } from '@tanstack/router'

export const root = new RootRoute({
  component: () => {
    return <Outlet />
  },
})
