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

export const metadata = { title: 'Trabalho | Repositório de TCC' }

const ROTULO_DECISAO = { aprovado: 'Aprovado', devolvido: 'Devolvido' }

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

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link href="/painel/meus-trabalhos" className="text-sm underline">
          &larr; Voltar
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{trabalho.titulo}</h1>
          <StatusBadge status={trabalho.status} />
        </div>
      </div>

      {(revisoes ?? []).length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold">Comentários da revisão</h2>
          <ul className="flex flex-col gap-2">
            {revisoes.map((r) => (
              <li key={r.id} className="rounded border border-gray-300 px-4 py-3 text-sm">
                <p className="font-medium">
                  {ROTULO_DECISAO[r.decisao] ?? r.decisao}{' '}
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

      {editavel ? (
        <>
          <FormTrabalho
            trabalho={trabalho}
            cursos={cursos ?? []}
            orientadores={orientadores ?? []}
          />
          {trabalho.arquivo_path && (
            <a
              href={`/api/trabalhos/${trabalho.id}/arquivo`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
            >
              Ver PDF atual
            </a>
          )}
          <hr className="border-gray-300" />
          <BotaoExcluir id={trabalho.id} />
        </>
      ) : (
        <div className="flex flex-col gap-3 text-sm">
          <p>
            <strong>Curso:</strong> {nomeCurso ?? '—'} · <strong>Ano:</strong> {trabalho.ano ?? '—'}
          </p>
          <p>
            <strong>Orientador:</strong> {nomeOrientador ?? '—'}
          </p>
          <p>
            <strong>Palavras-chave:</strong> {(trabalho.palavras_chave ?? []).join(', ') || '—'}
          </p>
          <p className="whitespace-pre-line">{trabalho.resumo}</p>
          {trabalho.arquivo_path && (
            <a
              href={`/api/trabalhos/${trabalho.id}/arquivo`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Ver PDF
            </a>
          )}
          <p className="opacity-70">
            Este trabalho não pode mais ser editado. Se for devolvido, você poderá corrigi-lo.
          </p>
        </div>
      )}
    </section>
  )
}
