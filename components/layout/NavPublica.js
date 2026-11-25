'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Único trecho do cabeçalho que precisa ser Client Component:
// usePathname() serve para destacar o link da página atual.
export default function NavPublica() {
  const pathname = usePathname()
  const ativo = (ok) => (ok ? 'font-semibold text-marca' : 'text-slate-600 hover:text-marca')

  return (
    <nav className="flex items-center gap-5 text-sm sm:gap-7" aria-label="Principal">
      <Link href="/" className={ativo(pathname === '/')}>
        Início
      </Link>
      <Link href="/acervo" className={ativo(pathname.startsWith('/acervo'))}>
        Acervo
      </Link>
      <Link
        href="/painel"
        className="rounded-lg bg-marca px-5 py-2.5 font-semibold text-white hover:bg-marca-escuro"
      >
        Entrar
      </Link>
    </nav>
  )
}
