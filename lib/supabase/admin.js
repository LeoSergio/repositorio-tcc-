// Cliente Supabase com privilégios de service_role (somente servidor)
// NUNCA expor para o cliente — use apenas em contextos server-side confiáveis
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
