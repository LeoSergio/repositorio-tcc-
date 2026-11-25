'use client'

import { useActionState } from 'react'
import { entrar } from '@/app/actions/authActions'

export default function FormLogin() {
  const [estado, acao, pendente] = useActionState(entrar, null)

  return (
    <form action={acao} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        E-mail
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded border border-gray-300 bg-white px-3 py-2 text-black"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Senha
        <input
          name="senha"
          type="password"
          required
          autoComplete="current-password"
          className="rounded border border-gray-300 bg-white px-3 py-2 text-black"
        />
      </label>

      {estado?.erro && (
        <p role="alert" className="rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {pendente ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
