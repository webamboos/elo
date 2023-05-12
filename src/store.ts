import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { liveblocks, type WithLiveblocks } from '@liveblocks/zustand'
import { createClient } from '@liveblocks/client'

const client = createClient({
  publicApiKey: 'pk_dev_99J9QLPzjnp4psln-oXtwfILZ9xX7FTh4rLwLuJBonua88_5ld9MgNZiCuzB8VZb',
})

export const useStore = create<WithLiveblocks<State>>()(
  subscribeWithSelector(
    liveblocks(
      (set, get) => ({
        phase: null,
        openLobby: () => set(() => ({ phase: 'lobby' })),
        startGame: () => set(() => ({ phase: 'game' })),

        user: null,
        roomOwner: null,
        syncUser: () => {
          const user = get().user
          set(() => ({ users: { ...get().users, [user!.id]: user!.name } }))
        },
        setUser: name => {
          const id = crypto.randomUUID()
          const user = { name, id }
          set(() => ({ user }))

          if (!get().roomOwner) {
            set(() => ({ roomOwner: user }))
            get().openLobby()
          }

          set(() => ({ users: { ...get().users, [id]: name } }))
          return user
        },
        loadUser: id => {
          set(() => ({
            user: {
              id: id,
              name: get().users[id],
            },
          }))
        },

        users: {},

        players: [],
        addPlayer: player => set(s => ({ players: [...s.players, player] })),
        removePlayer: player =>
          set(s => ({ players: s.players.filter(p => p.title !== player.title) })),
        updatePlayer: player =>
          set(s => ({ players: s.players.map(p => (p.title === player.title ? player : p)) })),

        results: [],
        addResult: result => set(s => ({ results: [...s.results, { ...result, ts: Date.now() }] })),

        game: {
          home: null,
          away: null,
        },
        updateGamePlayer: (type, player) => {
          set({ game: { ...get().game, [type]: player } })
        },
        newGame: () => {
          const otherPlayers = get().players.filter(p => p.createdBy !== get().user!.id)
          const orderByGames = [...otherPlayers].sort((a, b) => {
            return b.wins + b.losses - (a.wins + a.losses)
          })

          const home = orderByGames[orderByGames.length - 1]
          if (!home) {
            return {}
          }

          const gamesWithHome = get().results.filter(r =>
            [r.home.title, r.away.title].includes(home.title)
          )

          // always choose the opponent with which the home player has played the least games
          const restOfPlayers = orderByGames
            .filter(p => p.title !== home.title)
            .map(player => ({
              ...player,
              gamesAgainst: gamesWithHome.filter(r =>
                [r.home.title, r.away.title].includes(player.title)
              ),
            }))
            .sort((a, b) => {
              return a.gamesAgainst.length - b.gamesAgainst.length
            })

          const away = restOfPlayers[0]

          set(() => ({ game: { home, away } }))
        },

        reset: () =>
          set(() => ({
            players: [],
            results: [],
            game: { home: null, away: null },
            phase: 'lobby',
          })),

        isolatedPlayer: null,
        isolate: player => set(() => ({ isolatedPlayer: player })),
      }),
      {
        client,
        storageMapping: { players: true, results: true, users: true, phase: true, roomOwner: true },
      }
    )
  )
)

type GameType = 'home' | 'away'

interface State {
  phase: 'lobby' | 'game' | null
  openLobby: () => void
  startGame: () => void

  user: User | null
  roomOwner: User | null
  setUser: (user: string) => User
  loadUser: (id: string) => void
  syncUser: () => void

  users: Record<string, string>

  players: Player[]
  addPlayer: (player: Player) => void
  updatePlayer: (player: Player) => void
  removePlayer: (player: Player) => void

  results: GameResult[]
  addResult: (result: Omit<GameResult, 'ts'>) => void

  game: {
    home: Player | null
    away: Player | null
  }
  updateGamePlayer: (type: GameType, player: Player) => void
  newGame: () => void

  reset: () => void

  isolatedPlayer: Player | null
  isolate: (player: Player | null) => void
}

export interface User {
  id: string
  name: string
}

export interface Player {
  title: string
  score: number
  wins: number
  losses: number
  createdBy: User['id']
}

export interface GameResult {
  home: Player & { win: boolean }
  away: Player & { win: boolean }
  voter?: User
  delta: number
  ts: number
}
