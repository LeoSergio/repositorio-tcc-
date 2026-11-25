import Link from 'next/link'
import { exigirPapel } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { listarTrabalhosDoAutor } from '@/lib/server/trabalhos'
import StatusBadge from '@/components/trabalhos/StatusBadge'

export const metadata = { title: 'Meus trabalhos | Repositório de TCC' }

// Server Component: lê direto do banco no servidor (receita 16 - data fetching)
export default async function MeusTrabalhos() {
  const perfil = await exigirPapel('aluno')
  const supabase = await createClient()
  const { data: trabalhos, error } = await listarTrabalhosDoAutor(supabase, perfil.id)

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Meus trabalhos</h1>
        <Link
          href="/painel/meus-trabalhos/novo"
          className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Novo trabalho
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          Não foi possível carregar seus trabalhos.
        </p>
      )}

      {!error && trabalhos.length === 0 && (
        <p className="mt-6 text-sm opacity-70">
          Você ainda não tem trabalhos. Clique em &quot;Novo trabalho&quot; para começar.
        </p>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {(trabalhos ?? []).map((t) => (
          <li key={t.id}>
            <Link
              href={`/painel/meus-trabalhos/${t.id}`}
              className="flex items-center justify-between gap-4 rounded border border-gray-300 px-4 py-3 hover:bg-gray-50 hover:text-black"
            >
              <span className="font-medium">{t.titulo}</span>
              <StatusBadge status={t.status} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
