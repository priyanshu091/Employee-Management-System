export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export interface GeoResult {
  allowed: boolean
  distanceKm: number
  error?: string
}

export async function checkOfficeProximity(
  officeLat: number,
  officeLng: number,
  allowedRadiusKm: number
): Promise<GeoResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ allowed: false, distanceKm: 0, error: 'Geolocation is not supported by your browser.' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const distanceKm = haversineKm(latitude, longitude, officeLat, officeLng)
        resolve({ allowed: distanceKm <= allowedRadiusKm, distanceKm: Math.round(distanceKm * 10) / 10 })
      },
      (error) => {
        const msg =
          error.code === error.PERMISSION_DENIED
            ? 'Location permission denied. Please allow location access and try again.'
            : 'Unable to get your location. Please try again.'
        resolve({ allowed: false, distanceKm: 0, error: msg })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}
