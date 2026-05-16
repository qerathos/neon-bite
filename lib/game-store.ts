import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Upgrade, PlayerUpgrade, Achievement, PlayerAchievement, GameScreen, LeaderboardEntry } from '@/lib/types'

interface GameState {
  // Core game state
  profile: Profile | null
  upgrades: Upgrade[]
  playerUpgrades: Map<number, number>
  achievements: Achievement[]
  unlockedAchievements: Set<number>
  leaderboard: LeaderboardEntry[]
  
  // UI state
  currentScreen: GameScreen
  isLoading: boolean
  isSyncing: boolean
  lastSyncTime: number
  pendingBites: number
  idleLoopStarted: boolean
  
  // Actions
  setScreen: (screen: GameScreen) => void
  initializeGame: (userId: string) => Promise<void>
  addBites: (amount: number) => void
  tap: () => void
  purchaseUpgrade: (upgradeId: number) => Promise<boolean>
  calculateUpgradeCost: (upgrade: Upgrade, owned: number) => number
  syncToDatabase: () => Promise<void>
  checkAchievements: () => Promise<void>
  prestige: () => Promise<void>
  fetchLeaderboard: () => Promise<void>
  signOut: () => Promise<void>
  startIdleLoop: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  profile: null,
  upgrades: [],
  playerUpgrades: new Map(),
  achievements: [],
  unlockedAchievements: new Set(),
  leaderboard: [],
  currentScreen: 'home',
  isLoading: true,
  isSyncing: false,
  lastSyncTime: Date.now(),
  pendingBites: 0,
  idleLoopStarted: false,

  setScreen: (screen) => set({ currentScreen: screen }),

  initializeGame: async (userId: string) => {
    const supabase = createClient()
    set({ isLoading: true })

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Fetch all upgrades
      const { data: upgradesData, error: upgradesError } = await supabase
        .from('upgrades')
        .select('*')
        .order('base_cost', { ascending: true })

      if (upgradesError) throw upgradesError

      // Fetch player's upgrades
      const { data: playerUpgradesData, error: puError } = await supabase
        .from('player_upgrades')
        .select('*')
        .eq('player_id', userId)

      if (puError) throw puError

      // Fetch all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true })

      if (achievementsError) throw achievementsError

      // Fetch player's achievements
      const { data: playerAchievementsData, error: paError } = await supabase
        .from('player_achievements')
        .select('*')
        .eq('player_id', userId)

      if (paError) throw paError

      // Build maps
      const playerUpgradesMap = new Map<number, number>()
      playerUpgradesData?.forEach((pu: PlayerUpgrade) => {
        playerUpgradesMap.set(pu.upgrade_id, pu.quantity)
      })

      const unlockedSet = new Set<number>()
      playerAchievementsData?.forEach((pa: PlayerAchievement) => {
        unlockedSet.add(pa.achievement_id)
      })

      // Calculate BPS from upgrades
      let totalBps = 0
      upgradesData?.forEach((upgrade: Upgrade) => {
        const owned = playerUpgradesMap.get(upgrade.id) || 0
        totalBps += (upgrade.base_income || 0) * owned
      })

      set({
        profile: { ...profileData, bites_per_second: totalBps },
        upgrades: upgradesData || [],
        playerUpgrades: playerUpgradesMap,
        achievements: achievementsData || [],
        unlockedAchievements: unlockedSet,
        isLoading: false,
      })

      // Start the idle income loop
      get().startIdleLoop()
    } catch (error) {
      console.error('Failed to initialize game:', error)
      set({ isLoading: false })
    }
  },

  startIdleLoop: () => {
    const { idleLoopStarted } = get()
    if (idleLoopStarted) return // Prevent multiple loops
    
    set({ idleLoopStarted: true })
    
    // This runs every 100ms to add idle income
    setInterval(() => {
      const { profile } = get()
      if (profile && profile.bites_per_second > 0) {
        const bpsPerTick = profile.bites_per_second / 10
        get().addBites(bpsPerTick)
      }
    }, 100)

    // Sync to database every 10 seconds
    setInterval(() => {
      const { pendingBites } = get()
      if (pendingBites > 0) {
        get().syncToDatabase()
      }
    }, 10000)
  },

  addBites: (amount: number) => {
    set((state) => {
      if (!state.profile) return state
      return {
        profile: {
          ...state.profile,
          bites: state.profile.bites + amount,
          lifetime_bites: state.profile.lifetime_bites + amount,
        },
        pendingBites: state.pendingBites + amount,
      }
    })
  },

  tap: () => {
    const { profile, addBites } = get()
    if (!profile) return

    // Base tap = 1, plus prestige bonus
    const prestigeMultiplier = 1 + (profile.prestige_level * 0.1)
    const tapValue = Math.ceil(1 * prestigeMultiplier)
    
    addBites(tapValue)
    
    set((state) => ({
      profile: state.profile ? {
        ...state.profile,
        total_clicks: state.profile.total_clicks + 1,
      } : null,
    }))

    // Check achievements periodically
    if ((profile.total_clicks + 1) % 10 === 0) {
      get().checkAchievements()
    }
  },

  calculateUpgradeCost: (upgrade: Upgrade, owned: number) => {
    return Math.floor(upgrade.base_cost * Math.pow(upgrade.cost_multiplier, owned))
  },

  purchaseUpgrade: async (upgradeId: number) => {
    const { profile, upgrades, playerUpgrades, calculateUpgradeCost } = get()
    if (!profile) return false

    const upgrade = upgrades.find(u => u.id === upgradeId)
    if (!upgrade) return false

    const owned = playerUpgrades.get(upgradeId) || 0
    const cost = calculateUpgradeCost(upgrade, owned)

    if (profile.bites < cost) return false

    // Deduct cost and add upgrade
    const newOwned = owned + 1
    const newBps = profile.bites_per_second + (upgrade.base_income || 0)
    
    set((state) => {
      const newMap = new Map(state.playerUpgrades)
      newMap.set(upgradeId, newOwned)
      return {
        profile: state.profile ? {
          ...state.profile,
          bites: state.profile.bites - cost,
          bites_per_second: newBps,
        } : null,
        playerUpgrades: newMap,
      }
    })

    // Sync to database
    const supabase = createClient()
    
    try {
      await supabase
        .from('profiles')
        .update({ 
          bites: profile.bites - cost,
          bites_per_second: newBps,
        })
        .eq('id', profile.id)

      await supabase
        .from('player_upgrades')
        .upsert({
          player_id: profile.id,
          upgrade_id: upgradeId,
          quantity: newOwned,
        }, {
          onConflict: 'player_id,upgrade_id'
        })

      get().checkAchievements()
      return true
    } catch (error) {
      console.error('Failed to purchase upgrade:', error)
      return false
    }
  },

  syncToDatabase: async () => {
    const { profile, pendingBites, isSyncing } = get()
    if (!profile || isSyncing || pendingBites === 0) return

    set({ isSyncing: true })
    const supabase = createClient()

    try {
      await supabase
        .from('profiles')
        .update({
          bites: profile.bites,
          lifetime_bites: profile.lifetime_bites,
          total_clicks: profile.total_clicks,
          bites_per_second: profile.bites_per_second,
          last_active: new Date().toISOString(),
        })
        .eq('id', profile.id)

      set({ pendingBites: 0, lastSyncTime: Date.now() })
    } catch (error) {
      console.error('Failed to sync:', error)
    } finally {
      set({ isSyncing: false })
    }
  },

  checkAchievements: async () => {
    const { profile, achievements, unlockedAchievements, playerUpgrades } = get()
    if (!profile) return

    const supabase = createClient()
    const newUnlocks: number[] = []

    for (const achievement of achievements) {
      if (unlockedAchievements.has(achievement.id)) continue

      let met = false
      switch (achievement.requirement_type) {
        case 'clicks':
          met = profile.total_clicks >= achievement.requirement_value
          break
        case 'lifetime_bites':
          met = profile.lifetime_bites >= achievement.requirement_value
          break
        case 'upgrades':
          const totalUpgrades = Array.from(playerUpgrades.values()).reduce((a, b) => a + b, 0)
          met = totalUpgrades >= achievement.requirement_value
          break
        case 'prestige':
          met = profile.prestige_level >= achievement.requirement_value
          break
        case 'bps':
          met = profile.bites_per_second >= achievement.requirement_value
          break
      }

      if (met) {
        newUnlocks.push(achievement.id)
        
        // Award reward bites
        if (achievement.reward_bites > 0) {
          get().addBites(achievement.reward_bites)
        }
      }
    }

    if (newUnlocks.length > 0) {
      // Update local state
      set((state) => {
        const newSet = new Set(state.unlockedAchievements)
        newUnlocks.forEach(id => newSet.add(id))
        return { unlockedAchievements: newSet }
      })

      // Save to database
      try {
        await supabase
          .from('player_achievements')
          .insert(
            newUnlocks.map(id => ({
              player_id: profile.id,
              achievement_id: id,
            }))
          )
      } catch (error) {
        console.error('Failed to save achievements:', error)
      }
    }
  },

  prestige: async () => {
    const { profile } = get()
    if (!profile) return

    // Require at least 1 million lifetime bites to prestige
    const minimumBites = 1000000
    if (profile.lifetime_bites < minimumBites) return

    const supabase = createClient()
    const newPrestigeLevel = profile.prestige_level + 1

    try {
      // Reset progress but keep prestige level
      await supabase
        .from('profiles')
        .update({
          bites: 0,
          bites_per_second: 0,
          prestige_level: newPrestigeLevel,
          total_clicks: profile.total_clicks, // Keep clicks
          lifetime_bites: profile.lifetime_bites, // Keep lifetime
        })
        .eq('id', profile.id)

      // Clear player upgrades
      await supabase
        .from('player_upgrades')
        .delete()
        .eq('player_id', profile.id)

      // Update local state
      set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          bites: 0,
          bites_per_second: 0,
          prestige_level: newPrestigeLevel,
        } : null,
        playerUpgrades: new Map(),
      }))

      get().checkAchievements()
    } catch (error) {
      console.error('Failed to prestige:', error)
    }
  },

  fetchLeaderboard: async () => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('lifetime_bites', { ascending: false })
        .limit(100)

      if (error) throw error

      const leaderboard: LeaderboardEntry[] = (data || []).map((profile: Profile, index: number) => ({
        ...profile,
        position: index + 1,
      }))

      set({ leaderboard })
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    }
  },

  signOut: async () => {
    await get().syncToDatabase()
    
    // Clear wallet authentication
    localStorage.removeItem('wallet_token')
    localStorage.removeItem('wallet_address')
    localStorage.removeItem('blockdag_balance')
    
    set({
      profile: null,
      upgrades: [],
      playerUpgrades: new Map(),
      achievements: [],
      unlockedAchievements: new Set(),
      leaderboard: [],
      currentScreen: 'home',
    })
  },
}))
