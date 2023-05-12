import { Route, useNavigate, useSearch } from '@tanstack/router'
import { cx } from 'class-variance-authority'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../components/button'
import { Input } from '../components/input'
import { RoomStatus } from '../components/room-status'
import { useStore } from '../store'
import { root } from './_root'

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
    liveblocks: { enterRoom, leaveRoom, isStorageLoading },
    loadUser,
  } = useStore()

  useEffect(
    () =>
      useStore.subscribe(
        s => s.phase,
        phase => {
          if (phase === 'game') {
            nav({ to: '/game', search: { room: query.room } })
            nav({ to: '/game', search: { room: query.room } })
          }
        }
      ),
    []
  )

  useEffect(() => {
    if (!('room' in query)) {
      nav({ to: '/' })
      nav({ to: '/' })
      return
    }

    if (!localStorage.getItem(query.room)) {
      nav({ to: '/', search: { room: query.room } })
      nav({ to: '/', search: { room: query.room } })
      return
    } else {
      const user = localStorage.getItem(query.room)!
      loadUser(user)
    }

    enterRoom(query.room)
    return () => leaveRoom(query.room)
  }, [])

  if (isStorageLoading) {
    return <div className="w-full h-screen flex items-center justify-center">Loading...</div>
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
  const { startGame, setVotes, votes } = useStore()

  const players = useStore(s => s.players)
  const ideas = useMemo(() => players.filter(p => p.createdBy === user!.id), [players, user])

  const { register, handleSubmit } = useForm<{ votes: number }>({
    defaultValues: {
      votes: votes || 3,
    },
  })

  const onChange = handleSubmit(({ votes }) => {
    if (!votes) return
    setVotes(votes)
    startGame()
  })

  return (
    <div className={cx([className])}>
      {isOwner ? (
        <form className="flex space-x-4 items-end mb-8" onSubmit={onChange}>
          <Input label="Total votes per idea/user" {...register('votes')} type="number" />
          <Button>Start game</Button>
        </form>
      ) : (
        <div className="mb-8">Please wait for lobby owner to start.</div>
      )}
      <hr className="mb-8" />
      {!ideas.length && <div className="text-left text-gray-500">Add some ideas</div>}
      <ol className="mb-4 list-decimal pl-6">
        {ideas.map(i => (
          <li className="py-2" key={i.title}>
            {i.title}
          </li>
        ))}
      </ol>
      <small className="text-gray-600 mt-4">{players.length} total from everyone</small>
    </div>
  )
}
