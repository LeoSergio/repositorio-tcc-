import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  IconeCadeadoFechado,
  IconeCheck,
  IconeDocumento,
  IconeDownload,
  IconeSeta,
} from '@/components/layout/Icones'
import { buscarPublicado, idsPublicados } from '@/lib/server/acervo'
import { INSTITUICAO, citacaoAbnt } from '@/lib/citacao'
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

function Linha({ rotulo, children }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="text-sm text-slate-500">{rotulo}</dt>
      <dd className="text-slate-900">{children}</dd>
    </div>
  )
}

export default async function PaginaDoTrabalho({ params }) {
  const { id } = await params // Next 15: params é uma Promise
  if (!ehUuid(id)) notFound()

  const { data: t } = await buscarPublicado(id)
  if (!t) notFound()

  const palavras = t.palavras_chave ?? []

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-marca" aria-label="Você está em">
        <Link href="/acervo" className="hover:underline">
          Acervo
        </Link>
        <span aria-hidden="true">›</span>
        <Link href={`/acervo?curso=${encodeURIComponent(t.curso)}`} className="hover:underline">
          {t.curso}
        </Link>
        <span aria-hidden="true">›</span>
        <span className="text-slate-500">{t.titulo}</span>
      </nav>

      <Link
        href="/acervo"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-marca hover:underline"
      >
        <IconeSeta className="h-4 w-4 rotate-180" /> Voltar ao acervo
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px] lg:items-start">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-medium text-slate-600">TCC • {t.ano}</span>
            {t.download_liberado ? (
              <span className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-emerald-700">
                <IconeCheck className="h-3.5 w-3.5" /> Acesso aberto
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-amber-700">
                <IconeCadeadoFechado className="h-3.5 w-3.5" /> Acesso restrito
              </span>
            )}
          </div>

          <h1 className="mt-5 text-3xl leading-tight font-bold text-marca sm:text-4xl">{t.titulo}</h1>

          <div className="mt-8">
            <p className="text-xs text-slate-500">Autor</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{t.autor}</p>
            <p className="mt-1 text-sm text-slate-500">Trabalho de Conclusão de Curso • {t.curso}</p>
          </div>

          <dl className="mt-6 divide-y divide-slate-100 border-y border-slate-200">
            <Linha rotulo="Orientador">{t.orientador ?? '—'}</Linha>
            <Linha rotulo="Instituição">{INSTITUICAO}</Linha>
            <Linha rotulo="Curso">{t.curso}</Linha>
            <Linha rotulo="Ano de defesa">{t.ano}</Linha>
            <Linha rotulo="Licença">{t.licenca ?? 'Não informada'}</Linha>
          </dl>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-900">Resumo</h2>
            <p className="mt-4 leading-relaxed whitespace-pre-line text-slate-600">{t.resumo}</p>
          </section>

          {palavras.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-slate-900">Palavras-chave</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {palavras.map((p) => (
                  <li key={p}>
                    <Link
                      href={`/acervo?palavra=${encodeURIComponent(p)}`}
                      className="rounded border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm text-marca hover:bg-sky-100"
                    >
                      {p}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-8 border-t border-slate-200 pt-8">
            <h2 className="text-xl font-bold text-slate-900">Como citar</h2>
            <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
              {citacaoAbnt(t)}
            </p>
          </section>
        </article>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-marca-claro text-marca">
            <IconeDocumento className="h-7 w-7" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-slate-900">Texto completo</h2>
          <p className="mt-3 text-sm text-slate-500">Trabalho de Conclusão de Curso</p>
          <p className="mt-3 text-xs text-slate-500">
            <span className="font-semibold text-marca">PDF</span> • Documento acadêmico
          </p>

          {t.download_liberado ? (
            <a
              href={`/api/acervo/${t.id}/download`}
              className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-marca px-4 py-3.5 text-sm font-semibold text-white hover:bg-marca-escuro"
            >
              <IconeDownload className="h-4 w-4" /> Baixar PDF completo
            </a>
          ) : (
            <p className="mt-5 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-900">
              <IconeCadeadoFechado className="mt-0.5 h-4 w-4 shrink-0" />
              O download deste trabalho ainda não está disponível (embargo ou autorização pendente).
            </p>
          )}

          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="text-sm font-semibold text-slate-900">Informações da publicação</h3>
            <ul className="mt-4 flex flex-col gap-2 text-xs text-slate-500">
              <li>Ano de defesa: {t.ano}</li>
              <li>Licença: {t.licenca ?? 'não informada'}</li>
              <li>Disponibilidade: {t.download_liberado ? 'acesso aberto' : 'acesso restrito'}</li>
              {t.published_at && (
                <li>Publicado em {new Date(t.published_at).toLocaleDateString('pt-BR')}</li>
              )}
            </ul>
            <p className="mt-5 text-xs text-slate-500">Instituição</p>
            <p className="mt-1 text-sm text-slate-900">{INSTITUICAO}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
