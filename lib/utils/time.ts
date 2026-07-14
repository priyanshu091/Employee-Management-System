export function calcWorkingHours(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.round((ms / 1000 / 60 / 60) * 100) / 100
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

export function getTodayIST(): string {
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().split('T')[0]
}

export function getNowIST(): Date {
  return new Date(Date.now() + IST_OFFSET_MS)
}

export function getCurrentISTTime(): { hours: number; minutes: number } {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const istDate = new Date(now.getTime() + istOffset)
  return {
    hours: istDate.getUTCHours(),
    minutes: istDate.getUTCMinutes(),
  }
}

export function timeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':').map(Number)
  return parts[0] * 60 + parts[1]
}

export function isLate(
  checkInTime: Date,
  officeStart: string,
  graceMinutes: number
): boolean {
  // Convert check-in time to IST by adding offset
  const checkInIST = new Date(checkInTime.getTime() + IST_OFFSET_MS)

  // Get IST hours and minutes from check-in
  const checkInHours = checkInIST.getUTCHours()
  const checkInMinutes = checkInIST.getUTCMinutes()
  const checkInTotalMinutes = checkInHours * 60 + checkInMinutes

  // Parse office start time (already in IST)
  const [startH, startM] = officeStart.split(':').map(Number)
  const cutoffTotalMinutes = startH * 60 + startM + graceMinutes

  return checkInTotalMinutes > cutoffTotalMinutes
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function formatWorkingHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function getLiveTimer(checkInISO: string): string {
  const ms = Date.now() - new Date(checkInISO).getTime()
  const totalMinutes = Math.floor(ms / 1000 / 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}m working`
  return `${h}h ${m}m working`
}
