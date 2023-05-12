import { useMemo } from 'react'
import { useStore } from '../store'

export function RoomStatus() {
  const others = useStore(s => s.liveblocks.others)
  const user = useStore(s => s.user)
  const roomOwner = useStore(s => s.roomOwner)
  const isOwner = useMemo(() => user?.id === roomOwner?.id, [user, roomOwner])

  const { reset } = useStore()

  function onReset() {
    if (confirm('Are you sure? This will reset the session for everyone')) {
      reset()
    }
  }

  return (
    <div>
      Hi {user?.name}! {others.length} other player(s) are online.{' '}
      {isOwner && (
        <button className="text-red-5 underline font-bold underline-dashed" onClick={onReset}>
          Reset session ⚠️
        </button>
      )}
    </div>
  )
}
