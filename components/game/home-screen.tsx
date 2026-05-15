'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/lib/game-store'
import { NeonCore } from './neon-core'
import { StatsDisplay } from './stats-display'
import { ParticleBackground } from './particle-background'

export function HomeScreen() {
  const { signOut } = useGameStore()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    window.location.href = '/'
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background particles */}
      <ParticleBackground />
      
      {/* Top header with logout button */}
      <div className="absolute top-0 right-0 pt-4 pr-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="w-4 h-4 mr-1" />
          {isSigningOut ? 'Exit...' : 'Exit'}
        </Button>
      </div>
      
      {/* Stats at top */}
      <div className="w-full mb-8">
        <StatsDisplay />
      </div>

      {/* Central Neon Core */}
      <div className="flex-1 flex items-center justify-center">
        <NeonCore />
      </div>
    </motion.div>
  )
}
