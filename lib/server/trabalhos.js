// Acesso ao banco para trabalhos. Todas as funções recebem o cliente do Supabase
// criado com a sessão do usuário (lib/supabase/server.js), então o RLS vale sempre.
// Cada função devolve { data, error } no mesmo estilo do supabase-js.

const COLUNAS =
  'id, titulo, resumo, palavras_chave, ano, curso_id, orientador_id, status, arquivo_path, autorizacao_publicacao, created_at, updated_at'

export async function listarTrabalhosDoAutor(supabase, autorId) {
  return await supabase
    .from('trabalhos')
    .select(COLUNAS)
    .eq('autor_id', autorId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
}

export async function buscarTrabalhoDoAutor(supabase, id, autorId) {
  return await supabase
    .from('trabalhos')
    .select(COLUNAS)
    .eq('id', id)
    .eq('autor_id', autorId)
    .is('deleted_at', null)
    .maybeSingle()
}

// O autor e o status vêm do servidor, nunca do formulário
export async function criarTrabalho(supabase, autorId, dados) {
  return await supabase
    .from('trabalhos')
    .insert({ ...dados, autor_id: autorId, status: 'rascunho' })
    .select(COLUNAS)
    .single()
}

// Se o RLS não permitir (trabalho de outro, ou já enviado), nenhuma linha é
// alterada e data volta null. A rota transforma isso em "não encontrado".
export async function atualizarTrabalho(supabase, id, dados) {
  return await supabase
    .from('trabalhos')
    .update(dados)
    .eq('id', id)
    .is('deleted_at', null)
    .select(COLUNAS)
    .maybeSingle()
}

// Exclusão lógica: o registro continua no banco e pode ser restaurado
export async function excluirTrabalho(supabase, id) {
  return await supabase
    .from('trabalhos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select('id')
    .maybeSingle()
}

// O gatilho do banco confere se resumo, ano, curso, orientador e PDF estão preenchidos
export async function enviarParaRevisao(supabase, id) {
  return await supabase
    .from('trabalhos')
    .update({ status: 'em_revisao' })
    .eq('id', id)
    .is('deleted_at', null)
    .select(COLUNAS)
    .maybeSingle()
}

// O caminho do PDF precisa ser {autor}/{trabalho}/{nome}.pdf, sem subpastas
export function caminhoValido(caminho, userId, trabalhoId) {
  if (typeof caminho !== 'string') return false
  const prefixo = `${userId}/${trabalhoId}/`
  if (!caminho.startsWith(prefixo)) return false
  return /^[A-Za-z0-9-]+\.pdf$/i.test(caminho.slice(prefixo.length))
}

// Registra uma nova versão do PDF (já enviado ao Storage) e aponta o trabalho para ela.
// As versões antigas continuam guardadas: nada é sobrescrito.
export async function registrarVersao(supabase, { trabalhoId, userId, caminho }) {
  const { data: ultimas, error: erroUltima } = await supabase
    .from('trabalho_versoes')
    .select('numero')
    .eq('trabalho_id', trabalhoId)
    .order('numero', { ascending: false })
    .limit(1)
  if (erroUltima) return { data: null, error: erroUltima }

  const numero = (ultimas?.[0]?.numero ?? 0) + 1

  const { error: erroVersao } = await supabase.from('trabalho_versoes').insert({
    trabalho_id: trabalhoId,
    numero,
    arquivo_path: caminho,
    enviado_por: userId,
  })
  if (erroVersao) return { data: null, error: erroVersao }

  const { data, error } = await supabase
    .from('trabalhos')
    .update({ arquivo_path: caminho })
    .eq('id', trabalhoId)
    .is('deleted_at', null)
    .select(COLUNAS)
    .maybeSingle()

  return { data, error, numero }
}

export async function listarRevisoes(supabase, trabalhoId) {
  return await supabase
    .from('revisoes')
    .select('id, decisao, texto, created_at')
    .eq('trabalho_id', trabalhoId)
    .order('created_at', { ascending: false })
}

export async function listarCursos(supabase) {
  return await supabase.from('cursos').select('id, nome').eq('ativo', true).order('nome')
}

export async function listarOrientadores(supabase) {
  return await supabase.from('orientadores').select('id, nome').order('nome')
}
