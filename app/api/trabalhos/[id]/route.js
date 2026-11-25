import { autenticarApi, erro, erroDoBanco, lerJson, resposta } from '@/lib/server/api'
import { ehUuid, validarTrabalho } from '@/lib/validacao'
import {
  atualizarTrabalho,
  buscarTrabalhoDoAutor,
  excluirTrabalho,
} from '@/lib/server/trabalhos'

// No Next.js 15, "params" é uma Promise e precisa de await.

export async function GET(request, { params }) {
  const { id } = await params
  if (!ehUuid(id)) return erro('Identificador inválido.', 400)

  const auth = await autenticarApi('aluno')
  if (auth.falha) return auth.falha

  const { data, error } = await buscarTrabalhoDoAutor(auth.supabase, id, auth.user.id)
  if (error) return erroDoBanco(error)
  if (!data) return erro('Trabalho não encontrado.', 404)

  return resposta({ trabalho: data })
}

// PUT substitui os dados do trabalho (só enquanto for rascunho ou devolvido)
export async function PUT(request, { params }) {
  const { id } = await params
  if (!ehUuid(id)) return erro('Identificador inválido.', 400)

  const auth = await autenticarApi('aluno')
  if (auth.falha) return auth.falha

  const corpo = await lerJson(request)
  if (!corpo) return erro('Corpo da requisição inválido.', 400)

  const { dados, erros } = validarTrabalho(corpo)
  if (erros.length > 0) return erro(erros.join(' '), 422)

  const { data, error } = await atualizarTrabalho(auth.supabase, id, dados)
  if (error) return erroDoBanco(error)
  if (!data) return erro('Trabalho não encontrado ou não pode mais ser editado.', 404)

  return resposta({ trabalho: data })
}

// DELETE é exclusão lógica (deleted_at)
export async function DELETE(request, { params }) {
  const { id } = await params
  if (!ehUuid(id)) return erro('Identificador inválido.', 400)

  const auth = await autenticarApi('aluno')
  if (auth.falha) return auth.falha

  const { data, error } = await excluirTrabalho(auth.supabase, id)
  if (error) return erroDoBanco(error)
  if (!data) return erro('Trabalho não encontrado ou não pode mais ser excluído.', 404)

  return resposta({ ok: true })
}
