import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Ferramentas comuns às rotas da API (app/api).

export function resposta(dados, status = 200) {
  return NextResponse.json(dados, { status })
}

export function erro(mensagem, status) {
  return NextResponse.json({ erro: mensagem }, { status })
}

// Lê o corpo JSON. Devolve null se estiver ausente ou inválido.
export async function lerJson(request) {
  try {
    const corpo = await request.json()
    return corpo && typeof corpo === 'object' && !Array.isArray(corpo) ? corpo : null
  } catch {
    return null
  }
}

// Camada 2 da proteção, para a API: confere login e papel.
// Uso: const auth = await autenticarApi('aluno'); if (auth.falha) return auth.falha
// Sem papéis informados, basta estar logado (o RLS decide o resto).
export async function autenticarApi(...papeis) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { falha: erro('Faça login para continuar.', 401) }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('id, nome, papel')
    .eq('id', user.id)
    .maybeSingle()
  if (!perfil) return { falha: erro('Perfil não encontrado.', 403) }

  if (papeis.length > 0 && !papeis.includes(perfil.papel)) {
    return { falha: erro('Você não tem permissão para esta ação.', 403) }
  }

  return { supabase, user, perfil }
}

// Transforma um erro do Postgres/Supabase em uma resposta HTTP clara.
// Os gatilhos do banco usam "raise exception" (código P0001) com mensagens
// em português, que podem ser mostradas ao usuário.
export function erroDoBanco(error) {
  switch (error?.code) {
    case '42501':
      return erro('Você não tem permissão para esta ação.', 403)
    case 'P0001':
      return erro(error.message, 422)
    case '23505':
      return erro('Registro duplicado.', 409)
    case '23503':
      return erro('Curso ou orientador inválido.', 422)
    case '23514':
      return erro('Dados inválidos. Confira título, ano e os demais campos.', 422)
    default:
      console.error('Erro do banco:', error)
      return erro('Erro interno. Tente novamente.', 500)
  }
}
