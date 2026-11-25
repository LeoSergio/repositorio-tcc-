import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirPapel } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { buscarTrabalhoDoOrientador, nomesDosAutores } from '@/lib/server/revisoes'
import { listarCursos, listarRevisoes } from '@/lib/server/trabalhos'
import { ehUuid } from '@/lib/validacao'
import StatusBadge from '@/components/trabalhos/StatusBadge'
import FormRevisao from '@/components/trabalhos/FormRevisao'

export const metadata = { title: 'Revisar trabalho | Repositório de TCC' }

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

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link href="/painel/revisoes" className="text-sm underline">
          &larr; Voltar
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{trabalho.titulo}</h1>
          <StatusBadge status={trabalho.status} />
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <p>
          <strong>Aluno:</strong> {nomes[trabalho.autor_id] ?? '—'} · <strong>Curso:</strong>{' '}
          {nomeCurso ?? '—'} · <strong>Ano:</strong> {trabalho.ano ?? '—'}
        </p>
        <p>
          <strong>Palavras-chave:</strong> {(trabalho.palavras_chave ?? []).join(', ') || '—'}
        </p>
        <p>
          <strong>Autoriza publicação:</strong> {trabalho.autorizacao_publicacao ? 'Sim' : 'Não'}
        </p>
        <p className="whitespace-pre-line">{trabalho.resumo}</p>
        {trabalho.arquivo_path && (
          <a
            href={`/api/trabalhos/${trabalho.id}/arquivo`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Abrir PDF
          </a>
        )}
      </div>

      {(revisoes ?? []).length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold">Revisões anteriores</h2>
          <ul className="flex flex-col gap-2">
            {revisoes.map((r) => (
              <li key={r.id} className="rounded border border-gray-300 px-4 py-3 text-sm">
                <p className="font-medium">
                  {r.decisao}{' '}
                  <span className="font-normal opacity-60">
                    em {new Date(r.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </p>
                {r.texto && <p className="mt-1 whitespace-pre-line">{r.texto}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {trabalho.status === 'em_revisao' ? (
        <FormRevisao id={trabalho.id} />
      ) : (
        <p className="text-sm opacity-70">Este trabalho já foi revisado.</p>
      )}
    </section>
  )
}
