import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Cliente com a SECRET KEY: ignora o RLS e tem acesso total ao banco.
// Use SOMENTE em Route Handlers e Server Actions, para tarefas pontuais
// (por exemplo, gerar o link temporário de um PDF publicado), e sempre
// depois de conferir no código quem pode fazer aquilo.
// O "server-only" faz o build falhar se alguém importar este arquivo
// em um componente que roda no navegador.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
