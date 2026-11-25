// Acesso ao banco para a coordenação (publicar e despublicar).
// O RLS e os gatilhos do banco continuam valendo: só coordenador/admin muda
// de aprovado para publicado, e só com a autorização do autor.

export const LICENCAS = ['CC BY', 'CC BY-NC', 'CC BY-NC-ND', 'CC BY-SA', 'Todos os direitos reservados']

const COLUNAS =
  'id, titulo, resumo, palavras_chave, ano, curso_id, autor_id, orientador_id, status, arquivo_path, autorizacao_publicacao, embargo_ate, licenca, published_at, updated_at'

// Aprovados (prontos para publicar) e publicados
export async function listarParaGestao(supabase) {
  return await supabase
    .from('trabalhos')
    .select(COLUNAS)
    .in('status', ['aprovado', 'publicado'])
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
}

export async function buscarParaGestao(supabase, id) {
  return await supabase
    .from('trabalhos')
    .select(COLUNAS)
    .eq('id', id)
    .in('status', ['aprovado', 'publicado'])
    .is('deleted_at', null)
    .maybeSingle()
}

export async function nomesDePerfis(supabase, ids) {
  const unicos = [...new Set(ids.filter(Boolean))]
  if (unicos.length === 0) return {}
  const { data } = await supabase.from('perfis').select('id, nome').in('id', unicos)
  return Object.fromEntries((data ?? []).map((p) => [p.id, p.nome]))
}

export async function publicarTrabalho(supabase, id, { embargo_ate, licenca }) {
  return await supabase
    .from('trabalhos')
    .update({ status: 'publicado', embargo_ate, licenca })
    .eq('id', id)
    .eq('status', 'aprovado')
    .is('deleted_at', null)
    .select('id, status')
    .maybeSingle()
}

export async function despublicarTrabalho(supabase, id) {
  return await supabase
    .from('trabalhos')
    .update({ status: 'aprovado' })
    .eq('id', id)
    .eq('status', 'publicado')
    .is('deleted_at', null)
    .select('id, status')
    .maybeSingle()
}

// Valida embargo (data AAAA-MM-DD, de hoje até 3 anos) e licença
export function validarPublicacao(corpo) {
  const erros = []

  let embargo = null
  const bruto = typeof corpo?.embargo_ate === 'string' ? corpo.embargo_ate.trim() : ''
  if (bruto) {
    const data = new Date(bruto + 'T00:00:00Z')
    const valido = /^\d{4}-\d{2}-\d{2}$/.test(bruto) && !Number.isNaN(data.getTime())
    const limite = new Date()
    limite.setUTCFullYear(limite.getUTCFullYear() + 3)
    if (!valido) erros.push('Data de embargo inválida.')
    else if (data > limite) erros.push('O embargo pode ser de no máximo 3 anos.')
    else embargo = bruto
  }

  let licenca = null
  const l = typeof corpo?.licenca === 'string' ? corpo.licenca.trim() : ''
  if (l) {
    if (!LICENCAS.includes(l)) erros.push('Licença inválida.')
    else licenca = l
  }

  return { erros, dados: { embargo_ate: embargo, licenca } }
}
