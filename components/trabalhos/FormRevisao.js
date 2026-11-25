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
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Comentário (obrigatório ao devolver)
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={5}
          maxLength={3000}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-black"
        />
      </label>

      {erro && (
        <p role="alert" className="rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => decidir('aprovado')}
          disabled={pendente}
          className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          Aprovar
        </button>
        <button
          type="button"
          onClick={() => decidir('devolvido')}
          disabled={pendente}
          className="rounded border border-red-700 px-4 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          Devolver ao aluno
        </button>
      </div>
    </div>
  )
}
