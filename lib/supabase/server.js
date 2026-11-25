import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente para Server Components, Server Actions e Route Handlers.
// Age COM a sessão de quem está logado, então o RLS do banco vale.
// No Next.js 15, cookies() é assíncrona, por isso a função é async.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Em Server Components não dá para gravar cookies.
            // Tudo bem: o middleware já renova a sessão a cada requisição.
          }
        },
      },
    }
  )
}
