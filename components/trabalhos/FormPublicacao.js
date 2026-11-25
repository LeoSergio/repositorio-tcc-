'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

async function enviar(id, corpo) {
  const res = await fetch(`/api/trabalhos/${id}/publicacao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.erro ?? 'Não foi possível concluir a ação.')
}

// Publicar (com embargo e licença opcionais) ou despublicar
export default function FormPublicacao({ id, status, autorizado, licencas, embargoAtual, licencaAtual }) {
  const router = useRouter()
  const [erro, setErro] = useState(null)
  const [pendente, setPendente] = useState(false)

  async function executar(corpo) {
    setErro(null)
    setPendente(true)
    try {
      await enviar(id, corpo)
      router.push('/painel/gestao')
      router.refresh()
    } catch (e) {
      setErro(e.message)
      setPendente(false)
    }
  }

  function publicar(evento) {
    evento.preventDefault()
    const d = new FormData(evento.currentTarget)
    executar({ acao: 'publicar', embargo_ate: d.get('embargo_ate'), licenca: d.get('licenca') })
  }

  const campo = 'rounded border border-gray-300 bg-white px-3 py-2 text-black'

  return (
    <div className="flex flex-col gap-4">
      {status === 'aprovado' ? (
        <form onSubmit={publicar} className="flex flex-col gap-4">
          {!autorizado && (
            <p className="rounded bg-yellow-100 px-3 py-2 text-sm text-yellow-900">
              O autor não marcou a autorização de publicação. O banco vai recusar a publicação.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Embargo do download até (opcional, máx. 3 anos)
              <input name="embargo_ate" type="date" defaultValue={embargoAtual ?? ''} className={campo} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Licença
              <select name="licenca" defaultValue={licencaAtual ?? ''} className={campo}>
                <option value="">Não informada</option>
                {licencas.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={pendente}
            className="self-start rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {pendente ? 'Aguarde...' : 'Publicar no acervo'}
          </button>
        </form>
      ) : (
        <button
          type="button"
          disabled={pendente}
          onClick={() => executar({ acao: 'despublicar' })}
          className="self-start rounded border border-red-700 px-4 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          {pendente ? 'Aguarde...' : 'Despublicar'}
        </button>
      )}

      {erro && (
        <p role="alert" className="rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          {erro}
        </p>
      )}
    </div>
  )
}
