'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap, ArrowLeft, Loader2, UserPlus } from 'lucide-react'

export default function SignUpPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          username: username,
        },
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    router.push('/auth/sign-up-success')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      <motion.div
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back button */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-mono text-sm">Back</span>
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 border-2 border-accent mb-4"
            animate={{
              boxShadow: [
                '0 0 20px oklch(0.7 0.25 320 / 0.3)',
                '0 0 40px oklch(0.7 0.25 320 / 0.5)',
                '0 0 20px oklch(0.7 0.25 320 / 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <UserPlus className="w-8 h-8 text-accent" />
          </motion.div>
          <h1 className="text-3xl font-bold neon-text-pink font-[family-name:var(--font-orbitron)]">
            NEW IDENTITY
          </h1>
          <p className="text-muted-foreground font-mono mt-2">
            Create your cyber operator profile
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="text-sm font-mono text-muted-foreground block mb-2">
              OPERATOR NAME
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="CyberPhantom_42"
              required
              minLength={3}
              maxLength={20}
              className="bg-card border-border/50 focus:border-accent"
            />
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              3-20 characters, your display name in the network
            </p>
          </div>

          <div>
            <label className="text-sm font-mono text-muted-foreground block mb-2">
              EMAIL ADDRESS
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@neon.io"
              required
              className="bg-card border-border/50 focus:border-accent"
            />
          </div>

          <div>
            <label className="text-sm font-mono text-muted-foreground block mb-2">
              PASSWORD
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              minLength={6}
              className="bg-card border-border/50 focus:border-accent"
            />
          </div>

          {error && (
            <motion.p
              className="text-destructive text-sm font-mono bg-destructive/10 border border-destructive/50 rounded-lg p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Identity...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Initialize Profile
              </>
            )}
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-muted-foreground font-mono text-sm mt-6">
          Already have an identity?{' '}
          <Link href="/auth/login" className="text-accent hover:underline">
            Access Portal
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
