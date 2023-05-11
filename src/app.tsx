import { useEffect } from 'react'
import { useStore } from './store'
import { Status } from './components/Status'
import { GameBoard } from './components/GameBoard'
import { Room } from './components/Room'

const ROOM = 'elo'

export default function App() {
  const {
    liveblocks: { enterRoom, leaveRoom },
  } = useStore()

  useEffect(() => {
    enterRoom(ROOM)
    return () => leaveRoom(ROOM)
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
