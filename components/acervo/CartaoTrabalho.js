import Link from 'next/link'
import { IconeCapelo, IconeCheck, IconeCadeadoFechado, IconeDocumento, IconeSeta } from '@/components/layout/Icones'

// Cartão de um trabalho publicado (usado na home e na lista do acervo).
// O selo de acesso e o ícone de PDF refletem o dado real: download_liberado
// já considera a autorização do autor e o embargo.
export default function CartaoTrabalho({ t }) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">TCC • {t.ano}</span>
        {t.download_liberado ? (
          <span className="flex items-center gap-1 text-emerald-700">
            <IconeCheck className="h-3.5 w-3.5" /> Acesso aberto
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-700">
            <IconeCadeadoFechado className="h-3.5 w-3.5" /> Acesso restrito
          </span>
        )}
      </div>

      <h3 className="mt-4 min-h-[5.5rem] text-xl leading-snug font-semibold text-marca">
        <Link href={`/acervo/${t.id}`} className="hover:underline">
          {t.titulo}
        </Link>
      </h3>

      <p className="mt-4 text-sm font-medium text-slate-900">{t.autor}</p>
      {t.orientador && <p className="mt-1 text-sm text-slate-500">Orientação: {t.orientador}</p>}

      <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
        <IconeCapelo className="h-4 w-4" /> {t.curso}
      </p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {(t.palavras_chave ?? []).slice(0, 3).map((p) => (
          <li key={p}>
            <Link
              href={`/acervo?palavra=${encodeURIComponent(p)}`}
              className="rounded bg-marca-claro px-2 py-1 text-xs text-marca hover:bg-blue-100"
            >
              {p}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-4">
        <Link
          href={`/acervo/${t.id}`}
          className="flex items-center gap-2 text-sm font-semibold text-marca hover:underline"
        >
          {t.download_liberado ? 'Ver detalhes e PDF' : 'Ver detalhes'}
          <IconeSeta className="h-4 w-4 text-ciano" />
        </Link>
        {t.download_liberado && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <IconeDocumento className="h-4 w-4" /> PDF
          </span>
        )}
      </div>
    </article>
  )
}
