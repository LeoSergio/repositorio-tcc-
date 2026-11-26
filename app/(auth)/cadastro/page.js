import Link from 'next/link'
import CartaoAuth from '@/components/auth/CartaoAuth'
import FormCadastro from '@/components/auth/FormCadastro'

export const metadata = { title: 'Cadastro | Repositório de TCC • UFRN' }

export default function PaginaCadastro() {
  return (
    <CartaoAuth>
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Cadastro de aluno</p>
      <h1 className="mt-3 text-3xl font-bold text-marca">Criar conta</h1>
      <p className="mt-2 mb-6 text-slate-500">
        Professores e coordenação recebem acesso da administração.
      </p>

      <FormCadastro />

      <div className="mt-6 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        <p>Já possui cadastro?</p>
        <Link href="/login" className="mt-2 inline-block font-semibold text-marca underline">
          Entrar
        </Link>
      </div>
    </CartaoAuth>
  )
}
