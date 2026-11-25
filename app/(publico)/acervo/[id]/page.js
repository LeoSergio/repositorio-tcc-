import Link from 'next/link'
import { notFound } from 'next/navigation'
import { IconeCadeadoFechado, IconeDocumento } from '@/components/layout/Icones'
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
    title: `${data.titulo} | Repositório de TCC • UFRN`,
    description: data.resumo?.slice(0, 160) ?? undefined,
  }
}

function Dado({ rotulo, children }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">{rotulo}</dt>
      <dd className="mt-1 text-slate-900">{children}</dd>
    </div>
  )
}

export default async function PaginaDoTrabalho({ params }) {
  const { id } = await params // Next 15: params é uma Promise
  if (!ehUuid(id)) notFound()

  const { data: t } = await buscarPublicado(id)
  if (!t) notFound()

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-slate-500" aria-label="Você está em">
        <Link href="/" className="hover:underline">
          Início
        </Link>{' '}
        /{' '}
        <Link href="/acervo" className="hover:underline">
          Acervo
        </Link>{' '}
        / <span>Trabalho</span>
      </nav>

      <p className="mt-6 text-sm font-medium text-slate-600">TCC • {t.ano}</p>
      <h1 className="mt-2 text-3xl leading-tight font-bold text-marca">{t.titulo}</h1>

      <dl className="mt-8 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <Dado rotulo="Autor">{t.autor}</Dado>
        <Dado rotulo="Orientador">{t.orientador ?? '—'}</Dado>
        <Dado rotulo="Curso">{t.curso}</Dado>
        <Dado rotulo="Licença">{t.licenca ?? 'Não informada'}</Dado>
      </dl>

      {(t.palavras_chave ?? []).length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {t.palavras_chave.map((p) => (
            <li key={p}>
              <Link
                href={`/acervo?palavra=${encodeURIComponent(p)}`}
                className="rounded bg-marca-claro px-2.5 py-1 text-sm text-marca hover:bg-blue-100"
              >
                {p}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-bold text-slate-900">Resumo</h2>
        <p className="mt-3 leading-relaxed whitespace-pre-line text-slate-700">{t.resumo}</p>
      </section>

      <section className="mt-10">
        {t.download_liberado ? (
          <a
            href={`/api/acervo/${t.id}/download`}
            className="inline-flex items-center gap-2 rounded-lg bg-marca px-6 py-3 font-semibold text-white hover:bg-marca-escuro"
          >
            <IconeDocumento className="h-5 w-5" /> Baixar PDF
          </a>
        ) : (
          <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <IconeCadeadoFechado className="mt-0.5 h-4 w-4 shrink-0" />
            O download deste trabalho ainda não está disponível (embargo ou autorização pendente).
          </p>
        )}
      </section>
    </article>
  )
}
