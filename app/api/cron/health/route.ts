import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Cron routes are reachable',
    timestamp: new Date().toISOString(),
  })
}
