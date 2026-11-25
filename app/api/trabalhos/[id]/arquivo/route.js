import { NextResponse } from 'next/server'
import { autenticarApi, erro, erroDoBanco, lerJson, resposta } from '@/lib/server/api'
import { ehUuid } from '@/lib/validacao'
import { caminhoValido, registrarVersao } from '@/lib/server/trabalhos'

// GET abre o PDF do trabalho por um link temporário (60 segundos).
// Quem pode ver é decidido pelo banco: o aluno vê o seu, o orientador vê o dos seus
// orientandos e a coordenação vê todos.
export async function GET(request, { params }) {
  const { id } = await params
  if (!ehUuid(id)) return erro('Identificador inválido.', 400)

  const auth = await autenticarApi()
  if (auth.falha) return auth.falha

  const { data: trabalho, error } = await auth.supabase
    .from('trabalhos')
    .select('id, arquivo_path')
    .eq('id', id)
    .maybeSingle()
  if (error) return erroDoBanco(error)
  if (!trabalho) return erro('Trabalho não encontrado.', 404)
  if (!trabalho.arquivo_path) return erro('Nenhum PDF enviado para este trabalho.', 404)

  const { data, error: erroLink } = await auth.supabase.storage
    .from('trabalhos')
    .createSignedUrl(trabalho.arquivo_path, 60)
  if (erroLink || !data?.signedUrl) return erro('Não foi possível abrir o PDF.', 500)

  return NextResponse.redirect(data.signedUrl)
}

// POST registra uma nova versão depois que o navegador enviou o PDF ao Storage.
// Corpo: { "caminho": "{id-do-aluno}/{id-do-trabalho}/{nome}.pdf" }
export async function POST(request, { params }) {
  const { id } = await params
  if (!ehUuid(id)) return erro('Identificador inválido.', 400)

  const auth = await autenticarApi('aluno')
  if (auth.falha) return auth.falha

  const corpo = await lerJson(request)
  if (!corpo || !caminhoValido(corpo.caminho, auth.user.id, id)) {
    return erro('Caminho do arquivo inválido.', 400)
  }

  const { data, error, numero } = await registrarVersao(auth.supabase, {
    trabalhoId: id,
    userId: auth.user.id,
    caminho: corpo.caminho,
  })
  if (error) return erroDoBanco(error)
  if (!data) return erro('Trabalho não encontrado ou não pode mais receber PDF.', 404)

  return resposta({ trabalho: data, versao: numero }, 201)
}
