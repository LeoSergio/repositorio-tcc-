import { autenticarApi, erro, erroDoBanco, lerJson, resposta } from '@/lib/server/api'
import { ehUuid } from '@/lib/validacao'
import { decidirRevisao } from '@/lib/server/revisoes'

// POST registra a decisão do orientador.
// Corpo: { "decisao": "aprovado" | "devolvido", "texto": "comentário" }
// Ao devolver, o comentário é obrigatório.
export async function POST(request, { params }) {
  const { id } = await params
  if (!ehUuid(id)) return erro('Identificador inválido.', 400)

  const auth = await autenticarApi('orientador', 'coordenador')
  if (auth.falha) return auth.falha

  const corpo = await lerJson(request)
  if (!corpo) return erro('Corpo da requisição inválido.', 400)

  const decisao = corpo.decisao
  const texto = typeof corpo.texto === 'string' ? corpo.texto.trim() : ''

  if (decisao !== 'aprovado' && decisao !== 'devolvido') {
    return erro('Decisão inválida.', 422)
  }
  if (decisao === 'devolvido' && texto === '') {
    return erro('Informe o motivo da devolução.', 422)
  }
  if (texto.length > 3000) return erro('O comentário pode ter no máximo 3000 caracteres.', 422)

  const { error } = await decidirRevisao(auth.supabase, { trabalhoId: id, decisao, texto })
  if (error) return erroDoBanco(error)

  return resposta({ ok: true, status: decisao })
}
