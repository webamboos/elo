import { useEffect, useMemo, useState } from "react";
import "./App.css";

import { useForm } from "react-hook-form";
import { useElo } from "./use-elo";

interface Player {
  name: string;
  rating: number;
  wins: number;
  losses: number;
}

interface GameResult {
  winner: Player;
  loser: Player;
  winnerDelta: number;
  loserDelta: number;
}

function App() {
  const [game, setGame] = useState<{ home: Player; away: Player }>();
  const [players, setPlayers] = useState<Player[]>([
    { name: "Ben Afflek", rating: 1000, wins: 0, losses: 0 },
    { name: "John Wick", rating: 1000, wins: 0, losses: 0 },
    { name: "Mariah Carey", rating: 1000, wins: 0, losses: 0 },
    { name: "John Travolta", rating: 1000, wins: 0, losses: 0 },
    { name: "Nicholas Cage", rating: 1000, wins: 0, losses: 0 },
    { name: "Eminem", rating: 1000, wins: 0, losses: 0 },
    { name: "Ed Sheeran", rating: 1000, wins: 0, losses: 0 },
  ]);

  const [results, setResults] = useState<GameResult[]>([]);

  const { handleSubmit, register, reset } = useForm<Player>();

  const onSubmit = handleSubmit((values) => {
    if (players.find((player) => player.name === values.name))
      return alert("Player already exists");

    setPlayers((all) => [...all, { ...values, rating: 1000, losses: 0, wins: 0 }]);
    reset()
  });

  function selectRandomPlayers() {
    if(players.length < 2) return
    const homeIndex = Math.floor(Math.random() * players.length);
    let awayIndex = Math.floor(Math.random() * players.length);
    while (awayIndex === homeIndex) {
      awayIndex = Math.floor(Math.random() * players.length);
    }
    return { home: players[homeIndex], away: players[awayIndex] };
  }

  function onWin(
    winner: Player,
    loser: Player,
    winnerDelta: number,
    loserDelta: number
  ) {
    setPlayers((all) =>
      all.sort((a, b) => b.rating - a.rating).map((player) => {
        if (player.name === winner.name) {
          return winner;
        } else if (player.name === loser.name) {
          return loser;
        }

        return player;
      })
    );
    setResults((all) => [...all, { winner, loser, winnerDelta, loserDelta }]);
  }

  useEffect(() => {
    setGame(selectRandomPlayers());
  }, [players]);

  const leaderboards = useMemo(() => {
    return players.sort((a, b) => b.rating - a.rating)
  }, [players])

  function resetGame() {
    setPlayers([])
    setResults([])
  }

  return (
    <div className="flex space-x-4">
      <div className="w-1/3 flex flex-col bg-gray-100 p-4 font-sans">
        <form onSubmit={onSubmit} className="flex flex-col mb-4">
          <div className="flex space-x-2">
          <input
            {...register("name")}
            type="text"
            name="name"
            placeholder="Player name"
            className="flex-1"
          />
          <button className="h-full">Add player</button>
          </div>
          <div>
            <small className="text-gray-500">Use <kbd className="bg-gray-200 px-1 rounded border border-gray-300">Enter</kbd> to add a player quickly</small>
          </div>
        </form>

        <table className="text-left">
          <thead>
            <tr>
              <th>Player</th>
              <th className="text-right">W</th>
              <th className="text-right">L</th>
              <th className="text-right">Rating</th>
            </tr>
          </thead>
          <tbody>
            {leaderboards.map((player) => (
              <tr key={player.name}>
                <td>{player.name}</td>
                <td className="text-right">{player.wins}</td>
                <td className="text-right">{player.losses}</td>
                <td className="text-right">{player.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={resetGame}>Remove all players</button>
        <div className='text-left'>
          <h2>Results</h2>
          <ul className="list-none m-0 p-0 space-y-2">
            {results.map((result, index) => (
              <li key={index} className="m-0 p-0">
                🏆 (+{result.winnerDelta}) <strong>{result.winner.name}</strong> beat <strong>{result.loser.name}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-2/3">
        <div className="flex mb-4">
          <button onClick={() => setGame(selectRandomPlayers())}>Other players please</button>
        </div>
        {game && <Versus home={game.home} away={game.away} onWin={onWin} />}
      </div>
    </div>
  );
}

interface Versus {
  home: Player;
  away: Player;
  onWin: (
    winner: Player,
    loser: Player,
    winnerDelta: number,
    loserDelta: number
  ) => void;
}
function Versus(props: Versus) {
  const { calculate, getRatingDelta } = useElo();
  function onWin(winner: "home" | "away") {
    const loser = winner === "home" ? "away" : "home";
    const newWinnerRating = calculate(
      props[winner].rating,
      props[loser].rating,
      1
    );
    const newLoserRating = calculate(
      props[loser].rating,
      props[winner].rating,
      0
    );

    const winningPlayer = {
      ...props[winner],
      wins: props[winner].wins + 1,
      rating: newWinnerRating,
    };
    const losingPlayer = {
      ...props[loser],
      losses: props[loser].losses + 1,
      rating: newLoserRating,
    };

    props.onWin(
      winningPlayer,
      losingPlayer,
      getRatingDelta(props[winner].rating, props[loser].rating, 1),
      getRatingDelta(props[loser].rating, props[winner].rating, 0)
    );
  }
  return (
    <div className="flex space-x-8">
      <button
        type="button"
        onClick={() => onWin("home")}
        className="w-64 h-96 rounded bg-gray-100 hover:bg-gray-200 border-none font-bold text-xl"
      >
        {props.home.name} [{props.home.rating}]
      </button>
      <button
        type="button"
        onClick={() => onWin("away")}
        className="w-64 h-96 rounded bg-gray-100 hover:bg-gray-200 border-none font-bold text-xl"
      >
        {props.away.name} [{props.away.rating}]
      </button>
    </div>
  );
}

export default App;
