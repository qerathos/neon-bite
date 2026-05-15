'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Loader2, Zap } from 'lucide-react'
import Link from 'next/link'

export default function WalletLoginPage() {
  const router = useRouter()
  const { address, isConnected, isConnecting, error, balance, connectWallet, signMessage, setBalance } = useWallet()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Auto-authenticate when wallet is connected
  useEffect(() => {
    const authenticate = async () => {
      if (isConnected && address && !isAuthenticating) {
        await handleWalletAuth()
      }
    }
    authenticate()
  }, [isConnected, address])

  const handleWalletConnect = async () => {
    setAuthError(null)
    await connectWallet()
  }

  const handleWalletAuth = async () => {
    if (!address) return

    setIsAuthenticating(true)
    setAuthError(null)

    try {
      // Create a challenge message
      const message = `Sign this message to authenticate to NEON BITE\n\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}`

      // Get user to sign the message
      const signature = await signMessage(message)

      // Send signature to backend for verification
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          message,
          signature,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Authentication failed')
      }

      const data = await response.json()

      // Store token in localStorage
      localStorage.setItem('wallet_token', data.token)
      localStorage.setItem('wallet_address', data.address)

      // Set balance if available
      if (data.blockdagBalance) {
        setBalance(data.blockdagBalance)
        localStorage.setItem('blockdag_balance', data.blockdagBalance)
      }

      // If new user, redirect to username setup, otherwise redirect to game
      if (data.isNewUser) {
        router.push(`/auth/wallet-register?address=${data.address}`)
      } else {
        router.push('/game')
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed')
      setIsAuthenticating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-3xl font-bold text-primary">NEON BITE</h1>
          </div>
          <p className="text-muted-foreground">Connect your wallet to play</p>
        </div>

        {/* Auth Container */}
        <div className="bg-card border border-primary/20 rounded-lg p-8 backdrop-blur-sm">
          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          {authError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded text-red-200 text-sm">
              {authError}
            </div>
          )}

          {isConnected && (
            <div className="mb-4 space-y-2">
              <div className="p-3 bg-primary/10 border border-primary/50 rounded text-primary text-sm">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              {balance && (
                <div className="p-3 bg-green-900/20 border border-green-500/50 rounded text-green-200 text-sm">
                  Balance: {balance} BDAG
                </div>
              )}
            </div>
          )}

          {/* Main Button */}
          <Button
            onClick={handleWalletConnect}
            disabled={isConnecting || isAuthenticating || isConnected}
            className="w-full mb-4 bg-primary hover:bg-primary/90 text-foreground font-bold py-6 rounded-lg transition-all"
            size="lg"
          >
            {isConnecting || isAuthenticating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isConnecting ? 'Connecting...' : 'Authenticating...'}
              </>
            ) : isConnected ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Wallet Connected
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>

          {/* Info Box */}
          <div className="bg-background/50 border border-muted-foreground/20 rounded p-4 text-sm text-muted-foreground">
            <p className="mb-2">
              1. Click "Connect MetaMask" to link your wallet
            </p>
            <p className="mb-2">
              2. Sign the message to verify ownership
            </p>
            <p>
              3. Start playing and earn bites on the blockchain
            </p>
          </div>

          {/* Links */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Don&apos;t have MetaMask?{' '}
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Install it here
              </a>
            </p>
          </div>
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
