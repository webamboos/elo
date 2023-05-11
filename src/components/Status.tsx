import { useStore } from '../store'

export function Status() {
  const others = useStore(s => s.liveblocks.others)

  return <div>{others.length} other player(s) online</div>
}
