import Link from 'next/link'
import FormCadastro from '@/components/auth/FormCadastro'

export const metadata = { title: 'Cadastro | Repositório de TCC' }

export default function PaginaCadastro() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <header>
        <h1 className="text-2xl font-semibold">Cadastro de aluno</h1>
        <p className="mt-1 text-sm opacity-70">
          Professores e coordenação recebem acesso da administração.
        </p>
      </header>

      <FormCadastro />

      <p className="text-sm">
        Já tem conta?{' '}
        <Link href="/login" className="text-blue-600 underline">
          Entrar
        </Link>
      </p>
    </main>
  )
}
