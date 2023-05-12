import { useEffect, useState } from 'react'
import { useStore } from './store'
import { RoomStatus } from './components/room-status'
import { GameBoard } from './components/game-board'
import { Room } from './components/game-room'

const query = new URLSearchParams(location.search)
if (!query.get('room')) location.search = `?room=${crypto.randomUUID()}`

export default function App() {
  const [isJoining, setIsJoining] = useState(true)
  const {
    liveblocks: { enterRoom, leaveRoom, isStorageLoading },
  } = useStore()

  useEffect(() => {
    const query = new URLSearchParams(location.search)
    enterRoom(query.get('room')!)
    setIsJoining(false)
    return () => leaveRoom(query.get('room')!)
  }, [])

  if (isJoining || isStorageLoading)
    return <div className="w-full h-screen flex items-center justify-center">Please wait...</div>

  return (
    <div className="w-full">
      <section className="container mx-auto flex flex-col">
        <header className="flex justify-between items-center h-10">
          <div>Elo</div>
          <RoomStatus />
        </header>

        <main className="py-8"></main>
      </section>
    </div>
  )
}
