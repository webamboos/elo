import { Router } from '@tanstack/router'
import { start } from './pages/start'
import { root } from './pages/_root'
import { lobby } from './pages/lobby'
import { game } from './pages/game'

const routeTree = root.addChildren([start, lobby, game])

export const router = new Router({
  routeTree,
})

declare module '@tanstack/router' {
  interface Register {
    router: typeof router
  }
}
