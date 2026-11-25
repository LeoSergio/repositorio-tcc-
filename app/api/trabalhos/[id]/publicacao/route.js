import { autenticarApi, erro, erroDoBanco, lerJson, resposta } from '@/lib/server/api'
import { ehUuid } from '@/lib/validacao'
import {
  despublicarTrabalho,
  publicarTrabalho,
  validarPublicacao,
} from '@/lib/server/publicacao'

// POST publica ou despublica um trabalho. Só coordenador/admin.
// Corpo: { "acao": "publicar" | "despublicar", "embargo_ate": "AAAA-MM-DD", "licenca": "CC BY" }
export async function POST(request, { params }) {
  const { id } = await params
  if (!ehUuid(id)) return erro('Identificador inválido.', 400)

  const auth = await autenticarApi('coordenador', 'admin')
  if (auth.falha) return auth.falha

  const corpo = await lerJson(request)
  if (!corpo) return erro('Corpo da requisição inválido.', 400)

  if (corpo.acao === 'publicar') {
    const { dados, erros } = validarPublicacao(corpo)
    if (erros.length > 0) return erro(erros.join(' '), 422)

    const { data, error } = await publicarTrabalho(auth.supabase, id, dados)
    if (error) return erroDoBanco(error) // ex.: "Não é possível publicar sem a autorização do autor"
    if (!data) return erro('Trabalho não encontrado ou não está aprovado.', 404)
    return resposta({ trabalho: data })
  }

  if (corpo.acao === 'despublicar') {
    const { data, error } = await despublicarTrabalho(auth.supabase, id)
    if (error) return erroDoBanco(error)
    if (!data) return erro('Trabalho não encontrado ou não está publicado.', 404)
    return resposta({ trabalho: data })
  }

  return erro('Ação inválida.', 422)
}
