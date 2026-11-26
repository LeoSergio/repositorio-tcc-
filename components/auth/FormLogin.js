'use client'

import { useActionState } from 'react'
import { entrar } from '@/app/actions/authActions'
import { alertaErro, botaoPrincipal, campo, rotulo } from '@/components/auth/estilos'

export default function FormLogin() {
  const [estado, acao, pendente] = useActionState(entrar, null)

  return (
    <form action={acao} className="flex flex-col gap-5">
      <label className={rotulo}>
        E-mail institucional
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="seu.nome@ufrn.edu.br"
          className={campo}
        />
      </label>

      <label className={rotulo}>
        Senha
        <input
          name="senha"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Digite sua senha"
          className={campo}
        />
      </label>

      {estado?.erro && (
        <p role="alert" className={alertaErro}>
          {estado.erro}
        </p>
      )}

      <button type="submit" disabled={pendente} className={botaoPrincipal}>
        {pendente ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
