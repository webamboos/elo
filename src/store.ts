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
        votes: null,
        setVotes: votes => set(() => ({ votes })),
        phase: null,
        openLobby: () => set(() => ({ phase: 'lobby' })),
        startGame: () => set(() => ({ phase: 'game' })),

        user: null,
        roomOwner: null,
        users: {},
        syncUser: () => {
          const user = get().user
          if (!user) return
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

        newGame: ignored => {
          const otherPlayers = get().players.filter(
            p =>
              p.createdBy !== get().user!.id &&
              !ignored?.includes(p.title) &&
              get()
                .results.filter(r => r.voter?.id === get().user?.id)
                .filter(result => [result.home.title, result.away.title].includes(p.title)).length <
                (get().votes ?? 3)
          )

          if (otherPlayers.length === 0) {
            set(() => ({ game: { away: null, home: null } }))
            return
          }

          const orderByGames = [...otherPlayers].sort((a, b) => {
            return b.wins + b.losses - (a.wins + a.losses)
          })

          let chosenPlayerIndex = Date.now() % orderByGames.length
          const home = orderByGames[chosenPlayerIndex]
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
            players: get().players.map(p => ({ ...p, losses: 0, wins: 0, score: 1000 })),
            results: [],
            game: { home: null, away: null },
            phase: 'lobby',
          })),

        isolatedPlayer: null,
        isolate: player => set(() => ({ isolatedPlayer: player })),
      }),
      {
        client,
        storageMapping: {
          players: true,
          results: true,
          users: true,
          phase: true,
          roomOwner: true,
          votes: true,
        },
      }
    )
  )
)

useStore.subscribe(
  state => ({
    room: state.liveblocks.room,
    loading: state.liveblocks.isStorageLoading,
    user: state.user,
  }),
  ({ room, loading, user }) => {
    if (!room || loading) return

    const username = localStorage.getItem(room.id)
    if (!username) return

    if (!user?.name && useStore.getState().users[username]) {
      useStore.getState().loadUser(username)
    }

    if (!useStore.getState().users[username] && user?.name) {
      useStore.getState().syncUser()
    }
  },
  {
    equalityFn: ({ room, loading, user }, { room: room2, loading: loading2, user: user2 }) =>
      `${room?.id}${loading}${user?.id}` === `${room2?.id}${loading2}${user2?.id}`,
  }
)

type GameType = 'home' | 'away'

interface State {
  phase: 'lobby' | 'game' | null
  votes: number | null
  setVotes: (votes: number) => void
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
  newGame: (ignored?: string[]) => void

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
