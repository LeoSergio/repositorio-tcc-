import Link from 'next/link'
import { exigirPapel } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { listarParaGestao, nomesDePerfis } from '@/lib/server/publicacao'
import StatusBadge from '@/components/trabalhos/StatusBadge'

export const metadata = { title: 'Gestão | Repositório de TCC' }

function Lista({ trabalhos, nomes }) {
  return (
    <ul className="mt-3 flex flex-col gap-3">
      {trabalhos.map((t) => (
        <li key={t.id}>
          <Link
            href={`/painel/gestao/${t.id}`}
            className="flex items-center justify-between gap-4 rounded border border-gray-300 px-4 py-3 hover:bg-gray-50 hover:text-black"
          >
            <span>
              <span className="font-medium">{t.titulo}</span>
              <span className="block text-sm opacity-70">
                {nomes[t.autor_id] ?? 'Aluno'}
                {!t.autorizacao_publicacao && ' · sem autorização de publicação'}
              </span>
            </span>
            <StatusBadge status={t.status} />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default async function Gestao() {
  await exigirPapel('coordenador', 'admin')
  const supabase = await createClient()

  const { data, error } = await listarParaGestao(supabase)
  const lista = data ?? []
  const nomes = await nomesDePerfis(supabase, lista.map((t) => t.autor_id))

  const aprovados = lista.filter((t) => t.status === 'aprovado')
  const publicados = lista.filter((t) => t.status === 'publicado')

  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Gestão do acervo</h1>

      {error && (
        <p role="alert" className="rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          Não foi possível carregar os trabalhos.
        </p>
      )}

      <div>
        <h2 className="font-semibold">Aprovados, aguardando publicação ({aprovados.length})</h2>
        {aprovados.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">Nenhum trabalho aprovado no momento.</p>
        ) : (
          <Lista trabalhos={aprovados} nomes={nomes} />
        )}
      </div>

      <div>
        <h2 className="font-semibold">Publicados ({publicados.length})</h2>
        {publicados.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">Nenhum trabalho publicado ainda.</p>
        ) : (
          <Lista trabalhos={publicados} nomes={nomes} />
        )}
      </div>
    </section>
  )
}
