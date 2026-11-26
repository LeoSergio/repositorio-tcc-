import Link from 'next/link'

// Moldura das telas de entrada (login, cadastro, sem perfil):
// marca no topo, cartão branco no meio e link para o acervo embaixo.
// Server Component, sem estado. O "children" é o conteúdo do cartão.
export default function CartaoAuth({ children }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center border-t-2 border-marca px-4 py-10">
      <div className="w-full max-w-md">
        <header className="text-center">
          <Link href="/" className="inline-block">
            <span className="block text-3xl font-bold text-marca">UFRN</span>
            <span className="mt-2 block text-sm font-semibold text-marca">Repositório de TCC</span>
          </Link>
        </header>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/acervo" className="text-marca hover:underline">
            Voltar ao acervo
          </Link>
        </p>
      </div>
    </main>
  )
}
