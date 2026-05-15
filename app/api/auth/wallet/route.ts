import { NextRequest, NextResponse } from 'next/server'
import { verifyMessage } from 'ethers'
import { createClient } from '@/lib/supabase/server'
import { getBlockDAGBalance } from '@/lib/blockdag'

export async function POST(request: NextRequest) {
  try {
    const { address, message, signature } = await request.json()

    // Validate inputs
    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the signature
    const recoveredAddress = verifyMessage(message, signature)
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Create or get user profile in Supabase
    const supabase = await createClient()

    // First, try to find existing profile
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', address.toLowerCase())
      .single()

    let profile

    if (selectError && selectError.code !== 'PGRST116') {
      // Error other than "not found"
      console.error('[v0] Error querying profile:', selectError)
      return NextResponse.json(
        { error: 'Failed to retrieve profile' },
        { status: 500 }
      )
    }

    let isNewUser = false

    if (!existingProfile) {
      isNewUser = true
      // Create new profile with temporary username
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          username: `Cyber_${address.slice(2, 10).toUpperCase()}`,
          wallet_address: address.toLowerCase(),
          bites: 0,
          bites_per_second: 0,
          prestige_level: 0,
          total_clicks: 0,
          lifetime_bites: 0,
          username_set: false,
        })
        .select()
        .single()

      if (insertError) {
        console.error('[v0] Error creating profile:', insertError)
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        )
      }

      profile = newProfile
    } else {
      profile = existingProfile
      isNewUser = !profile.username_set
    }

    // Fetch BlockDAG balance
    let blockdagBalance = null
    try {
      const balanceData = await getBlockDAGBalance(address)
      blockdagBalance = balanceData.balance
    } catch (balanceError) {
      console.error('[v0] Error fetching BlockDAG balance:', balanceError)
      // Don't fail auth if balance fetch fails, just continue without it
    }

    // Create custom JWT token with wallet address claim
    const token = await createCustomToken(address)

    return NextResponse.json({
      success: true,
      profile,
      token,
      address: address.toLowerCase(),
      blockdagBalance,
      isNewUser,
    })
  } catch (error: any) {
    console.error('[v0] Wallet auth error:', error)
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Simple JWT token creation (in production, use a proper JWT library with secret)
async function createCustomToken(walletAddress: string): Promise<string> {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64url')

  const payload = Buffer.from(
    JSON.stringify({
      wallet_address: walletAddress.toLowerCase(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  ).toString('base64url')

  // In production, sign with actual secret
  const signature = Buffer.from('dev-signature').toString('base64url')

  return `${header}.${payload}.${signature}`
}
