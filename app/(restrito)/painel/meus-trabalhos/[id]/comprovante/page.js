import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirPapel } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { buscarTrabalhoDoAutor, listarCursos, listarOrientadores, listarRevisoes } from '@/lib/server/trabalhos'
import { ehUuid } from '@/lib/validacao'
import { ROTULO_STATUS, CLASSE_STATUS } from '@/lib/status'

export const metadata = { title: 'Comprovante | Repositório Acadêmico UFRN' }

// Mapeamento de ícone/cor/mensagem por status
const CONFIG_STATUS = {
  em_revisao: {
    emoji: '📤',
    titulo: 'Trabalho enviado para revisão!',
    descricao:
      'Seu trabalho foi enviado ao orientador. Você será notificado assim que houver um parecer. Fique atento à tela "Meus Trabalhos".',
    cor: 'from-sky-500 to-[#164194]',
    corClaro: 'bg-sky-50 border-sky-200 text-sky-800',
    passos: [
      { label: 'Enviado pelo aluno', feito: true },
      { label: 'Revisão pelo orientador', feito: false },
      { label: 'Aprovação e publicação', feito: false },
    ],
  },
  devolvido: {
    emoji: '🔄',
    titulo: 'Trabalho devolvido para ajuste',
    descricao:
      'O orientador solicitou ajustes. Leia os comentários abaixo, corrija o documento e reenvie para revisão.',
    cor: 'from-amber-500 to-orange-600',
    corClaro: 'bg-amber-50 border-amber-200 text-amber-800',
    passos: [
      { label: 'Enviado pelo aluno', feito: true },
      { label: 'Revisão pelo orientador', feito: true },
      { label: 'Correção pendente', feito: false },
    ],
  },
  aprovado: {
    emoji: '✅',
    titulo: 'Trabalho aprovado pelo orientador!',
    descricao:
      'Parabéns! Seu trabalho foi aprovado. Ele agora aguarda a publicação pela coordenação do curso no acervo público.',
    cor: 'from-emerald-500 to-teal-600',
    corClaro: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    passos: [
      { label: 'Enviado pelo aluno', feito: true },
      { label: 'Aprovado pelo orientador', feito: true },
      { label: 'Publicação pela coordenação', feito: false },
    ],
  },
  publicado: {
    emoji: '🏆',
    titulo: 'Trabalho publicado no acervo!',
    descricao:
      'Seu trabalho está disponível no acervo público da UFRN e pode ser consultado por qualquer pessoa.',
    cor: 'from-[#0095DB] to-[#164194]',
    corClaro: 'bg-[#164194]/5 border-[#164194]/20 text-[#164194]',
    passos: [
      { label: 'Enviado pelo aluno', feito: true },
      { label: 'Aprovado pelo orientador', feito: true },
      { label: 'Publicado no acervo', feito: true },
    ],
  },
  rascunho: {
    emoji: '📝',
    titulo: 'Rascunho salvo',
    descricao:
      'Seu trabalho está salvo como rascunho. Quando estiver pronto, envie para revisão do orientador.',
    cor: 'from-slate-500 to-slate-700',
    corClaro: 'bg-slate-50 border-slate-200 text-slate-700',
    passos: [
      { label: 'Rascunho criado', feito: true },
      { label: 'Envio para revisão', feito: false },
      { label: 'Aprovação e publicação', feito: false },
    ],
  },
}

export default async function PaginaComprovante({ params }) {
  const { id } = await params
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

  const cfg = CONFIG_STATUS[trabalho.status] ?? CONFIG_STATUS.rascunho
  const nomeCurso = (cursos ?? []).find((c) => c.id === trabalho.curso_id)?.nome ?? '—'
  const nomeOrientador = (orientadores ?? []).find((o) => o.id === trabalho.orientador_id)?.nome ?? '—'
  const palavrasChave = trabalho.palavras_chave ?? []
  const listaRevisoes = revisoes ?? []
  const dataEnvio = new Date(trabalho.updated_at).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Voltar */}
      <Link
        href={`/painel/meus-trabalhos/${id}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#164194] hover:text-[#0095DB]"
      >
        ← Voltar para o trabalho
      </Link>

      {/* Cartão hero — gradiente + emoji + mensagem */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cfg.cor} p-8 text-white shadow-lg`}>
        {/* Círculos decorativos de fundo */}
        <span className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <span className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/5" />

        <div className="relative flex flex-col items-center gap-4 text-center">
          <span className="text-6xl leading-none" role="img" aria-label="status">
            {cfg.emoji}
          </span>
          <div>
            <h1 className="text-2xl font-bold leading-tight">{cfg.titulo}</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{cfg.descricao}</p>
          </div>
        </div>

        {/* Linha do tempo de progresso */}
        <div className="relative mt-8 flex items-center justify-center gap-0">
          {cfg.passos.map((passo, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                    passo.feito
                      ? 'border-white bg-white text-[#164194]'
                      : 'border-white/40 bg-white/10 text-white/50'
                  }`}
                >
                  {passo.feito ? '✓' : i + 1}
                </span>
                <span className={`max-w-[80px] text-center text-[10px] leading-tight ${passo.feito ? 'text-white' : 'text-white/50'}`}>
                  {passo.label}
                </span>
              </div>
              {i < cfg.passos.length - 1 && (
                <span
                  className={`mx-2 mb-5 h-0.5 w-12 sm:w-20 ${
                    cfg.passos[i + 1].feito ? 'bg-white' : 'bg-white/25'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Comprovante formal */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        {/* Cabeçalho do comprovante */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#164194]/10 text-[#164194] font-bold text-xs">
              UFRN
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Repositório Acadêmico
              </p>
              <p className="text-sm font-bold text-slate-900">Comprovante de Situação</p>
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${CLASSE_STATUS[trabalho.status]}`}
          >
            {ROTULO_STATUS[trabalho.status]}
          </span>
        </div>

        {/* Corpo do comprovante */}
        <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
          <Campo label="Título" valor={trabalho.titulo} destaque />
          <Campo label="Situação atual" valor={ROTULO_STATUS[trabalho.status]} />
          <Campo label="Curso" valor={nomeCurso} />
          <Campo label="Ano" valor={trabalho.ano ?? '—'} />
          <Campo label="Orientador" valor={nomeOrientador} />
          <Campo label="Última atualização" valor={dataEnvio} />
          {palavrasChave.length > 0 && (
            <div className="col-span-full bg-white px-6 py-4">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Palavras-chave
              </p>
              <div className="flex flex-wrap gap-2">
                {palavrasChave.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-[#0095DB]/25 bg-[#0095DB]/10 px-3 py-0.5 text-xs font-medium text-[#164194]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="col-span-full bg-white px-6 py-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Autorização de publicação
            </p>
            {trabalho.autorizacao_publicacao ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800">
                ✓ Autorizado pelo autor
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-0.5 text-xs font-semibold text-slate-600">
                Não autorizado
              </span>
            )}
          </div>
        </div>

        {/* Rodapé do comprovante */}
        <div className="border-t border-slate-100 px-6 py-3 text-center text-xs text-slate-400">
          Este documento é gerado automaticamente pelo sistema. Protocolo:{' '}
          <span className="font-mono font-semibold text-slate-600">{id.split('-')[0].toUpperCase()}</span>
        </div>
      </div>

      {/* Histórico de pareceres (se existir) */}
      {listaRevisoes.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Histórico de pareceres
          </h2>
          <ul className="flex flex-col gap-3">
            {listaRevisoes.map((r) => {
              const estilos = {
                aprovado: 'border-l-emerald-500 bg-emerald-50 border-emerald-200',
                devolvido: 'border-l-amber-500 bg-amber-50 border-amber-200',
                comentario: 'border-l-sky-400 bg-sky-50 border-sky-200',
              }
              const rotulos = {
                aprovado: 'Aprovado',
                devolvido: 'Devolvido para ajuste',
                comentario: 'Comentário',
              }
              const e = estilos[r.decisao] ?? estilos.comentario
              return (
                <li key={r.id} className={`rounded-xl border border-l-4 p-4 ${e}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700">{rotulos[r.decisao] ?? r.decisao}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(r.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {r.texto && (
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{r.texto}</p>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/painel/meus-trabalhos/${id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50"
        >
          ← Ver detalhes do trabalho
        </Link>
        {trabalho.status === 'publicado' && (
          <Link
            href={`/acervo/${id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#164194] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#143378]"
          >
            🌐 Ver no acervo público →
          </Link>
        )}
        {trabalho.arquivo_path && (
          <a
            href={`/api/trabalhos/${id}/arquivo`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[#0095DB]/30 bg-[#0095DB]/5 px-5 py-2.5 text-sm font-semibold text-[#164194] shadow-xs transition-colors hover:bg-[#0095DB]/10"
          >
            ↓ Baixar PDF
          </a>
        )}
      </div>
    </section>
  )
}

// Componente auxiliar para campos do comprovante
function Campo({ label, valor, destaque = false }) {
  return (
    <div className="bg-white px-6 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-sm ${destaque ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
        {valor}
      </p>
    </div>
  )
}

