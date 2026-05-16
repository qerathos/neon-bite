import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.headers.get('X-Wallet-Address')?.toLowerCase()
    const walletToken = request.headers.get('X-Wallet-Token')

    if (!walletAddress || !walletToken) {
      return NextResponse.json(
        { error: 'Missing wallet headers' },
        { status: 401 }
      )
    }

    // Fetch the user's profile from the database
    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (error) {
      console.error('[v0] Error fetching profile:', error)
      return NextResponse.json(
        { error: 'Failed to retrieve profile' },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error: any) {
    console.error('[v0] Profile endpoint error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
