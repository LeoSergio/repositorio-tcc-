'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Server Actions de autenticação (receita 20).
// Cada uma recebe (estadoAnterior, formData) para funcionar com useActionState
// e devolve { erro } ou { sucesso } para a tela mostrar a mensagem.
// Atenção: redirect() lança uma exceção interna do Next.js. Não o coloque
// dentro de try/catch.

const MENSAGENS_DE_ERRO = {
  user_already_exists: 'Este e-mail já está cadastrado.',
  email_exists: 'Este e-mail já está cadastrado.',
  weak_password: 'Senha fraca. Use pelo menos 8 caracteres.',
  email_address_invalid: 'E-mail inválido.',
  over_email_send_rate_limit: 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  signup_disabled: 'O cadastro está desativado no momento.',
}

function traduzirErro(error) {
  return MENSAGENS_DE_ERRO[error?.code] ?? 'Não foi possível concluir. Tente novamente.'
}

export async function entrar(estadoAnterior, formData) {
  const email = String(formData.get('email') ?? '').trim()
  const senha = String(formData.get('senha') ?? '')

  if (!email || !senha) {
    return { erro: 'Informe o e-mail e a senha.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

  if (error) {
    // Mensagem genérica de propósito: não revela se o e-mail existe
    return { erro: 'E-mail ou senha incorretos.' }
  }

  redirect('/painel')
}

export async function cadastrar(estadoAnterior, formData) {
  const nome = String(formData.get('nome') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const senha = String(formData.get('senha') ?? '')
  const confirmacao = String(formData.get('confirmacao') ?? '')

  if (nome.length < 3) return { erro: 'Informe seu nome completo.' }
  if (!email) return { erro: 'Informe o e-mail.' }
  if (senha.length < 8) return { erro: 'A senha precisa ter pelo menos 8 caracteres.' }
  if (senha !== confirmacao) return { erro: 'As senhas não conferem.' }

  const supabase = await createClient()

  // O papel NUNCA vem do formulário: o banco cria todo cadastro como "aluno".
  // O nome vai nos metadados e o gatilho do banco o copia para a tabela perfis.
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome } },
  })

    if (error) {
    // Só aparece quando a senha está certa e falta confirmar o e-mail
    if (error.code === 'email_not_confirmed') {
      return { erro: 'Confirme seu e-mail antes de entrar. Veja a caixa de entrada.' }
    }
    // Mensagem genérica de propósito: não revela se o e-mail existe
    return { erro: 'E-mail ou senha incorretos.' }
  }

  // Com "Confirm email" desligado, a sessão já vem pronta.
  if (!data.session) {
    return { sucesso: 'Conta criada! Confirme o cadastro pelo e-mail enviado e depois entre.' }
  }

  redirect('/painel')
}

export async function sair() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
