import { createClient } from '@supabase/supabase-js'

// Cliente para dados públicos: usa só a chave publishable e NÃO lê cookies.
// Por isso pode ser usado em páginas estáticas (SSG/ISR) e no generateStaticParams.
// O acesso é limitado pelo banco: o papel "anon" só enxerga a view acervo_publico e os cursos.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
