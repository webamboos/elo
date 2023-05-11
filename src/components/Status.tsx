import { useStore } from '../store'

export function Status() {
  const others = useStore(s => s.liveblocks.others)
  const { reset } = useStore()
  function onReset() {
    if (confirm('Are you sure? This will reset the session for everyone')) {
      reset()
    }
  }

  return (
    <div>
      {others.length} other player(s) online.{' '}
      <button className="text-red-5 underline font-bold underline-dashed" onClick={onReset}>
        Reset session ⚠️
      </button>
    </div>
  )
}
