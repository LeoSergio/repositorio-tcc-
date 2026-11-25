'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconeFechar, IconeMenu } from '@/components/layout/Icones'
import { LINKS_PUBLICOS } from '@/lib/navegacao'

// Até este número de links, o celular mostra botões lado a lado.
// Acima disso, vira o menu hambúrguer (o botão ☰ abre uma lista).
const LIMITE_BOTOES = 3

// Client Component: precisa de usePathname (página atual) e de estado (menu aberto).
// Devolve um fragmento: seus elementos viram itens do flex do CabecalhoPublico,
// e as classes "order" definem a posição no celular e no computador.
export default function NavPublica() {
  const pathname = usePathname()
  const [aberto, setAberto] = useState(false)
  const usaMenu = LINKS_PUBLICOS.length > LIMITE_BOTOES

  // Fecha o menu ao trocar de página e ao apertar Esc
  useEffect(() => setAberto(false), [pathname])
  useEffect(() => {
    if (!aberto) return
    const fechar = (e) => e.key === 'Escape' && setAberto(false)
    window.addEventListener('keydown', fechar)
    return () => window.removeEventListener('keydown', fechar)
  }, [aberto])

  const ativo = (l) => (l.exato ? pathname === l.href : pathname.startsWith(l.href))
  const atual = (l) => (ativo(l) ? 'page' : undefined)

  return (
    <>
      <Link
        href="/painel"
        className="order-2 ml-auto rounded-lg bg-marca px-5 py-2.5 text-sm font-semibold text-white hover:bg-marca-escuro md:order-3 md:ml-0"
      >
        Entrar
      </Link>

      {/* Computador: links simples */}
      <nav className="hidden items-center gap-7 md:order-2 md:ml-auto md:flex" aria-label="Principal">
        {LINKS_PUBLICOS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={atual(l)}
            className={`text-sm ${ativo(l) ? 'font-semibold text-marca' : 'text-slate-600 hover:text-marca'}`}
          >
            {l.texto}
          </Link>
        ))}
      </nav>

      {usaMenu ? (
        <>
          {/* Celular, muitos links: botão ☰ e lista */}
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-controls="menu-publico"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            className="order-2 flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-marca md:hidden"
          >
            {aberto ? <IconeFechar className="h-5 w-5" /> : <IconeMenu className="h-5 w-5" />}
          </button>

          {aberto && (
            <nav
              id="menu-publico"
              aria-label="Principal"
              className="order-3 flex w-full flex-col gap-1 border-t border-slate-200 pt-3 md:hidden"
            >
              {LINKS_PUBLICOS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={atual(l)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${
                    ativo(l) ? 'bg-marca-claro font-semibold text-marca' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <l.Icone className="h-5 w-5" /> {l.texto}
                </Link>
              ))}
            </nav>
          )}
        </>
      ) : (
        // Celular, poucos links: botões lado a lado
        <nav
          className="order-3 grid w-full gap-2 md:hidden"
          style={{ gridTemplateColumns: `repeat(${LINKS_PUBLICOS.length}, minmax(0, 1fr))` }}
          aria-label="Principal"
        >
          {LINKS_PUBLICOS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={atual(l)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                ativo(l)
                  ? 'border-marca/20 bg-marca-claro font-semibold text-marca'
                  : 'border-slate-200 bg-white text-slate-600 hover:text-marca'
              }`}
            >
              <l.Icone className="h-4 w-4" /> {l.texto}
            </Link>
          ))}
        </nav>
      )}
    </>
  )
}
