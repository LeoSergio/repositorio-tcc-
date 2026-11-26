import { redirect } from 'next/navigation'
import CartaoAuth from '@/components/auth/CartaoAuth'
import { getSessao } from '@/lib/auth'
import { sair } from '@/app/actions/authActions'

export const metadata = { title: 'Perfil não encontrado | Repositório de TCC • UFRN' }

// Caso raro: a conta existe no login, mas não tem perfil no banco
// (por exemplo, foi criada antes de o esquema ser instalado).
export default async function PaginaSemPerfil() {
  const { user, perfil } = await getSessao()
  if (!user) redirect('/login')
  if (perfil) redirect('/painel')

  return (
    <CartaoAuth>
      <h1 className="text-2xl font-bold text-marca">Perfil não encontrado</h1>
      <p className="mt-3 mb-6 text-sm text-slate-600">
        Sua conta ({user.email}) entrou, mas não tem um perfil no sistema. Peça à administração para
        recriar a conta e tente de novo.
      </p>
      <form action={sair}>
        <button
          type="submit"
          className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-marca hover:bg-marca-claro"
        >
          Sair
        </button>
      </form>
    </CartaoAuth>
  )
}
