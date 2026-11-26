'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ROTULO_STATUS } from '@/lib/status'
import StatusBadge from '@/components/trabalhos/StatusBadge'
import { IconeBusca } from '@/components/layout/Icones'

const STATUS_OPCOES = ['rascunho', 'em_revisao', 'devolvido', 'aprovado', 'publicado']

export default function TabelaVisaoGeral({ trabalhos, resumo }) {
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [cursoFiltro, setCursoFiltro] = useState('')

  const cursosDisponiveis = useMemo(() => {
    const mapa = new Map()
    for (const t of trabalhos) {
      if (t.curso_id && t.cursoNome) mapa.set(t.curso_id, t.cursoNome)
    }
    return [...mapa.entries()]
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [trabalhos])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return trabalhos.filter((t) => {
      if (statusFiltro && t.status !== statusFiltro) return false
      if (cursoFiltro && t.curso_id !== cursoFiltro) return false
      if (termo && !t.titulo.toLowerCase().includes(termo)) return false
      return true
    })
  }, [trabalhos, busca, statusFiltro, cursoFiltro])

  const temFiltro = Boolean(busca.trim() || statusFiltro || cursoFiltro)

  function limparFiltros() {
    setBusca('')
    setStatusFiltro('')
    setCursoFiltro('')
  }

  function alternarCardStatus(status) {
    setStatusFiltro((atual) => (atual === status ? '' : status))
  }

  const cards = [
    {
      status: 'rascunho',
      titulo: 'Rascunhos',
      valor: resumo.rascunho,
      borda: 'border-slate-200',
      ativa: 'border-slate-400 ring-2 ring-slate-200',
      corNumero: 'text-slate-800',
    },
    {
      status: 'em_revisao',
      titulo: 'Em Revisão',
      valor: resumo.em_revisao,
      borda: 'border-sky-200',
      ativa: 'border-[#0095DB] ring-2 ring-[#0095DB]/20',
      corNumero: 'text-[#0095DB]',
    },
    {
      status: 'devolvido',
      titulo: 'Devolvidos',
      valor: resumo.devolvido,
      borda: 'border-amber-200',
      ativa: 'border-amber-500 ring-2 ring-amber-200',
      corNumero: 'text-amber-700',
    },
    {
      status: 'publicado',
      titulo: 'Publicados',
      valor: resumo.publicado,
      borda: 'border-[#164194]/25',
      ativa: 'border-[#164194] ring-2 ring-[#164194]/20',
      corNumero: 'text-[#164194]',
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Cards de resumo numérico (clicáveis para filtrar por status) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => {
          const selecionado = statusFiltro === card.status
          return (
            <button
              key={card.status}
              type="button"
              onClick={() => alternarCardStatus(card.status)}
              aria-pressed={selecionado}
              className={`rounded-xl border bg-white p-5 text-left shadow-xs transition-all hover:shadow-sm ${
                selecionado ? card.ativa : card.borda
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {card.titulo}
              </p>
              <p className={`mt-2 text-3xl font-bold ${card.corNumero}`}>{card.valor}</p>
            </button>
          )
        })}
      </div>

      {/* Tabela limpa de trabalhos com barra de filtros */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">Trabalhos</h2>
            <span className="text-xs text-slate-500">
              {temFiltro
                ? `${filtrados.length} de ${trabalhos.length} registro(s)`
                : `${trabalhos.length} registro(s)`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <IconeBusca className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por título..."
                aria-label="Buscar trabalho por título"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0095DB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0095DB]/20"
              />
            </div>

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              aria-label="Filtrar por status"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#0095DB] focus:outline-none focus:ring-2 focus:ring-[#0095DB]/20"
            >
              <option value="">Todos os status</option>
              {STATUS_OPCOES.map((s) => (
                <option key={s} value={s}>
                  {ROTULO_STATUS[s] ?? s}
                </option>
              ))}
            </select>

            <select
              value={cursoFiltro}
              onChange={(e) => setCursoFiltro(e.target.value)}
              aria-label="Filtrar por curso"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#0095DB] focus:outline-none focus:ring-2 focus:ring-[#0095DB]/20"
            >
              <option value="">Todos os cursos</option>
              {cursosDisponiveis.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>

            {temFiltro && (
              <button
                type="button"
                onClick={limparFiltros}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-[#164194] hover:text-[#164194]"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {filtrados.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            {temFiltro
              ? 'Nenhum trabalho corresponde aos filtros aplicados.'
              : 'Nenhum trabalho encontrado para o seu perfil no momento.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Título</th>
                  <th className="px-5 py-3">Curso / Ano</th>
                  <th className="px-5 py-3 whitespace-nowrap">Versão do PDF</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtrados.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <Link href={t.acao.href} className="hover:text-[#164194] hover:underline">
                        {t.titulo}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{t.cursoAno}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {t.versao ? (
                        <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-700">
                          v{t.versao}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Sem PDF</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        <Link
                          href={t.acao.href}
                          className="rounded-md bg-[#0095DB]/10 px-3 py-1.5 text-xs font-semibold text-[#164194] transition-colors hover:bg-[#0095DB] hover:text-white"
                        >
                          {t.acao.texto}
                        </Link>
                        {t.acao.secundaria && (
                          <Link
                            href={t.acao.secundaria.href}
                            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-[#164194] hover:text-[#164194]"
                          >
                            {t.acao.secundaria.texto}
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

