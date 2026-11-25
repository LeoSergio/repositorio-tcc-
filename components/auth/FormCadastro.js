'use client'

import { useActionState } from 'react'
import { cadastrar } from '@/app/actions/authActions'

const campo = 'rounded border border-gray-300 bg-white px-3 py-2 text-black'

export default function FormCadastro() {
  const [estado, acao, pendente] = useActionState(cadastrar, null)

  return (
    <form action={acao} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Nome completo
        <input name="nome" type="text" required minLength={3} autoComplete="name" className={campo} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        E-mail
        <input name="email" type="email" required autoComplete="email" className={campo} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Senha (mínimo 8 caracteres)
        <input
          name="senha"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={campo}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Confirme a senha
        <input
          name="confirmacao"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={campo}
        />
      </label>

      {estado?.erro && (
        <p role="alert" className="rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          {estado.erro}
        </p>
      )}
      {estado?.sucesso && (
        <p role="status" className="rounded bg-green-100 px-3 py-2 text-sm text-green-800">
          {estado.sucesso}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {pendente ? 'Criando conta...' : 'Criar conta de aluno'}
      </button>
    </form>
  )
}
