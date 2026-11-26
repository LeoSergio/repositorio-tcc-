import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirPapel } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { buscarTrabalhoDoOrientador, nomesDosAutores } from '@/lib/server/revisoes'
import { listarCursos, listarRevisoes } from '@/lib/server/trabalhos'
import { ehUuid } from '@/lib/validacao'
import StatusBadge from '@/components/trabalhos/StatusBadge'
import FormRevisao from '@/components/trabalhos/FormRevisao'
import { IconeCheck, IconeDocumento, IconeDownload } from '@/components/layout/Icones'

export const metadata = { title: 'Revisar trabalho | Repositório de TCC' }

const DECISAO_ESTILO = {
  aprovado: {
    rotulo: 'Aprovado',
    classe: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    borda: 'border-l-emerald-500',
  },
  devolvido: {
    rotulo: 'Devolvido',
    classe: 'border-amber-200 bg-amber-50 text-amber-800',
    borda: 'border-l-amber-500',
  },
  comentario: {
    rotulo: 'Comentário',
    classe: 'border-sky-200 bg-sky-50 text-sky-800',
    borda: 'border-l-[#0095DB]',
  },
}

const MENSAGEM_STATUS_FECHADO = {
  devolvido: 'Este trabalho foi devolvido e aguarda as correções do aluno.',
  aprovado: 'Este trabalho já foi aprovado por você e aguarda publicação pela coordenação.',
  publicado: 'Este trabalho já foi aprovado e publicado no acervo institucional.',
}

export default async function RevisarTrabalho({ params }) {
  const { id } = await params // Next 15: params é uma Promise
  if (!ehUuid(id)) notFound()

  const perfil = await exigirPapel('orientador')
  const supabase = await createClient()

  const { data: trabalho } = await buscarTrabalhoDoOrientador(supabase, id, perfil.id)
  if (!trabalho) notFound()

  const [nomes, { data: cursos }, { data: revisoes }] = await Promise.all([
    nomesDosAutores(supabase, [trabalho.autor_id]),
    listarCursos(supabase),
    listarRevisoes(supabase, id),
  ])

  const nomeCurso = (cursos ?? []).find((c) => c.id === trabalho.curso_id)?.nome
  const palavrasChave = trabalho.palavras_chave ?? []
  const listaRevisoes = revisoes ?? []

  return (
    <section className="flex flex-col gap-6">
      {/* Cabeçalho com voltar, título e status */}
      <div className="flex flex-col gap-3">
        <Link
          href="/painel/revisoes"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#164194] hover:text-[#0095DB]"
        >
          &larr; Voltar para Revisões
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{trabalho.titulo}</h1>
            <StatusBadge status={trabalho.status} />
          </div>
          <span className="text-xs text-slate-500">
            Atualizado em {new Date(trabalho.updated_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Layout em 2 colunas no desktop */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal (Resumo, Histórico, Parecer) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Card do Resumo e Palavras-chave */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-semibold text-slate-900">Resumo do trabalho</h2>
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

          {/* Card do Parecer ou Situação Atual */}
          {trabalho.status === 'em_revisao' ? (
            <div className="rounded-xl border border-[#0095DB]/35 bg-white p-6 shadow-xs">
              <h2 className="text-base font-semibold text-slate-900">Registrar parecer</h2>
              <p className="mt-1 text-sm text-slate-500">
                Leia o documento completo antes de aprovar ou solicitar ajustes ao aluno.
              </p>
              <div className="mt-4">
                <FormRevisao id={trabalho.id} />
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-[#164194]/20 bg-[#164194]/5 p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#164194] text-white">
                <IconeCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#164194]">Situação da revisão</p>
                <p className="mt-0.5 text-sm text-slate-700">
                  {MENSAGEM_STATUS_FECHADO[trabalho.status] ?? 'Este trabalho já foi revisado.'}
                </p>
              </div>
            </div>
          )}

          {/* Histórico de revisões */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">Histórico de revisões</h2>
              <span className="text-xs text-slate-500">{listaRevisoes.length} registro(s)</span>
            </div>

            {listaRevisoes.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                Nenhuma revisão registrada anteriormente.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {listaRevisoes.map((r) => {
                  const estilo = DECISAO_ESTILO[r.decisao] ?? DECISAO_ESTILO.comentario
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
            )}
          </div>
        </div>

        {/* Coluna lateral (Ficha técnica e PDF) */}
        <aside className="flex flex-col gap-6">
          {/* Card do Arquivo PDF */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0095DB]/10 text-[#164194]">
                <IconeDocumento className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Documento do TCC</h2>
                <p className="text-xs text-slate-500">
                  {trabalho.arquivo_path ? 'Arquivo PDF disponível' : 'Nenhum PDF anexado'}
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
                <span>Abrir PDF</span>
              </a>
            )}
          </div>

          {/* Card de Ficha Técnica */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900">Informações do trabalho</h2>
            <dl className="mt-4 flex flex-col gap-3.5 text-sm">
              <div className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Aluno
                </dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {nomes[trabalho.autor_id] ?? '—'}
                </dd>
              </div>

              <div className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Curso
                </dt>
                <dd className="mt-1 font-medium text-slate-900">{nomeCurso ?? '—'}</dd>
              </div>

              <div className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Ano
                </dt>
                <dd className="mt-1 font-medium text-slate-900">{trabalho.ano ?? '—'}</dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Autorização de publicação
                </dt>
                <dd className="mt-1.5">
                  {trabalho.autorizacao_publicacao ? (
                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      Sim, autorizada pelo autor
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
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
