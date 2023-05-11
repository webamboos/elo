import { useMemo } from 'react'

import { useForm } from 'react-hook-form'
import { Player, useStore } from '../store'

export function Room() {
  return (
    <div className="flex space-x-8 items-start">
      <div className="w-1/3 flex flex-col bg-gray-100 p-4 font-sans">
        <AddPlayerForm />
        <Leaderboard />
      </div>
      <div className="w-2/3 bg-gray-100">
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
  const { removePlayer } = useStore()
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
          <tr key={player.title}>
            <td>
              <button onClick={() => removePlayer(player)}>🚫</button>
              {index}. {player.title}
            </td>
            <td className="text-right">{player.wins}</td>
            <td className="text-right">{player.losses}</td>
            <td className="text-right">{(player.wins / (player.losses || 1)).toFixed(1)}</td>
            <td className="text-right">{player.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function GameHistory() {
  const results = useStore(s => s.results)

  return (
    <div className="text-left max-h-[32rem] overflow-auto p-4">
      <h2 className="mb-4 text-2xl font-bold">Results</h2>

      <ul className="list-none m-0 p-0 space-y-2">
        {[...results].reverse().map((result, index) => (
          <li key={index} className="m-0 p-0">
            🏆 (+{result.delta}){' '}
            <strong>
              {result.winner.title} ({result.winner.score})
            </strong>{' '}
            won against{' '}
            <strong>
              {result.loser.title} ({result.loser.score})
            </strong>
            <small className="ml-2 text-gray-500 space-x-4">
              <time>{new Date(result.ts).toDateString()}</time>
              <time>{new Date(result.ts).toLocaleTimeString()}</time>
            </small>
          </li>
        ))}
      </ul>
    </div>
  )
}
