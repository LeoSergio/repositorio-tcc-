import { autenticarApi, erro, erroDoBanco, lerJson, resposta } from '@/lib/server/api'
import { validarTrabalho } from '@/lib/validacao'
import { criarTrabalho, listarTrabalhosDoAutor } from '@/lib/server/trabalhos'

// API própria (receita 19). GET lista os trabalhos do aluno logado.
export async function GET() {
  const auth = await autenticarApi('aluno')
  if (auth.falha) return auth.falha

  const { data, error } = await listarTrabalhosDoAutor(auth.supabase, auth.user.id)
  if (error) return erroDoBanco(error)

  return resposta({ trabalhos: data })
}

// POST cria um rascunho. O autor vem da sessão, nunca do corpo da requisição.
export async function POST(request) {
  const auth = await autenticarApi('aluno')
  if (auth.falha) return auth.falha

  const corpo = await lerJson(request)
  if (!corpo) return erro('Corpo da requisição inválido.', 400)

  const { dados, erros } = validarTrabalho(corpo)
  if (erros.length > 0) return erro(erros.join(' '), 422)

  const { data, error } = await criarTrabalho(auth.supabase, auth.user.id, dados)
  if (error) return erroDoBanco(error)

  return resposta({ trabalho: data }, 201)
}
