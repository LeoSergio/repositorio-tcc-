import Link from 'next/link'
import CartaoTrabalho from '@/components/acervo/CartaoTrabalho'
import OrdenarSelect from '@/components/acervo/OrdenarSelect'
import { IconeBusca, IconeFiltro } from '@/components/layout/Icones'
import { POR_PAGINA, buscarNoAcervo, opcoesDeFiltro } from '@/lib/server/acervo'
import { ORDENACOES } from '@/lib/ordenacoes'

export const metadata = {
  title: 'Acervo | Repositório de TCC • UFRN',
  description: 'Busque trabalhos de conclusão de curso publicados.',
}

const primeiro = (v) => (Array.isArray(v) ? v[0] : v)

function texto(valor, max = 100) {
  const v = primeiro(valor)
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

// Aceita ?ano=2025&ano=2024 (vários checkboxes) e descarta valores inválidos
function listaDeAnos(valor) {
  const lista = Array.isArray(valor) ? valor : valor ? [valor] : []
  const anos = lista.map(Number).filter((n) => Number.isInteger(n) && n >= 2000 && n <= 2100)
  return [...new Set(anos)].slice(0, 10)
}

// Monta a URL de uma página mantendo todos os filtros
function urlDaPagina(f, pagina) {
  const p = new URLSearchParams()
  if (f.q) p.set('q', f.q)
  if (f.curso) p.set('curso', f.curso)
  if (f.palavra) p.set('palavra', f.palavra)
  f.anos.forEach((a) => p.append('ano', String(a)))
  if (f.ordem !== 'recentes') p.set('ordem', f.ordem)
  if (pagina > 1) p.set('pagina', String(pagina))
  const s = p.toString()
  return s ? `/acervo?${s}` : '/acervo'
}

export default async function Acervo({ searchParams }) {
  const sp = await searchParams // Next 15: searchParams é uma Promise

  const q = texto(sp.q)
  const curso = texto(sp.curso)
  const palavra = texto(sp.palavra, 40)
  const anos = listaDeAnos(sp.ano)
  const ordemPedida = texto(sp.ordem, 20)
  const ordem = ORDENACOES[ordemPedida] ? ordemPedida : 'recentes'
  const paginaNum = Number(texto(sp.pagina, 5))
  const pagina = Number.isInteger(paginaNum) && paginaNum >= 1 ? paginaNum : 1

  const filtros = { q, curso, palavra, anos, ordem }
  const [{ trabalhos, total, error }, opcoes] = await Promise.all([
    buscarNoAcervo({ ...filtros, pagina }),
    opcoesDeFiltro(),
  ])

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))
  const inicio = total === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1
  const fim = Math.min(pagina * POR_PAGINA, total)
  const filtrando = Boolean(q || curso || palavra || anos.length)

  const campo = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900'
  const botaoPagina = 'rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-marca hover:bg-marca-claro'

  return (
    // Um único formulário GET cobre a busca, os filtros e a ordenação:
    // tudo vai para a URL (/acervo?q=...&curso=...&ano=2025), que a página lê em searchParams.
    <form action="/acervo" method="GET">
      <section className="bg-marca-claro px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <nav className="text-xs text-slate-500" aria-label="Você está em">
            <Link href="/" className="hover:underline">
              Início
            </Link>{' '}
            / <span>Acervo</span>
          </nav>
          <h1 className="mt-4 text-4xl font-bold text-marca">Explore o acervo</h1>
          <p className="mt-3 text-lg text-slate-600">
            Encontre ideias, referências e novos caminhos para sua pesquisa.
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-white p-2 shadow-sm">
            <IconeBusca className="ml-3 h-5 w-5 shrink-0 text-slate-500" />
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Busque por título, resumo ou palavras-chave"
              aria-label="Buscar no acervo"
              className="min-w-0 flex-1 bg-transparent px-2 py-3 text-slate-900 outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-marca px-5 py-3 text-sm font-semibold text-white hover:bg-marca-escuro"
            >
              Pesquisar
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[256px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 border-b border-slate-200 pb-4 font-semibold text-marca">
            <IconeFiltro className="h-5 w-5" /> Filtrar resultados
          </h2>

          <div className="border-b border-slate-200 py-4">
            <label htmlFor="curso" className="text-sm font-semibold">
              Curso
            </label>
            <select id="curso" name="curso" defaultValue={curso} className={`${campo} mt-3`}>
              <option value="">Todos os cursos</option>
              {opcoes.cursos.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="border-b border-slate-200 py-4">
            <legend className="text-sm font-semibold">Ano de defesa</legend>
            {opcoes.anos.length === 0 && <p className="mt-3 text-sm text-slate-500">Sem anos ainda.</p>}
            <ul className="mt-3 flex flex-col gap-3">
              {opcoes.anos.map(({ ano, quantidade }) => (
                <li key={ano}>
                  <label className="flex items-center justify-between text-sm text-slate-600">
                    <span className="flex items-center gap-3">
                      <input type="checkbox" name="ano" value={ano} defaultChecked={anos.includes(ano)} />
                      {ano}
                    </span>
                    <span className="text-xs text-slate-500">{quantidade}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <div className="py-4">
            <label htmlFor="palavra" className="text-sm font-semibold">
              Palavras-chave
            </label>
            <input
              id="palavra"
              name="palavra"
              defaultValue={palavra}
              maxLength={40}
              placeholder="Adicionar palavra"
              className={`${campo} mt-3`}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-marca px-4 py-3 text-sm font-semibold text-white hover:bg-marca-escuro"
          >
            Aplicar filtros
          </button>
          <Link href="/acervo" className="mt-3 block text-center text-sm text-slate-500 hover:underline">
            Limpar filtros
          </Link>
        </aside>

        <section>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Trabalhos publicados</h2>
              <p className="mt-1 text-sm text-slate-500">
                {total} {total === 1 ? 'trabalho encontrado' : 'trabalhos encontrados'} no acervo
              </p>
            </div>
            <OrdenarSelect valor={ordem} />
          </div>

          {error && (
            <p role="alert" className="mt-6 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-800">
              Não foi possível carregar o acervo agora. Tente novamente em instantes.
            </p>
          )}

          {!error && total === 0 && (
            <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              {filtrando
                ? 'Nenhum trabalho encontrado para esta busca. Tente outros termos ou limpe os filtros.'
                : 'Ainda não há trabalhos publicados.'}
            </p>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {trabalhos.map((t) => (
              <CartaoTrabalho key={t.id} t={t} />
            ))}
          </div>

          {total > 0 && (
            <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Paginação">
              <p className="text-sm text-slate-500">
                Mostrando {inicio}–{fim} de {total} {total === 1 ? 'trabalho' : 'trabalhos'}
              </p>
              <div className="flex items-center gap-2">
                {pagina > 1 ? (
                  <Link href={urlDaPagina(filtros, pagina - 1)} className={botaoPagina}>
                    Anterior
                  </Link>
                ) : (
                  <span className={`${botaoPagina} opacity-50`}>Anterior</span>
                )}
                <span className="rounded-lg bg-marca px-4 py-2.5 text-sm font-semibold text-white">
                  {pagina}
                </span>
                {pagina < totalPaginas ? (
                  <Link href={urlDaPagina(filtros, pagina + 1)} className={botaoPagina}>
                    Próxima
                  </Link>
                ) : (
                  <span className={`${botaoPagina} opacity-50`}>Próxima</span>
                )}
              </div>
            </nav>
          )}
        </section>
      </div>
    </form>
  )
}
