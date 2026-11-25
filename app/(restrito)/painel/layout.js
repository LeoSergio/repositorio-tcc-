import Link from 'next/link'
import { exigirPerfil } from '@/lib/auth'
import { sair } from '@/app/actions/authActions'

// Layout das páginas restritas (receita 15).
// Camada 2 da proteção: se não houver sessão, redireciona para o login.
const ROTULO_DO_PAPEL = {
  aluno: 'Aluno',
  orientador: 'Professor',
  coordenador: 'Coordenação',
  admin: 'Administrador',
}

export default async function LayoutPainel({ children }) {
  const perfil = await exigirPerfil()

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-4 border-b border-gray-300 px-6 py-3">
        <Link href="/painel" className="font-semibold">
          Repositório de TCC
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <span>
            {perfil.nome}{' '}
            <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-800">
              {ROTULO_DO_PAPEL[perfil.papel] ?? perfil.papel}
            </span>
          </span>
          <form action={sair}>
            <button type="submit" className="underline">
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  )
}
