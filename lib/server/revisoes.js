// Acesso ao banco para o professor (orientador). Usa o cliente com a sessão do usuário,
// então o RLS garante que ele só enxerga os trabalhos que orienta.

const COLUNAS =
  'id, titulo, resumo, palavras_chave, ano, curso_id, autor_id, status, arquivo_path, autorizacao_publicacao, created_at, updated_at'

// Trabalhos do orientador, sem rascunhos (o professor só vê o que já foi enviado)
export async function listarTrabalhosDoOrientador(supabase, orientadorId) {
  return await supabase
    .from('trabalhos')
    .select(COLUNAS)
    .eq('orientador_id', orientadorId)
    .neq('status', 'rascunho')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
}

export async function buscarTrabalhoDoOrientador(supabase, id, orientadorId) {
  return await supabase
    .from('trabalhos')
    .select(COLUNAS)
    .eq('id', id)
    .eq('orientador_id', orientadorId)
    .neq('status', 'rascunho')
    .is('deleted_at', null)
    .maybeSingle()
}

// Nomes dos autores (o RLS deixa o orientador ler o perfil dos seus orientandos)
export async function nomesDosAutores(supabase, ids) {
  const unicos = [...new Set(ids)]
  if (unicos.length === 0) return {}
  const { data } = await supabase.from('perfis').select('id, nome').in('id', unicos)
  return Object.fromEntries((data ?? []).map((p) => [p.id, p.nome]))
}

// Chama a função do banco: grava a revisão e muda o status numa única operação.
// Os gatilhos garantem que só trabalhos "em_revisao" podem ser decididos.
export async function decidirRevisao(supabase, { trabalhoId, decisao, texto }) {
  return await supabase.rpc('revisar_trabalho', {
    p_trabalho: trabalhoId,
    p_decisao: decisao,
    p_texto: texto ?? '',
  })
}
