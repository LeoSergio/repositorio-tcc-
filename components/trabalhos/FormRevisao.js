'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Formulário do professor: aprovar ou devolver com comentário.
// Envia para POST /api/trabalhos/[id]/revisao
export default function FormRevisao({ id }) {
  const router = useRouter()
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState(null)
  const [pendente, setPendente] = useState(false)

  async function decidir(decisao) {
    setErro(null)
    if (decisao === 'devolvido' && texto.trim() === '') {
      return setErro('Escreva o motivo da devolução para o aluno.')
    }
    setPendente(true)
    try {
      const res = await fetch(`/api/trabalhos/${id}/revisao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisao, texto }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.erro ?? 'Não foi possível registrar a decisão.')
      router.push('/painel/revisoes')
      router.refresh()
    } catch (e) {
      setErro(e.message)
      setPendente(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        <span>Comentário do orientador (obrigatório ao devolver)</span>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={5}
          maxLength={3000}
          placeholder="Descreva observações, elogios ou ajustes necessários no trabalho..."
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0095DB] focus:outline-none focus:ring-2 focus:ring-[#0095DB]/20"
        />
        <span className="self-end text-xs font-normal text-slate-400">
          {texto.length}/3000 caracteres
        </span>
      </label>

      {erro && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => decidir('aprovado')}
          disabled={pendente}
          className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 disabled:opacity-60"
        >
          {pendente ? 'Salvando...' : 'Aprovar trabalho'}
        </button>
        <button
          type="button"
          onClick={() => decidir('devolvido')}
          disabled={pendente}
          className="rounded-lg border border-amber-600 bg-white px-5 py-2.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-60"
        >
          Devolver ao aluno
        </button>
      </div>
    </div>
  )
}
