// Helpers de autenticação reutilizáveis (server-side)
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/** Retorna o usuário autenticado ou redireciona para /login */
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user
}

/** Retorna o usuário autenticado ou null (sem redirecionar) */
export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
