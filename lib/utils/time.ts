export function calcWorkingHours(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.round((ms / 1000 / 60 / 60) * 100) / 100
}

export function isLate(
  checkInTime: Date,
  officeStart: string,
  graceMinutes: number
): boolean {
  const [h, m] = officeStart.split(':').map(Number)
  const cutoff = new Date(checkInTime)
  cutoff.setHours(h, m + graceMinutes, 0, 0)
  return checkInTime > cutoff
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
