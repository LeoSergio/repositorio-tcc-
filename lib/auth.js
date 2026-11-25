import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Para onde cada perfil vai ao abrir /painel
export const DESTINO_POR_PAPEL = {
  aluno: '/painel/meus-trabalhos',
  orientador: '/painel/revisoes',
  coordenador: '/painel/gestao',
  admin: '/painel/gestao',
}

// Lê a sessão e o perfil de quem está logado.
// O cache() evita repetir a consulta quando layout e página pedem o mesmo dado.
export const getSessao = cache(async () => {
  const supabase = await createClient()

  // getUser() valida o token no servidor (não confia só no cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, perfil: null }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('id, nome, papel, curso_id')
    .eq('id', user.id)
    .maybeSingle()

  return { user, perfil: perfil ? { ...perfil, email: user.email } : null }
})

// Exige login. Sem login -> /login. Com login mas sem perfil -> /sem-perfil.
export async function exigirPerfil() {
  const { user, perfil } = await getSessao()
  if (!user) redirect('/login')
  if (!perfil) redirect('/sem-perfil')
  return perfil
}

// Exige login E um dos papéis informados. Ex.: exigirPapel('orientador')
// Quem tem outro papel volta para /painel, que o leva ao lugar certo.
export async function exigirPapel(...papeis) {
  const perfil = await exigirPerfil()
  if (!papeis.includes(perfil.papel)) redirect('/painel')
  return perfil
}
