import Link from 'next/link'
import FormLogin from '@/components/auth/FormLogin'

export const metadata = { title: 'Entrar | Repositório de TCC' }

export default function PaginaLogin() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <header>
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <p className="mt-1 text-sm opacity-70">Repositório de TCC</p>
      </header>

      <FormLogin />

      <p className="text-sm">
        Aluno e ainda não tem conta?{' '}
        <Link href="/cadastro" className="text-blue-600 underline">
          Cadastre-se
        </Link>
      </p>
    </main>
  )
}
