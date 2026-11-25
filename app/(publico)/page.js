import Link from 'next/link'
import FormBusca from '@/components/acervo/FormBusca'
import { POR_PAGINA, buscarNoAcervo, opcoesDeFiltro } from '@/lib/server/acervo'

export const metadata = {
  title: 'Acervo | Repositório de TCC',
  description: 'Busque trabalhos de conclusão de curso publicados.',
}

// Texto simples da URL: pega só o primeiro valor e limita o tamanho
function texto(valor, max = 100) {
  const v = Array.isArray(valor) ? valor[0] : valor
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

// Monta a URL mantendo os filtros ao trocar de página
function urlDaPagina(filtros, pagina) {
  const p = new URLSearchParams()
  if (filtros.q) p.set('q', filtros.q)
  if (filtros.curso) p.set('curso', filtros.curso)
  if (filtros.ano) p.set('ano', String(filtros.ano))
  if (pagina > 1) p.set('pagina', String(pagina))
  const s = p.toString()
  return s ? `/?${s}` : '/'
}

export default async function Home({ searchParams }) {
  const sp = await searchParams // Next 15: searchParams é uma Promise

  const q = texto(sp.q)
  const curso = texto(sp.curso)
  const anoNum = Number(texto(sp.ano, 4))
  const ano = Number.isInteger(anoNum) && anoNum >= 2000 && anoNum <= 2100 ? anoNum : null
  const paginaNum = Number(texto(sp.pagina, 5))
  const pagina = Number.isInteger(paginaNum) && paginaNum >= 1 ? paginaNum : 1

  const [{ trabalhos, total, error }, filtros] = await Promise.all([
    buscarNoAcervo({ q, curso, ano, pagina }),
    opcoesDeFiltro(),
  ])

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))
  const atuais = { q, curso, ano }
  const filtrando = Boolean(q || curso || ano)

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Acervo de trabalhos</h1>
        <p className="mt-1 text-sm opacity-70">
          Trabalhos de conclusão de curso aprovados e publicados.
        </p>
      </div>

      <FormBusca q={q} curso={curso} ano={ano} cursos={filtros.cursos} anos={filtros.anos} />

      {error && (
        <p role="alert" className="rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          Não foi possível carregar o acervo agora. Tente novamente em instantes.
        </p>
      )}

      {!error && (
        <p className="text-sm opacity-70">
          {total === 0
            ? filtrando
              ? 'Nenhum trabalho encontrado para esta busca.'
              : 'Ainda não há trabalhos publicados.'
            : `${total} ${total === 1 ? 'trabalho encontrado' : 'trabalhos encontrados'}`}
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {trabalhos.map((t) => (
          <li key={t.id} className="rounded border border-gray-300 px-4 py-4">
            <Link href={`/acervo/${t.id}`} className="text-lg font-medium underline">
              {t.titulo}
            </Link>
            <p className="mt-1 text-sm opacity-70">
              {t.autor} · {t.curso} · {t.ano}
              {t.orientador ? ` · Orientador: ${t.orientador}` : ''}
            </p>
            {t.resumo && <p className="mt-2 line-clamp-3 text-sm">{t.resumo}</p>}
          </li>
        ))}
      </ul>

      {totalPaginas > 1 && (
        <nav className="flex items-center justify-between text-sm" aria-label="Paginação">
          {pagina > 1 ? (
            <Link href={urlDaPagina(atuais, pagina - 1)} className="underline">
              &larr; Anterior
            </Link>
          ) : (
            <span />
          )}
          <span>
            Página {pagina} de {totalPaginas}
          </span>
          {pagina < totalPaginas ? (
            <Link href={urlDaPagina(atuais, pagina + 1)} className="underline">
              Próxima &rarr;
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </section>
  )
}
