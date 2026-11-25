import Link from 'next/link'

export default function RodapePublico() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:justify-between">
        <div className="text-sm text-slate-500">
          <p className="text-lg font-bold text-marca">Repositório de TCC • UFRN</p>
          <p className="mt-2">Universidade Federal do Rio Grande do Norte</p>
          <p className="mt-1">Preservar o conhecimento. Ampliar o acesso.</p>
          <p className="mt-4 text-xs">Protótipo demonstrativo • Projeto acadêmico</p>
        </div>
        <nav className="flex gap-6 text-sm text-marca" aria-label="Rodapé">
          <Link href="/sobre" className="hover:underline">
            Sobre o repositório
          </Link>
          <Link href="/sobre#contato" className="hover:underline">
            Ajuda e contato
          </Link>
        </nav>
      </div>
    </footer>
  )
}
