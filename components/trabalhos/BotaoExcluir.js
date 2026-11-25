'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Chama DELETE /api/trabalhos/[id] (exclusão lógica)
export default function BotaoExcluir({ id }) {
  const router = useRouter()
  const [pendente, setPendente] = useState(false)
  const [erro, setErro] = useState(null)

  async function excluir() {
    if (!window.confirm('Excluir este trabalho? Esta ação não pode ser desfeita por você.')) return
    setPendente(true)
    setErro(null)
    try {
      const res = await fetch(`/api/trabalhos/${id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.erro ?? 'Não foi possível excluir.')
      router.push('/painel/meus-trabalhos')
      router.refresh()
    } catch (e) {
      setErro(e.message)
      setPendente(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={excluir}
        disabled={pendente}
        className="rounded border border-red-700 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        {pendente ? 'Excluindo...' : 'Excluir trabalho'}
      </button>
      {erro && (
        <p role="alert" className="mt-2 rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          {erro}
        </p>
      )}
    </div>
  )
}
