import Link from 'next/link'
import CartaoAuth from '@/components/auth/CartaoAuth'
import FormLogin from '@/components/auth/FormLogin'

export const metadata = { title: 'Entrar | Repositório de TCC • UFRN' }

export default function PaginaLogin() {
  return (
    <CartaoAuth>
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Acesso ao sistema</p>
      <h1 className="mt-3 text-3xl font-bold text-marca">Entrar no repositório</h1>
      <p className="mt-2 mb-6 text-slate-500">Informe seus dados para continuar.</p>

      <FormLogin />

      <div className="mt-6 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        <p>Ainda não possui cadastro?</p>
        <Link href="/cadastro" className="mt-2 inline-block font-semibold text-marca underline">
          Cadastre-se como aluno
        </Link>
      </div>
    </CartaoAuth>
  )
}
