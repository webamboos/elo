import { Route, useNavigate, useSearch } from '@tanstack/router'
import { root } from './_root'
import { RoomStatus } from '../components/room-status'
import { GameBoard } from '../components/game-board'
import { Room } from '../components/game-room'
import { useStore } from '../store'
import { useEffect } from 'react'

export const game = new Route({
  path: 'game',
  getParentRoute: () => root,
  validateSearch: search => {
    return {
      room: search.room as string,
    }
  },
  component: Game,
})

function Game() {
  const query = useSearch({ from: '/game' })

  const nav = useNavigate()
  const {
    liveblocks: { room, enterRoom, leaveRoom, isStorageLoading },
    loadUser,
    syncUser,
  } = useStore()

  useEffect(() => {
    if (!('room' in query)) {
      nav({ to: '/' })
      return
    }

    if (!localStorage.getItem(query.room)) {
      nav({ to: '/', search: { room: query.room } })
    } else {
      const user = localStorage.getItem(query.room)!
      loadUser(user)
    }

    enterRoom(query.room)
    return () => leaveRoom(query.room)
  }, [])

  useEffect(() => {
    if (room && !isStorageLoading) {
      const user = localStorage.getItem(query.room)!
      if (user) {
        loadUser(user)
      }
      syncUser()
    }
  }, [isStorageLoading, room])

  if (isStorageLoading) {
    return <div>Loading...</div>
  }

  return (
    <section className="container mx-auto">
      <header className="h-16 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Play!</h1>
        <RoomStatus />
      </header>

      <main>
        <GameBoard />
        <div className="h-8"></div>
        <Room />
      </main>
    </section>
  )
}
