'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Zap, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function WalletRegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Get address from localStorage or searchParams
    const storedAddress = localStorage.getItem('wallet_address')
    const paramAddress = searchParams.get('address')
    
    if (storedAddress) {
      setAddress(storedAddress)
    } else if (paramAddress) {
      setAddress(paramAddress)
    } else {
      // No address found, redirect to wallet login
      router.push('/auth/wallet-login')
    }
  }, [searchParams, router])

  const validateUsername = (value: string): string | null => {
    if (value.length < 3) {
      return 'Username must be at least 3 characters'
    }
    if (value.length > 20) {
      return 'Username must be at most 20 characters'
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens'
    }
    return null
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address) {
      setError('Wallet address not found. Please reconnect your wallet.')
      return
    }

    const validationError = validateUsername(username)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/wallet/update-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          username,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set username')
      }

      setSuccess(true)

      // Redirect to game immediately after username is set
      setTimeout(() => {
        // Clear wallet tokens as we're now using Supabase session
        localStorage.removeItem('wallet_token')
        localStorage.removeItem('wallet_address')
        localStorage.removeItem('blockdag_balance')
        router.push('/game')
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to set username')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link href="/auth/wallet-login" className="inline-flex items-center text-muted-foreground hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="font-mono text-sm">Back</span>
        </Link>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-3xl font-bold text-primary">NEON BITE</h1>
          </div>
          <p className="text-muted-foreground">Choose your operator name</p>
        </div>

        {/* Form Container */}
        <div className="bg-card border border-primary/20 rounded-lg p-8 backdrop-blur-sm">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-green-400">Identity Confirmed!</h2>
              <p className="text-muted-foreground">
                Welcome, <span className="text-primary font-bold">{username}</span>!
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to the game...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Wallet Address Info */}
              {address && (
                <div className="p-3 bg-primary/10 border border-primary/50 rounded text-primary text-sm mb-4">
                  <p className="font-mono">
                    Wallet: {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="text-sm font-mono text-muted-foreground block mb-2">
                  OPERATOR NAME
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="CyberPhantom_42"
                  autoFocus
                  minLength={3}
                  maxLength={20}
                  disabled={isLoading}
                  className="bg-background border-border/50 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  3-20 characters • Letters, numbers, underscores, hyphens only
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/50 rounded text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || username.length < 3}
                className="w-full bg-primary hover:bg-primary/90 text-foreground font-bold py-6 rounded-lg transition-all"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirming Identity...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Confirm Identity
                  </>
                )}
              </Button>

              {/* Info Box */}
              <div className="bg-background/50 border border-muted-foreground/20 rounded p-4 text-sm text-muted-foreground">
                <p className="mb-2">
                  Your operator name is your identity in the NEON BITE network.
                </p>
                <p>
                  Choose something memorable and unique!
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-muted-foreground hover:text-primary text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function WalletRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <WalletRegisterContent />
    </Suspense>
  )
}
