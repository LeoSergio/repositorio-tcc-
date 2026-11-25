'use client'

import { ORDENACOES } from '@/lib/ordenacoes'

// Seletor de ordenação: ao mudar, envia o formulário de busca (mantendo os filtros).
// Sem JavaScript ele continua funcionando: vale ao clicar em "Pesquisar".
export default function OrdenarSelect({ valor }) {
  return (
    <select
      name="ordem"
      defaultValue={valor}
      aria-label="Ordenar resultados"
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-marca"
    >
      {Object.entries(ORDENACOES).map(([chave, { rotulo }]) => (
        <option key={chave} value={chave}>
          {rotulo}
        </option>
      ))}
    </select>
  )
}
