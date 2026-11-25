import Link from 'next/link'

// Layout das páginas públicas (receita 15). Não lê cookies de propósito,
// para que as páginas do acervo possam ser geradas estaticamente.
export default function LayoutPublico({ children }) {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-4 border-b border-gray-300 px-6 py-3">
        <Link href="/" className="font-semibold">
          Repositório de TCC
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="underline">
            Acervo
          </Link>
          <Link href="/painel" className="underline">
            Entrar
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>

      <footer className="mx-auto max-w-4xl px-6 py-6 text-xs opacity-60">
        Repositório institucional de trabalhos de conclusão de curso.
      </footer>
    </div>
  )
}
