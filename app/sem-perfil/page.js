import { redirect } from 'next/navigation'
import { getSessao } from '@/lib/auth'
import { sair } from '@/app/actions/authActions'

export const metadata = { title: 'Perfil não encontrado | Repositório de TCC' }

// Caso raro: a conta existe no login, mas não tem perfil no banco
// (por exemplo, foi criada antes de o esquema ser instalado).
export default async function PaginaSemPerfil() {
  const { user, perfil } = await getSessao()
  if (!user) redirect('/login')
  if (perfil) redirect('/painel')

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Perfil não encontrado</h1>
      <p className="text-sm">
        Sua conta ({user.email}) entrou, mas não tem um perfil no sistema. Peça à administração para
        recriar a conta e tente de novo.
      </p>
      <form action={sair}>
        <button type="submit" className="rounded border border-gray-400 px-4 py-2 text-sm">
          Sair
        </button>
      </form>
    </main>
  )
}
