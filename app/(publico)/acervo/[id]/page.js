import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buscarPublicado, idsPublicados } from '@/lib/server/acervo'
import { ehUuid } from '@/lib/validacao'

// Receita 21: rota dinâmica com geração estática (SSG).
// As páginas dos trabalhos publicados são geradas no build e renovadas a cada 60 s (ISR).
// Um trabalho publicado depois do build é gerado na primeira visita (dynamicParams = true).
export const revalidate = 60

export async function generateStaticParams() {
  try {
    const ids = await idsPublicados()
    return ids.map((id) => ({ id }))
  } catch {
    return [] // sem banco no build: as páginas serão geradas sob demanda
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params
  if (!ehUuid(id)) return { title: 'Trabalho não encontrado' }
  const { data } = await buscarPublicado(id)
  if (!data) return { title: 'Trabalho não encontrado' }
  return {
    title: `${data.titulo} | Repositório de TCC`,
    description: data.resumo?.slice(0, 160) ?? undefined,
  }
}

export default async function PaginaDoTrabalho({ params }) {
  const { id } = await params // Next 15: params é uma Promise
  if (!ehUuid(id)) notFound()

  const { data: t } = await buscarPublicado(id)
  if (!t) notFound()

  return (
    <article className="flex flex-col gap-5">
      <Link href="/" className="text-sm underline">
        &larr; Voltar ao acervo
      </Link>

      <h1 className="text-2xl font-semibold">{t.titulo}</h1>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium">Autor</dt>
          <dd>{t.autor}</dd>
        </div>
        <div>
          <dt className="font-medium">Orientador</dt>
          <dd>{t.orientador ?? '—'}</dd>
        </div>
        <div>
          <dt className="font-medium">Curso</dt>
          <dd>{t.curso}</dd>
        </div>
        <div>
          <dt className="font-medium">Ano</dt>
          <dd>{t.ano}</dd>
        </div>
        <div>
          <dt className="font-medium">Licença</dt>
          <dd>{t.licenca ?? 'Não informada'}</dd>
        </div>
        <div>
          <dt className="font-medium">Palavras-chave</dt>
          <dd>{(t.palavras_chave ?? []).join(', ') || '—'}</dd>
        </div>
      </dl>

      <div>
        <h2 className="font-semibold">Resumo</h2>
        <p className="mt-1 whitespace-pre-line text-sm">{t.resumo}</p>
      </div>

      {t.download_liberado ? (
        <a
          href={`/api/acervo/${t.id}/download`}
          className="self-start rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
        >
          Baixar PDF
        </a>
      ) : (
        <p className="rounded bg-yellow-100 px-3 py-2 text-sm text-yellow-900">
          O download deste trabalho ainda não está disponível (embargo ou autorização pendente).
        </p>
      )}
    </article>
  )
}
