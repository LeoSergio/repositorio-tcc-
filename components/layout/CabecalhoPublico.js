import Link from 'next/link'
import NavPublica from '@/components/layout/NavPublica'
import { IconeLivro } from '@/components/layout/Icones'

export default function CabecalhoPublico() {
  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-marca text-white">
            <IconeLivro className="h-6 w-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold text-marca">Repositório de TCC • UFRN</span>
            <span className="hidden text-xs text-slate-500 sm:block">
              Universidade Federal do Rio Grande do Norte
            </span>
          </span>
        </Link>
        <NavPublica />
      </div>
    </header>
  )
}
