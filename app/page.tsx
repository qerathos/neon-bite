'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap, Users, Trophy, Star, ArrowRight, Cpu, Database, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ParticleBackground } from '@/components/game/particle-background'

const features = [
  {
    icon: Zap,
    title: 'Tap to Harvest',
    description: 'Click the Neon Core to harvest valuable data bytes from the digital void.',
    color: 'text-primary',
  },
  {
    icon: Database,
    title: 'Powerful Upgrades',
    description: 'Unlock 10+ unique upgrades from Neural Taps to Singularity Cores.',
    color: 'text-cyan-400',
  },
  {
    icon: Users,
    title: 'Global MMO',
    description: 'Compete against players worldwide on the live leaderboard.',
    color: 'text-fuchsia-400',
  },
  {
    icon: Star,
    title: 'Prestige System',
    description: 'Reset for permanent bonuses and climb higher than ever before.',
    color: 'text-amber-400',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Logo/Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Logo */}
          <motion.div
            className="relative inline-block mb-6"
            animate={{
              filter: [
                'drop-shadow(0 0 20px oklch(0.75 0.2 160))',
                'drop-shadow(0 0 40px oklch(0.75 0.2 160))',
                'drop-shadow(0 0 20px oklch(0.75 0.2 160))',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary flex items-center justify-center">
              <Cpu className="w-12 h-12 text-primary" />
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold font-[family-name:var(--font-orbitron)] mb-2">
            <span className="neon-text-green">NEON</span>
            <span className="text-foreground"> BITE</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-mono">
            Cyberpunk Idle MMO
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-lg md:text-xl text-center text-muted-foreground max-w-md mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Tap, upgrade, and dominate the neon-drenched digital underground.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/auth/wallet-login">
            <Button size="lg" className="text-lg px-8">
              <Sparkles className="w-5 h-5 mr-2" />
              Connect Wallet & Play
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-3 bg-muted-foreground rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 font-[family-name:var(--font-orbitron)]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="neon-text-cyan">FEATURES</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-card/50 border border-border/50 rounded-2xl p-6 backdrop-blur-sm hover:border-primary/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <feature.icon className={`w-10 h-10 ${feature.color} mb-4`} />
                <h3 className="text-xl font-bold mb-2 font-[family-name:var(--font-orbitron)]">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="relative py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="bg-card/50 border border-amber-500/30 rounded-2xl p-8 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Trophy className="w-8 h-8 text-amber-400" />
              <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-amber-400">
                GLOBAL RANKINGS
              </h2>
            </div>
            <p className="text-center text-muted-foreground mb-6">
              Compete with players worldwide. Climb the leaderboard. Become legendary.
            </p>
            <div className="space-y-3">
              {[1, 2, 3].map((pos) => (
                <div
                  key={pos}
                  className="flex items-center gap-4 bg-background/50 rounded-lg p-3 border border-border/30"
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    pos === 1 ? 'bg-amber-500/20 text-amber-400' :
                    pos === 2 ? 'bg-slate-400/20 text-slate-300' :
                    'bg-amber-700/20 text-amber-600'
                  }`}>
                    {pos}
                  </span>
                  <div className="flex-1">
                    <div className="h-3 bg-muted rounded w-24" />
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    ???B bites
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4 font-mono">
              Sign in to see live rankings
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-[family-name:var(--font-orbitron)]">
            Ready to <span className="neon-text-pink">harvest</span>?
          </h2>
          <Link href="/auth/wallet-login">
            <Button size="lg" className="text-lg px-10">
              <Zap className="w-5 h-5 mr-2" />
              Enter the Grid
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-4 border-t border-border/30">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="font-mono">
            NEON BITE - A Cyberpunk Idle Experience
          </p>
          <p className="font-mono">
            Built with Next.js, Supabase & Framer Motion
          </p>
        </div>
      </footer>
    </div>
  )
}
