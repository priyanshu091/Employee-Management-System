const requiredServerEnvs = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

const requiredClientEnvs = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

export function validateEnv() {
  if (typeof window === 'undefined') {
    // Server-side validation
    for (const env of requiredServerEnvs) {
      if (!process.env[env]) {
        throw new Error(
          `❌ [ENV VALIDATION FAILED]: Missing required environment variable: ${env}. ` +
          `Please check your .env.local file or deployment settings.`
        )
      }
    }
  } else {
    // Client-side validation
    for (const env of requiredClientEnvs) {
      if (!process.env[env]) {
        console.error(`❌ [ENV VALIDATION FAILED]: Missing required environment variable: ${env}`)
      }
    }
  }
}
