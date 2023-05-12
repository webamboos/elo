import { useEffect } from 'react'
import { Player, useStore } from '../store'
import { useElo } from '../util/use-elo'

export const GameBoard = () => {
  const { getRatingDelta } = useElo()
  const players = useStore(s => s.players)
  const user = useStore(s => s.user)

  const { newGame, updatePlayer, addResult } = useStore()
  const game = useStore(s => s.game)

  useEffect(() => {
    if (game.home && game.away) return
    newGame()
  }, [players])

  const onWin = (type: 'home' | 'away') => {
    const winner = game[type]
    const loser = game[type === 'home' ? 'away' : 'home']

    const delta = Math.abs(getRatingDelta(winner!.score, loser!.score, 1))

    const updatedWinner = {
      ...winner!,
      wins: winner!.wins + 1,
      score: winner!.score + delta,
    }
    const updatedLoser = {
      ...loser!,
      losses: loser!.losses + 1,
      score: loser!.score - delta,
    }

    updatePlayer(updatedWinner)
    updatePlayer(updatedLoser)

    addResult({
      home: { ...game.home!, win: type === 'home' },
      away: { ...game.away!, win: type === 'away' },
      voter: user!,
      delta,
    })

    newGame()
  }

  if (!game.home || !game.away)
    return <div className="text-center p-8 bg-amber-100">Add at least 2 players to start</div>

  return (
    <div className="flex bg-gray-100 shadow-inner w-full h-64 py-8 items-center justify-center rounded-lg space-x-8">
      <PlayerCard player={game.home} onSelect={onWin} type="home" />
      <div>vs</div>
      <PlayerCard player={game.away} onSelect={onWin} type="away" />
    </div>
  )
}

function PlayerCard(props: {
  player: Player
  onSelect: (type: 'home' | 'away') => void
  type: 'home' | 'away'
}) {
  const players = useStore(s => s.players)
  const { newGame, updateGamePlayer } = useStore()

  useEffect(() => {
    const currentPlayer = players.find(player => props.player.title === player.title)
    if (!currentPlayer) {
      newGame()
    } else {
      updateGamePlayer(props.type, currentPlayer)
    }
  }, [players])

  return (
    <button
      onClick={() => props.onSelect(props.type)}
      className="h-full w-64 bg-gray-200 border border-gray-300 rounded hover:bg-blue-500 hover:text-white transition transform active:scale-[.98] flex flex-col justify-center items-center"
    >
      <h1 className="text-center font-bold text-xl">{props.player.title}</h1>({props.player.score})
    </button>
  )
}
