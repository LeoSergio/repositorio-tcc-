import { createPublicClient } from '@/lib/supabase/publico'

export const POR_PAGINA = 10

const COLUNAS_LISTA = 'id, titulo, resumo, ano, curso, autor, orientador, palavras_chave, published_at'

// Busca no acervo. Todos os filtros são opcionais.
// "q" usa a busca de texto do Postgres (coluna "busca", idioma português).
export async function buscarNoAcervo({ q, curso, ano, pagina = 1 }) {
  const supabase = createPublicClient()
  const de = (pagina - 1) * POR_PAGINA

  let consulta = supabase
    .from('acervo_publico')
    .select(COLUNAS_LISTA, { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(de, de + POR_PAGINA - 1)

  if (q) consulta = consulta.textSearch('busca', q, { type: 'websearch', config: 'portuguese' })
  if (curso) consulta = consulta.eq('curso', curso)
  if (ano) consulta = consulta.eq('ano', ano)

  const { data, count, error } = await consulta
  return { trabalhos: data ?? [], total: count ?? 0, error }
}

// Opções dos filtros: cursos cadastrados e anos que existem no acervo
export async function opcoesDeFiltro() {
  const supabase = createPublicClient()
  const [{ data: cursos }, { data: anos }] = await Promise.all([
    supabase.from('cursos').select('nome').eq('ativo', true).order('nome'),
    supabase.from('acervo_publico').select('ano').order('ano', { ascending: false }),
  ])
  return {
    cursos: (cursos ?? []).map((c) => c.nome),
    anos: [...new Set((anos ?? []).map((a) => a.ano).filter(Boolean))],
  }
}

export async function buscarPublicado(id) {
  const supabase = createPublicClient()
  return await supabase
    .from('acervo_publico')
    .select('id, titulo, resumo, palavras_chave, ano, curso, autor, orientador, licenca, published_at, download_liberado')
    .eq('id', id)
    .maybeSingle()
}

export async function idsPublicados() {
  const supabase = createPublicClient()
  const { data } = await supabase.from('acervo_publico').select('id')
  return (data ?? []).map((t) => t.id)
}
