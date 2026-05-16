'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/game/game-layout'
import { Loader2 } from 'lucide-react'

export default function GamePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for wallet authentication
        const walletAddress = localStorage.getItem('wallet_address')
        const walletToken = localStorage.getItem('wallet_token')

        if (!walletAddress || !walletToken) {
          // Not authenticated, redirect to wallet login
          router.push('/auth/wallet-login')
          return
        }

        // Fetch the user's profile to get their ID
        const response = await fetch('/api/profile', {
          headers: {
            'X-Wallet-Address': walletAddress,
            'X-Wallet-Token': walletToken,
          },
        })

        if (!response.ok) {
          // Profile not found, redirect to wallet login
          router.push('/auth/wallet-login')
          return
        }

        const { profile } = await response.json()
        setUserId(profile.id)
      } catch (error) {
        console.error('[v0] Auth check error:', error)
        router.push('/auth/wallet-login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!userId) {
    return null
  }

  return <GameLayout userId={userId} />
}
