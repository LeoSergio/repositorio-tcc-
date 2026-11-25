import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirPapel } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { LICENCAS, buscarParaGestao, nomesDePerfis } from '@/lib/server/publicacao'
import { listarCursos } from '@/lib/server/trabalhos'
import { ehUuid } from '@/lib/validacao'
import StatusBadge from '@/components/trabalhos/StatusBadge'
import FormPublicacao from '@/components/trabalhos/FormPublicacao'

export const metadata = { title: 'Publicar trabalho | Repositório de TCC' }

export default async function PublicarTrabalho({ params }) {
  const { id } = await params // Next 15: params é uma Promise
  if (!ehUuid(id)) notFound()

  await exigirPapel('coordenador', 'admin')
  const supabase = await createClient()

  const { data: t } = await buscarParaGestao(supabase, id)
  if (!t) notFound()

  const [nomes, { data: cursos }] = await Promise.all([
    nomesDePerfis(supabase, [t.autor_id, t.orientador_id]),
    listarCursos(supabase),
  ])
  const nomeCurso = (cursos ?? []).find((c) => c.id === t.curso_id)?.nome

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link href="/painel/gestao" className="text-sm underline">
          &larr; Voltar
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{t.titulo}</h1>
          <StatusBadge status={t.status} />
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <p>
          <strong>Autor:</strong> {nomes[t.autor_id] ?? '—'} · <strong>Orientador:</strong>{' '}
          {nomes[t.orientador_id] ?? '—'}
        </p>
        <p>
          <strong>Curso:</strong> {nomeCurso ?? '—'} · <strong>Ano:</strong> {t.ano ?? '—'}
        </p>
        <p>
          <strong>Palavras-chave:</strong> {(t.palavras_chave ?? []).join(', ') || '—'}
        </p>
        <p>
          <strong>Autorização do autor:</strong> {t.autorizacao_publicacao ? 'Sim' : 'Não'}
        </p>
        {t.status === 'publicado' && (
          <p>
            <strong>Embargo até:</strong> {t.embargo_ate ?? 'sem embargo'} · <strong>Licença:</strong>{' '}
            {t.licenca ?? 'não informada'}
          </p>
        )}
        <p className="whitespace-pre-line">{t.resumo}</p>
        {t.arquivo_path && (
          <a
            href={`/api/trabalhos/${t.id}/arquivo`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Abrir PDF
          </a>
        )}
      </div>

      <FormPublicacao
        id={t.id}
        status={t.status}
        autorizado={t.autorizacao_publicacao}
        licencas={LICENCAS}
        embargoAtual={t.embargo_ate}
        licencaAtual={t.licenca}
      />
    </section>
  )
}
