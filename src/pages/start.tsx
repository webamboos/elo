import { Route, useNavigate, useSearch } from '@tanstack/router'
import { root } from './_root'
import { useForm } from 'react-hook-form'
import { useStore } from '../store'
import { useEffect } from 'react'
import { Button } from '../components/button'
import { Input } from '../components/input'

interface LoginForm {
  room: string
  name: string
}

function Start() {
  const query = useSearch({ from: '/' })
  const nav = useNavigate()
  const { register, handleSubmit } = useForm<LoginForm>({
    defaultValues: {
      room: query.room || '',
    },
  })

  const {
    liveblocks: { enterRoom, room, connection, leaveRoom },
    setUser,
    syncUser,
  } = useStore()
  const user = useStore(s => s.user)

  useEffect(() => {
    if (query.room) {
      enterRoom(query.room)
      return () => leaveRoom(query.room!)
    }
  }, [query])

  useEffect(() => {
    if (!room) return
    if (query.room && user) {
      nav({ to: '/lobby', search: { room: room.id } })
      nav({ to: '/lobby', search: { room: room.id } })
    }

    room?.subscribe('connection', async event => {
      if (event === 'open') {
        syncUser()
        await nav({ to: '/lobby', search: { room: room.id } })
        await nav({ to: '/lobby', search: { room: room.id } })
      }
    })
  }, [room, user])

  const onSubmit = handleSubmit(input => {
    const user = setUser(input.name)
    localStorage.setItem(input.room, user.id)

    if (!query.room) {
      enterRoom(input.room)
    }
  })

  return (
    <div className="w-full min-h-screen pt-16">
      <form
        className="mx-auto max-w-lg bg-white p-8 rounded border border-gray-200"
        onSubmit={onSubmit}
      >
        <h1 className="text-2xl font-bold mb-4">Welcome!</h1>

        <Input label="Choose a name" {...register('name')} type="text" required className="mb-4" />
        <Input
          label="Type a room name to join"
          {...register('room')}
          type="text"
          required
          className="mb-4"
        />

        <Button disabled={connection === 'connecting'}>Join</Button>
      </form>
    </div>
  )
}

export const start = new Route({
  path: '/',
  getParentRoute: () => root,
  component: Start,
  validateSearch: search => {
    return {
      room: search.room as string | null,
    }
  },
})
