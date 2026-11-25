import Link from 'next/link'
import { exigirPapel } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { listarTrabalhosDoOrientador, nomesDosAutores } from '@/lib/server/revisoes'
import StatusBadge from '@/components/trabalhos/StatusBadge'

export const metadata = { title: 'Revisões | Repositório de TCC' }

function Lista({ trabalhos, nomes }) {
  return (
    <ul className="mt-3 flex flex-col gap-3">
      {trabalhos.map((t) => (
        <li key={t.id}>
          <Link
            href={`/painel/revisoes/${t.id}`}
            className="flex items-center justify-between gap-4 rounded border border-gray-300 px-4 py-3 hover:bg-gray-50 hover:text-black"
          >
            <span>
              <span className="font-medium">{t.titulo}</span>
              <span className="block text-sm opacity-70">
                {nomes[t.autor_id] ?? 'Aluno'} · enviado em{' '}
                {new Date(t.updated_at).toLocaleDateString('pt-BR')}
              </span>
            </span>
            <StatusBadge status={t.status} />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default async function Revisoes() {
  const perfil = await exigirPapel('orientador')
  const supabase = await createClient()

  const { data: trabalhos, error } = await listarTrabalhosDoOrientador(supabase, perfil.id)
  const lista = trabalhos ?? []
  const nomes = await nomesDosAutores(
    supabase,
    lista.map((t) => t.autor_id),
  )

  const pendentes = lista.filter((t) => t.status === 'em_revisao')
  const outros = lista.filter((t) => t.status !== 'em_revisao')

  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Revisões</h1>

      {error && (
        <p role="alert" className="rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          Não foi possível carregar os trabalhos.
        </p>
      )}

      <div>
        <h2 className="font-semibold">Aguardando sua revisão ({pendentes.length})</h2>
        {pendentes.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">Nenhum trabalho pendente.</p>
        ) : (
          <Lista trabalhos={pendentes} nomes={nomes} />
        )}
      </div>

      {outros.length > 0 && (
        <div>
          <h2 className="font-semibold">Já revisados</h2>
          <Lista trabalhos={outros} nomes={nomes} />
        </div>
      )}
    </section>
  )
}
