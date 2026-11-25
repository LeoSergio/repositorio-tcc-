import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { erro } from '@/lib/server/api'
import { ehUuid } from '@/lib/validacao'

// Download público do PDF. O bucket é privado, então esta rota é o único caminho:
// ela confere no servidor se o trabalho está publicado, autorizado e fora do embargo
// e só então gera um link temporário (60 s). Usa a secret key, por isso a checagem
// precisa ser feita aqui, no código, e não pelo RLS.
export async function GET(request, { params }) {
  const { id } = await params
  if (!ehUuid(id)) return erro('Identificador inválido.', 400)

  const admin = createAdminClient()

  const { data: t, error } = await admin
    .from('trabalhos')
    .select('arquivo_path, titulo, status, autorizacao_publicacao, embargo_ate, deleted_at')
    .eq('id', id)
    .maybeSingle()
  if (error) {
    console.error('Erro no download:', error)
    return erro('Erro interno. Tente novamente.', 500)
  }

  const hoje = new Date().toISOString().slice(0, 10)
  const publico = t && t.status === 'publicado' && !t.deleted_at && t.arquivo_path
  if (!publico) return erro('Trabalho não encontrado.', 404)

  if (!t.autorizacao_publicacao || (t.embargo_ate && t.embargo_ate > hoje)) {
    return erro('O download deste trabalho não está liberado.', 403)
  }

  const nomeArquivo =
    t.titulo
      .normalize('NFD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80) || 'trabalho'

  const { data, error: erroLink } = await admin.storage
    .from('trabalhos')
    .createSignedUrl(t.arquivo_path, 60, { download: `${nomeArquivo}.pdf` })
  if (erroLink || !data?.signedUrl) return erro('Não foi possível gerar o download.', 500)

  return NextResponse.redirect(data.signedUrl)
}
