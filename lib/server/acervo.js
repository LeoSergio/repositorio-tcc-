import { createPublicClient } from '@/lib/supabase/publico'
import { ORDENACOES } from '@/lib/ordenacoes'

export const POR_PAGINA = 6

const COLUNAS_LISTA =
  'id, titulo, resumo, ano, curso, autor, orientador, palavras_chave, published_at, download_liberado'

// Busca no acervo. Todos os filtros são opcionais.
// "q" e "palavra" usam a busca de texto do Postgres (coluna "busca", idioma português),
// que cobre título, resumo e palavras-chave.
export async function buscarNoAcervo({
  q,
  curso,
  anos = [],
  palavra,
  ordem = 'recentes',
  pagina = 1,
  porPagina = POR_PAGINA,
}) {
  const supabase = createPublicClient()
  const de = (pagina - 1) * porPagina
  const o = ORDENACOES[ordem] ?? ORDENACOES.recentes

  let consulta = supabase
    .from('acervo_publico')
    .select(COLUNAS_LISTA, { count: 'exact' })
    .order(o.coluna, { ascending: o.asc })
    .range(de, de + porPagina - 1)

  if (q) consulta = consulta.textSearch('busca', q, { type: 'websearch', config: 'portuguese' })
  if (palavra) consulta = consulta.textSearch('busca', palavra, { type: 'plain', config: 'portuguese' })
  if (curso) consulta = consulta.eq('curso', curso)
  if (anos.length > 0) consulta = consulta.in('ano', anos)

  const { data, count, error } = await consulta
  return { trabalhos: data ?? [], total: count ?? 0, error }
}

// Opções dos filtros: cursos cadastrados e anos do acervo, com a quantidade de cada um
export async function opcoesDeFiltro() {
  const supabase = createPublicClient()
  const [{ data: cursos }, { data: anos }] = await Promise.all([
    supabase.from('cursos').select('nome').eq('ativo', true).order('nome'),
    supabase.from('acervo_publico').select('ano'),
  ])

  const contagem = new Map()
  for (const { ano } of anos ?? []) {
    if (ano) contagem.set(ano, (contagem.get(ano) ?? 0) + 1)
  }

  return {
    cursos: (cursos ?? []).map((c) => c.nome),
    anos: [...contagem.entries()]
      .map(([ano, quantidade]) => ({ ano, quantidade }))
      .sort((a, b) => b.ano - a.ano),
  }
}

export async function buscarPublicado(id) {
  const supabase = createPublicClient()
  return await supabase
    .from('acervo_publico')
    .select(
      'id, titulo, resumo, palavras_chave, ano, curso, autor, orientador, licenca, published_at, download_liberado',
    )
    .eq('id', id)
    .maybeSingle()
}

export async function idsPublicados() {
  const supabase = createPublicClient()
  const { data } = await supabase.from('acervo_publico').select('id')
  return (data ?? []).map((t) => t.id)
}
