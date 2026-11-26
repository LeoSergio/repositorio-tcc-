import Link from 'next/link'

export const metadata = { title: 'Página não encontrada | Repositório de TCC • UFRN' }

// Aparece quando uma página pública chama notFound() (ex.: trabalho inexistente ou despublicado)
export default function NaoEncontrado() {
  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-semibold text-ciano">Erro 404</p>
      <h1 className="mt-3 text-3xl font-bold text-marca">Página não encontrada</h1>
      <p className="mt-4 text-slate-600">
        O trabalho que você procura não existe ou não está mais publicado.
      </p>
      <Link
        href="/acervo"
        className="mt-8 inline-block rounded-lg bg-marca px-6 py-3 text-sm font-semibold text-white hover:bg-marca-escuro"
      >
        Voltar ao acervo
      </Link>
    </section>
  )
}
