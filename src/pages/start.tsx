import { Route, useNavigate, useSearch } from '@tanstack/router'
import { root } from './_root'
import { useForm } from 'react-hook-form'
import { useStore } from '../store'
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
    liveblocks: { connection },
    setUser,
  } = useStore()

  const onSubmit = handleSubmit(async input => {
    const user = setUser(input.name)
    localStorage.setItem(input.room, user.id)

    await nav({ to: '/lobby', search: { room: input.room } })
    await nav({ to: '/lobby', search: { room: input.room } })
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
