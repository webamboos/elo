import { useMemo } from 'react'

import { useForm } from 'react-hook-form'
import { GameResult, Player, useStore } from '../store'

export function Room() {
  return (
    <div className="flex space-x-8 items-start">
      <div className="w-1/3 flex flex-col bg-gray-100 p-4 rounded border border-gray-200">
        <AddPlayerForm />
        <Leaderboard />
      </div>
      <div className="w-2/3 bg-gray-100 rounded border border-gray-200">
        <GameHistory />
      </div>
    </div>
  )
}

function AddPlayerForm() {
  const players = useStore(s => s.players)
  const { addPlayer } = useStore()
  const { handleSubmit, register, reset } = useForm<Player>()

  const onAddPlayer = handleSubmit(values => {
    console.log(values)
    if (players.find(player => player.title === values.title)) return alert('Player already exists')

    addPlayer({
      title: values.title,
      losses: 0,
      score: 1000,
      wins: 0,
    })
    reset()
  })
  return (
    <form onSubmit={onAddPlayer} className="flex flex-col mb-4">
      <div className="flex space-x-2">
        <input {...register('title')} type="text" placeholder="Player name" className="flex-1" />
        <button className="h-full">Add player</button>
      </div>
      <div>
        <small className="text-gray-500">
          Use <kbd className="bg-gray-200 px-1 rounded border border-gray-300">Enter</kbd> to add a
          player quickly
        </small>
      </div>
    </form>
  )
}

function Leaderboard() {
  const players = useStore(s => s.players)

  const leaderboards = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score)
  }, [players])

  return (
    <table className="text-left">
      <thead>
        <tr>
          <th>Player</th>
          <th className="text-right">W</th>
          <th className="text-right">L</th>
          <th className="text-right">W/L</th>
          <th className="text-right">Rating</th>
        </tr>
      </thead>
      <tbody>
        {leaderboards.map((player, index) => (
          <LeaderboardPlayer key={player.title} player={player} index={index} />
        ))}
      </tbody>
    </table>
  )
}

function LeaderboardPlayer({ player, index }: { player: Player; index: number }) {
  const isolatedPlayer = useStore(s => s.isolatedPlayer)
  const { removePlayer, isolate } = useStore()

  function toggleIsolation() {
    if (isolatedPlayer?.title === player.title) return isolate(null)
    isolate(player)
  }

  function onDelete() {
    if (confirm(`Do you really want to delete "${player.title}" from everyone?`)) {
      removePlayer(player)
    }
  }

  return (
    <tr className={isolatedPlayer && isolatedPlayer.title !== player.title ? 'opacity-50' : ''}>
      <td className="flex">
        <div className="pr-1 flex">
          <button title="Remove player" onClick={onDelete}>
            🚫
          </button>
          <button title="Isolate player" onClick={toggleIsolation}>
            👁️
          </button>
        </div>
        <span className="text-gray-400 pr-1 text-right w-4">{index}.</span>{' '}
        <span className="overflow-hidden text-ellipsis w-[24ch] line-clamp-1">{player.title}</span>
      </td>
      <td className="text-right">{player.wins}</td>
      <td className="text-right">{player.losses}</td>
      <td className="text-right">{(player.wins / (player.losses || 1)).toFixed(1)}</td>
      <td className="text-right">{player.score}</td>
    </tr>
  )
}

function GameHistory() {
  const results = useStore(s => s.results)
  const isolatedPlayer = useStore(s => s.isolatedPlayer)

  return (
    <div className="text-left max-h-[32rem] overflow-auto px-2 py-4">
      <h2 className="mb-4 text-2xl font-bold px-2">Results</h2>

      <ul className="list-none m-0 p-0">
        {[...results]
          .filter(r =>
            isolatedPlayer ? [r.away.title, r.home.title].includes(isolatedPlayer.title) : true
          )
          .reverse()
          .map(result => (
            <ResultRow key={result.ts} result={result} />
          ))}
      </ul>
    </div>
  )
}

function ResultRow({ result }: { result: GameResult }) {
  return (
    <li className="m-0 p-0 flex justify-between h-10 items-center hover:bg-gray-200 rounded transition px-2">
      <div className="flex w-3/7">
        <div className="w-8 text-left">{result.home.win && '🏆'}</div>
        <div className="w-12 text-left text-amber-500 font-bold">{result.home.score}</div>

        <div className="w-12 tabular-nums text-sm h-6 flex items-center px-2 rounded-full bg-gray-200 text-center justify-center mr-2">
          {result.home.win ? '+' : '-'}
          {result.delta}
        </div>

        <div className="w-[24ch] overflow-hidden line-clamp-1 text-ellipsis">
          {result.home.title}
        </div>
      </div>

      <div className="flex flex-col w-1/7 w-32 items-center justify-center">
        <small className="ml-2 text-gray-500 space-x-4 text-xs flex flex-col">
          <time>{new Date(result.ts).toDateString()}</time>
          <time>{new Date(result.ts).toLocaleTimeString()}</time>
        </small>
      </div>

      <div className="flex w-3/7 justify-end">
        <div className="w-[24ch] overflow-hidden line-clamp-1 text-ellipsis text-right">
          {result.away.title}
        </div>
        <div className="w-12 tabular-nums text-sm h-6 flex items-center px-2 rounded-full bg-gray-200 text-center justify-center ml-2">
          {result.away.win ? '+' : '-'}
          {result.delta}
        </div>
        <div className="w-12 text-right text-amber-500 font-bold">{result.away.score}</div>
        <div className="w-8 text-right">{result.away.win && '🏆'}</div>
      </div>
    </li>
  )
}
