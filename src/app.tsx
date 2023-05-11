import { useEffect } from 'react'
import { useStore } from './store'
import { Status } from './components/Status'
import { GameBoard } from './components/GameBoard'
import { Room } from './components/Room'

const query = new URLSearchParams(location.search)
if (!query.get('room')) location.search = `?room=${crypto.randomUUID()}`

export default function App() {
  const {
    liveblocks: { enterRoom, leaveRoom },
  } = useStore()

  useEffect(() => {
    const query = new URLSearchParams(location.search)
    enterRoom(query.get('room')!)
    return () => leaveRoom(query.get('room')!)
  }, [])

  return (
    <div className="w-full">
      <section className="container mx-auto flex flex-col">
        <header className="flex justify-between items-center h-10">
          <div>Elo</div>
          <Status />
        </header>
        <main className="py-8">
          <GameBoard />
          <div className="h-8"></div>
          <Room />
        </main>
      </section>
    </div>
  )
}
