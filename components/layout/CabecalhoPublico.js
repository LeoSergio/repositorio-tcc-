import Link from 'next/link'
import NavPublica from '@/components/layout/NavPublica'
import { IconeLivro } from '@/components/layout/Icones'

// A marca fica aqui; o menu e o botão Entrar ficam em NavPublica (Client Component).
// Celular: 1ª linha = marca + Entrar (+ ☰ quando há muitos links); depois os links.
// Computador: tudo numa linha.
export default function CabecalhoPublico() {
  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-3 px-4 py-4 sm:px-6 md:gap-x-4 md:py-5">
        <Link href="/" className="order-1 flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-marca text-white">
            <IconeLivro className="h-6 w-6" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-base font-bold text-marca md:text-lg">
              Repositório de TCC<span className="hidden md:inline"> • UFRN</span>
            </span>
            <span className="block text-xs text-slate-500 md:hidden">UFRN • Acesso aberto</span>
            <span className="hidden text-xs text-slate-500 md:block">
              Universidade Federal do Rio Grande do Norte
            </span>
          </span>
        </Link>

        <NavPublica />
      </div>
    </header>
  )
}
