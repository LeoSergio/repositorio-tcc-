'use client'

import { useState } from 'react'
import { IconeFiltro } from '@/components/layout/Icones'

// No celular, os filtros ficam escondidos atrás do botão "Filtros".
// No computador (lg) o painel aparece sempre, ao lado dos resultados.
// Os campos escondidos continuam no formulário e são enviados normalmente.
export default function PainelFiltros({ children, ativos = 0 }) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-marca lg:hidden"
      >
        <IconeFiltro className="h-4 w-4" />
        Filtros{ativos > 0 ? ` (${ativos})` : ''}
      </button>

      <div className={`${aberto ? 'block' : 'hidden'} lg:block`}>{children}</div>
    </div>
  )
}
