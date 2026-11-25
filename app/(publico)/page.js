import Link from 'next/link'
import CartaoTrabalho from '@/components/acervo/CartaoTrabalho'
import { IconeArquivo, IconeBusca, IconeCadeado, IconeCapelo, IconeSeta } from '@/components/layout/Icones'
import { buscarNoAcervo, opcoesDeFiltro } from '@/lib/server/acervo'

export const metadata = {
  title: 'Repositório de TCC • UFRN',
  description: 'Acervo digital de trabalhos de conclusão de curso.',
}

// Página estática renovada a cada 60 s (ISR): não lê cookies nem searchParams.
export const revalidate = 60

const VALORES = [
  { Icone: IconeCadeado, titulo: 'Acesso aberto', texto: 'Conhecimento sem barreiras' },
  { Icone: IconeCapelo, titulo: 'Diversidade de saberes', texto: 'Produção de todos os cursos' },
  { Icone: IconeArquivo, titulo: 'Memória acadêmica', texto: 'Pesquisa preservada e acessível' },
]

export default async function Home() {
  const [{ trabalhos }, { cursos }] = await Promise.all([
    buscarNoAcervo({ porPagina: 3 }),
    opcoesDeFiltro(),
  ])

  return (
    <>
      <section className="bg-gradient-to-r from-marca to-[#0369a1] px-4 py-12 sm:py-16 text-center text-white sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="flex items-center justify-center gap-2 text-xs font-medium tracking-wide uppercase">
            <IconeCadeado className="h-3.5 w-3.5" /> Conhecimento aberto à sociedade
          </p>
          <h1 className="mt-6 text-3xl leading-tight font-bold sm:text-5xl">
            Acervo Digital de Trabalhos de Conclusão de Curso
          </h1>
          <p className="mt-6 text-lg text-blue-50">
            Explore a produção acadêmica da UFRN.
            <br />
            Ideias que conectam ensino, pesquisa e sociedade.
          </p>

          {/* Formulário de busca (receita 17): GET para /acervo?q=... */}
          <form
            action="/acervo"
            method="GET"
            className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 rounded-xl bg-white p-2 shadow-lg sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center">
              <IconeBusca className="ml-3 h-5 w-5 shrink-0 text-slate-500" />
              <input
                name="q"
                type="search"
                placeholder="Título, resumo ou palavras-chave"
                aria-label="Buscar no acervo"
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-slate-900 outline-none placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-marca px-5 py-3 text-sm font-semibold text-white hover:bg-marca-escuro sm:py-3"
            >
              Pesquisar
            </button>
          </form>

          {cursos.length > 0 && (
            <p className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-blue-100">
              Explore:
              {cursos.slice(0, 3).map((c) => (
                <Link
                  key={c}
                  href={`/acervo?curso=${encodeURIComponent(c)}`}
                  className="underline hover:text-white"
                >
                  {c}
                </Link>
              ))}
            </p>
          )}
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <ul className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-3">
          {VALORES.map(({ Icone, titulo, texto }) => (
            <li key={titulo} className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-marca-claro text-marca">
                <Icone className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-slate-900">{titulo}</span>
                <span className="text-sm text-slate-500">{texto}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Conhecimento em movimento</h2>
            <p className="mt-2 text-slate-500">Conheça os trabalhos publicados recentemente.</p>
          </div>
          <Link
            href="/acervo"
            className="flex shrink-0 items-center gap-2 text-sm font-semibold text-marca hover:underline"
          >
            Ver todo o acervo <IconeSeta className="h-4 w-4 text-ciano" />
          </Link>
        </div>

        {trabalhos.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Ainda não há trabalhos publicados.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {trabalhos.map((t) => (
              <CartaoTrabalho key={t.id} t={t} />
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col gap-6 rounded-2xl bg-marca-claro p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-marca">Sua pesquisa faz parte dessa história.</h2>
            <p className="mt-2 text-slate-600">
              Um espaço para preservar a produção acadêmica e compartilhar o conhecimento construído na
              UFRN.
            </p>
          </div>
          <Link
            href="/acervo"
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-marca px-6 py-3 text-sm font-semibold text-white hover:bg-marca-escuro"
          >
            <IconeSeta className="h-4 w-4" /> Explorar o acervo
          </Link>
        </div>
      </section>
    </>
  )
}
