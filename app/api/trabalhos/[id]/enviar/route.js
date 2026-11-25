import { autenticarApi, erro, erroDoBanco, resposta } from '@/lib/server/api'
import { ehUuid } from '@/lib/validacao'
import { enviarParaRevisao } from '@/lib/server/trabalhos'

// POST envia o trabalho para revisão do orientador.
// Se faltar resumo, ano, curso, orientador ou PDF, o gatilho do banco recusa
// com uma mensagem em português, que esta rota repassa com status 422.
export async function POST(request, { params }) {
  const { id } = await params
  if (!ehUuid(id)) return erro('Identificador inválido.', 400)

  const auth = await autenticarApi('aluno')
  if (auth.falha) return auth.falha

  const { data, error } = await enviarParaRevisao(auth.supabase, id)
  if (error) return erroDoBanco(error)
  if (!data) return erro('Trabalho não encontrado ou já enviado.', 404)

  return resposta({ trabalho: data })
}
