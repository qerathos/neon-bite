import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { address, username } = await request.json()

    // Validate inputs
    if (!address || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate username
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 20 characters' },
        { status: 400 }
      )
    }

    // Check if username contains only valid characters
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, underscores, and hyphens' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if username is already taken
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      )
    }

    // Update profile with new username
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        username,
        username_set: true,
      })
      .eq('wallet_address', address.toLowerCase())
      .select()
      .single()

    if (updateError) {
      console.error('[v0] Error updating username:', updateError)
      return NextResponse.json(
        { error: 'Failed to update username' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    })
  } catch (error: any) {
    console.error('[v0] Username update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update username' },
      { status: 500 }
    )
  }
}
