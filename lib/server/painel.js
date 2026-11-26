import { listarCursos, listarTrabalhosDoAutor } from '@/lib/server/trabalhos'
import { listarTrabalhosDoOrientador } from '@/lib/server/revisoes'
import { listarParaGestao } from '@/lib/server/publicacao'

// Carrega os dados da Visão Geral (/painel) respeitando o papel e o RLS do usuário.
export async function carregarVisaoGeral(supabase, perfil) {
  const buscaTrabalhos =
    perfil.papel === 'aluno'
      ? listarTrabalhosDoAutor(supabase, perfil.id)
      : perfil.papel === 'orientador'
        ? listarTrabalhosDoOrientador(supabase, perfil.id)
        : listarParaGestao(supabase)

  const [{ data: trabalhos, error }, { data: cursos }] = await Promise.all([
    buscaTrabalhos,
    listarCursos(supabase),
  ])

  const lista = trabalhos ?? []
  const cursosPorId = Object.fromEntries((cursos ?? []).map((c) => [c.id, c.nome]))

  // Busca a maior versão registrada para cada trabalho listado
  const versoesPorTrabalho = {}
  const ids = lista.map((t) => t.id)
  if (ids.length > 0) {
    const { data: versoes } = await supabase
      .from('trabalho_versoes')
      .select('trabalho_id, numero')
      .in('trabalho_id', ids)

    for (const v of versoes ?? []) {
      const atual = versoesPorTrabalho[v.trabalho_id] ?? 0
      if (v.numero > atual) versoesPorTrabalho[v.trabalho_id] = v.numero
    }
  }

  const resumo = {
    rascunho: 0,
    em_revisao: 0,
    devolvido: 0,
    aprovado: 0,
    publicado: 0,
  }
  for (const t of lista) {
    if (t.status in resumo) resumo[t.status] += 1
  }

  return {
    trabalhos: lista,
    cursosPorId,
    versoesPorTrabalho,
    resumo,
    error,
  }
}

// Consulta leve usada pelo layout para exibir contadores e contexto na sidebar.
export async function contarResumoPainel(supabase, perfil) {
  let consulta = supabase.from('trabalhos').select('status').is('deleted_at', null)

  if (perfil.papel === 'aluno') {
    consulta = consulta.eq('autor_id', perfil.id)
  } else if (perfil.papel === 'orientador') {
    consulta = consulta.eq('orientador_id', perfil.id).neq('status', 'rascunho')
  } else {
    consulta = consulta.in('status', ['aprovado', 'publicado'])
  }

  const { data } = await consulta
  const lista = data ?? []

  return {
    total: lista.length,
    em_revisao: lista.filter((t) => t.status === 'em_revisao').length,
    devolvido: lista.filter((t) => t.status === 'devolvido').length,
    aprovado: lista.filter((t) => t.status === 'aprovado').length,
    publicado: lista.filter((t) => t.status === 'publicado').length,
  }
}
