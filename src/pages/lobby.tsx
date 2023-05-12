import { Route, useNavigate, useRouter, useSearch } from '@tanstack/router'
import { cx } from 'class-variance-authority'
import { root } from './_root'
import { useStore } from '../store'
import { useEffect, useMemo } from 'react'
import { Input } from '../components/input'
import { Button } from '../components/button'
import { useForm } from 'react-hook-form'
import { RoomStatus } from '../components/room-status'

export const lobby = new Route({
  path: 'lobby',
  getParentRoute: () => root,
  validateSearch: search => {
    return {
      room: search.room as string,
    }
  },
  component: Lobby,
})

function Lobby() {
  const query = useSearch({ from: '/lobby' })

  const nav = useNavigate()

  const {
    liveblocks: { room, enterRoom, leaveRoom, isStorageLoading },
    loadUser,
    syncUser,
  } = useStore()
  const phase = useStore(s => s.phase)

  useEffect(() => {
    if (phase === 'game') {
      nav({ to: '/game', search: { room: query.room } })
      nav({ to: '/game', search: { room: query.room } })
    }
  }, [phase, room])

  useEffect(() => {
    if (!('room' in query)) {
      nav({ to: '/' })
      nav({ to: '/' })
      return
    }

    if (!localStorage.getItem(query.room)) {
      nav({ to: '/', search: { room: query.room } })
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
        <h1 className="text-2xl font-bold">Add ideas</h1>
        <RoomStatus />
      </header>
      <main className="flex space-x-4">
        <div className="w-1/3 bg-white rounded p-8 border border-gray-200 self-start">
          <IdeaForm />
        </div>
        <IdeaList className="w-2/3 bg-white rounded p-8 border border-gray-200" />
      </main>
    </section>
  )
}

function IdeaForm({ className }: { className?: string }) {
  const { register, handleSubmit, reset } = useForm<{ idea: string }>()
  const { addPlayer } = useStore()

  const user = useStore(s => s.user)
  const players = useStore(s => s.players)

  const onAdd = handleSubmit(({ idea }) => {
    if (!idea) return

    if (players.find(p => p.title.toLowerCase() === idea.toLowerCase())) {
      alert('Idea was already added, by you or someone else')
      return
    }

    addPlayer({
      title: idea,
      createdBy: user!.id,
      losses: 0,
      score: 1000,
      wins: 0,
    })

    reset()
  })

  return (
    <form className={cx(['flex space-y-2 flex-col', className])} onSubmit={onAdd}>
      <Input label="Idea" {...register('idea')} type="text" />{' '}
      <Button>Add [{players.length} already added]</Button>
    </form>
  )
}

function IdeaList({ className }: { className?: string }) {
  const user = useStore(s => s.user)
  const roomOwner = useStore(s => s.roomOwner)
  const isOwner = useMemo(() => user?.id === roomOwner?.id, [user, roomOwner])
  const { startGame } = useStore()

  const players = useStore(s => s.players)
  const ideas = useMemo(() => players.filter(p => p.createdBy === user!.id), [players, user])

  return (
    <div className={cx([className])}>
      {isOwner && (
        <div className="w-32 mb-8">
          <Button onClick={startGame}>Start game</Button>
        </div>
      )}
      <hr className="mb-8" />
      {!ideas.length && <div className="text-center">Add some ideas</div>}
      <ul>
        {ideas.map(i => (
          <li className="py-2" key={i.title}>
            {i.title}
          </li>
        ))}
      </ul>
      <small className="text-gray-600 mt-4">{players.length} total from everyone</small>
    </div>
  )
}
