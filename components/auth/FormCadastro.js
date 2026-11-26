'use client'

import { useActionState } from 'react'
import { cadastrar } from '@/app/actions/authActions'
import {
  alertaErro,
  alertaSucesso,
  botaoPrincipal,
  campo,
  rotulo,
} from '@/components/auth/estilos'

export default function FormCadastro() {
  const [estado, acao, pendente] = useActionState(cadastrar, null)

  return (
    <form action={acao} className="flex flex-col gap-5">
      <label className={rotulo}>
        Nome completo
        <input
          name="nome"
          type="text"
          required
          minLength={3}
          autoComplete="name"
          placeholder="Seu nome completo"
          className={campo}
        />
      </label>

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
        Senha (mínimo 8 caracteres)
        <input
          name="senha"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Crie uma senha"
          className={campo}
        />
      </label>

      <label className={rotulo}>
        Confirme a senha
        <input
          name="confirmacao"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Repita a senha"
          className={campo}
        />
      </label>

      {estado?.erro && (
        <p role="alert" className={alertaErro}>
          {estado.erro}
        </p>
      )}
      {estado?.sucesso && (
        <p role="status" className={alertaSucesso}>
          {estado.sucesso}
        </p>
      )}

      <button type="submit" disabled={pendente} className={botaoPrincipal}>
        {pendente ? 'Criando conta...' : 'Criar conta de aluno'}
      </button>
    </form>
  )
}
