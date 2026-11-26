import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirPapel } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import {
  buscarTrabalhoDoAutor,
  listarCursos,
  listarOrientadores,
  listarRevisoes,
} from '@/lib/server/trabalhos'
import { ehUuid } from '@/lib/validacao'
import { STATUS_EDITAVEIS } from '@/lib/status'
import StatusBadge from '@/components/trabalhos/StatusBadge'
import FormTrabalho from '@/components/trabalhos/FormTrabalho'
import BotaoExcluir from '@/components/trabalhos/BotaoExcluir'
import { IconeCheck, IconeDocumento, IconeDownload, IconeInfo } from '@/components/layout/Icones'

export const metadata = { title: 'Trabalho | Repositório Acadêmico UFRN' }

const ESTILO_DECISAO = {
  aprovado: {
    rotulo: 'Aprovado',
    borda: 'border-l-emerald-500',
    classe: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  devolvido: {
    rotulo: 'Devolvido para ajuste',
    borda: 'border-l-amber-500',
    classe: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  comentario: {
    rotulo: 'Comentário',
    borda: 'border-l-[#0095DB]',
    classe: 'border-sky-200 bg-sky-50 text-sky-800',
  },
}

const MENSAGEM_STATUS = {
  em_revisao: {
    icone: IconeInfo,
    cor: 'border-[#0095DB]/30 bg-[#0095DB]/5 text-[#164194]',
    texto: 'Seu trabalho está em revisão com o orientador. Aguarde o parecer.',
  },
  aprovado: {
    icone: IconeCheck,
    cor: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    texto: 'Parabéns! Seu trabalho foi aprovado pelo orientador e aguarda publicação pela coordenação.',
  },
  publicado: {
    icone: IconeCheck,
    cor: 'border-[#164194]/20 bg-[#164194]/5 text-[#164194]',
    texto: 'Seu trabalho está publicado no acervo público e disponível para consulta.',
  },
}

export default async function PaginaTrabalho({ params }) {
  const { id } = await params // Next 15: params é uma Promise
  if (!ehUuid(id)) notFound()

  const perfil = await exigirPapel('aluno')
  const supabase = await createClient()

  const { data: trabalho } = await buscarTrabalhoDoAutor(supabase, id, perfil.id)
  if (!trabalho) notFound()

  const [{ data: cursos }, { data: orientadores }, { data: revisoes }] = await Promise.all([
    listarCursos(supabase),
    listarOrientadores(supabase),
    listarRevisoes(supabase, id),
  ])

  const editavel = STATUS_EDITAVEIS.includes(trabalho.status)
  const nomeCurso = (cursos ?? []).find((c) => c.id === trabalho.curso_id)?.nome
  const nomeOrientador = (orientadores ?? []).find((o) => o.id === trabalho.orientador_id)?.nome
  const palavrasChave = trabalho.palavras_chave ?? []
  const listaRevisoes = revisoes ?? []
  const bannerStatus = MENSAGEM_STATUS[trabalho.status]

  return (
    <section className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3">
        <Link
          href="/painel/meus-trabalhos"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#164194] hover:text-[#0095DB]"
        >
          &larr; Voltar para Meus Trabalhos
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{trabalho.titulo}</h1>
            <StatusBadge status={trabalho.status} />
          </div>
          <span className="text-xs text-slate-500">
            Atualizado em {new Date(trabalho.updated_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Banner de situação (somente quando não editável) */}
      {bannerStatus && !editavel && (() => {
        const Icone = bannerStatus.icone
        return (
          <div className={`flex items-start gap-3 rounded-xl border p-4 ${bannerStatus.cor}`}>
            <span className="mt-0.5 shrink-0">
              <Icone className="h-4 w-4" />
            </span>
            <p className="text-sm font-medium">{bannerStatus.texto}</p>
          </div>
        )
      })()}

      {/* Link para comprovante */}
      <div className="flex justify-end">
        <Link
          href={`/painel/meus-trabalhos/${trabalho.id}/comprovante`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#164194] shadow-xs transition-colors hover:bg-slate-50"
        >
          📋 Ver comprovante
        </Link>
      </div>

      {/* Layout em 2 colunas no desktop */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Coluna principal */}
        <div className="flex flex-col gap-6 lg:col-span-2">

          {/* Formulário de edição (modo rascunho/devolvido) */}
          {editavel && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="mb-5 text-base font-semibold text-slate-900">Dados do trabalho</h2>
              <FormTrabalho
                trabalho={trabalho}
                cursos={cursos ?? []}
                orientadores={orientadores ?? []}
              />
              <div className="mt-6 border-t border-slate-100 pt-5">
                <BotaoExcluir id={trabalho.id} />
              </div>
            </div>
          )}

          {/* Visualização somente leitura (modo em_revisao / aprovado / publicado) */}
          {!editavel && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-base font-semibold text-slate-900">Resumo</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {trabalho.resumo || 'Nenhum resumo informado.'}
              </p>

              {palavrasChave.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Palavras-chave
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {palavrasChave.map((palavra) => (
                      <span
                        key={palavra}
                        className="rounded-full border border-[#0095DB]/25 bg-[#0095DB]/10 px-3 py-1 text-xs font-medium text-[#164194]"
                      >
                        {palavra}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Histórico de revisões */}
          {listaRevisoes.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900">Comentários do orientador</h2>
                <span className="text-xs text-slate-500">{listaRevisoes.length} registro(s)</span>
              </div>
              <ul className="mt-4 flex flex-col gap-3">
                {listaRevisoes.map((r) => {
                  const estilo = ESTILO_DECISAO[r.decisao] ?? ESTILO_DECISAO.comentario
                  return (
                    <li
                      key={r.id}
                      className={`rounded-lg border border-slate-200 border-l-4 ${estilo.borda} bg-slate-50/70 p-4`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${estilo.classe}`}
                        >
                          {estilo.rotulo}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(r.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {r.texto && (
                        <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                          {r.texto}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Coluna lateral — Ficha e PDF */}
        <aside className="flex flex-col gap-6">
          {/* Card do PDF */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0095DB]/10 text-[#164194]">
                <IconeDocumento className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Documento PDF</h2>
                <p className="text-xs text-slate-500">
                  {trabalho.arquivo_path ? 'Arquivo disponível' : 'Nenhum PDF enviado'}
                </p>
              </div>
            </div>

            {trabalho.arquivo_path && (
              <a
                href={`/api/trabalhos/${trabalho.id}/arquivo`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#164194] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#143378]"
              >
                <IconeDownload className="h-4 w-4" />
                <span>Abrir / Baixar PDF</span>
              </a>
            )}
          </div>

          {/* Ficha técnica */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900">Informações do trabalho</h2>
            <dl className="mt-4 flex flex-col gap-3.5 text-sm">
              <div className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Curso</dt>
                <dd className="mt-1 font-medium text-slate-900">{nomeCurso ?? '—'}</dd>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Orientador</dt>
                <dd className="mt-1 font-medium text-slate-900">{nomeOrientador ?? '—'}</dd>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ano</dt>
                <dd className="mt-1 font-medium text-slate-900">{trabalho.ano ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Autorização de publicação
                </dt>
                <dd className="mt-1.5">
                  {trabalho.autorizacao_publicacao ? (
                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      ✓ Autorizada por mim
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                      Não autorizada
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </section>
  )
}
