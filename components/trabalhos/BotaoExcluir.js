'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Chama DELETE /api/trabalhos/[id] (exclusão lógica)
export default function BotaoExcluir({ id }) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)
  const [pendente, setPendente] = useState(false)
  const [erro, setErro] = useState(null)

  async function excluir() {
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
      setConfirmando(false)
    }
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="text-sm font-medium text-red-600 underline-offset-2 hover:text-red-700 hover:underline"
      >
        Excluir trabalho
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-800">Confirmar exclusão</p>
      <p className="text-sm text-red-700">
        Isso removerá o trabalho da sua lista. Você não poderá desfazer por conta própria.
      </p>
      {erro && (
        <p role="alert" className="rounded bg-red-100 px-3 py-2 text-xs text-red-800">
          {erro}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={excluir}
          disabled={pendente}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60"
        >
          {pendente ? 'Excluindo...' : 'Sim, excluir'}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          disabled={pendente}
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
