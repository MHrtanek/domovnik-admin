import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { count } = await supabaseAdmin
    .from('registration_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
  return NextResponse.json({ count: count ?? 0 })
}
