'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TAMANHO_MAXIMO = 20 * 1024 * 1024 // 20 MB

async function chamarApi(url, metodo, corpo) {
  const res = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao falar com o servidor.')
  return json
}

// Formulário de criar/editar trabalho (receitas 16 e 17: formulário + componente cliente).
// Fluxo ao salvar: API grava os dados -> navegador envia o PDF direto ao Storage
// -> API registra a versão -> (se "enviar") API muda o status para em_revisao.
export default function FormTrabalho({ trabalho = null, cursos, orientadores }) {
  const router = useRouter()
  const [erro, setErro] = useState(null)
  const [pendente, setPendente] = useState(false)
  const anoAtual = new Date().getFullYear()

  async function aoEnviar(evento) {
    evento.preventDefault()
    const form = evento.currentTarget
    const acao = evento.nativeEvent.submitter?.value ?? 'salvar'
    const dados = new FormData(form)
    const arquivo = dados.get('arquivo')
    const temArquivo = arquivo && arquivo.size > 0

    setErro(null)

    if (temArquivo) {
      if (arquivo.type !== 'application/pdf' && !arquivo.name.toLowerCase().endsWith('.pdf')) {
        return setErro('O arquivo precisa ser um PDF.')
      }
      if (arquivo.size > TAMANHO_MAXIMO) return setErro('O PDF pode ter no máximo 20 MB.')
    }

    setPendente(true)
    try {
      const corpo = {
        titulo: dados.get('titulo'),
        resumo: dados.get('resumo'),
        palavras_chave: dados.get('palavras_chave'),
        ano: dados.get('ano'),
        curso_id: dados.get('curso_id'),
        orientador_id: dados.get('orientador_id'),
        autorizacao_publicacao: dados.get('autorizacao_publicacao') === 'on',
      }

      // 1) cria ou atualiza os dados
      const salvo = trabalho
        ? await chamarApi(`/api/trabalhos/${trabalho.id}`, 'PUT', corpo)
        : await chamarApi('/api/trabalhos', 'POST', corpo)
      const id = salvo.trabalho.id

      // 2) PDF: vai direto do navegador ao Storage (Server Actions limitam o corpo a 1 MB)
      if (temArquivo) {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error('Sessão expirada. Entre novamente.')

        const caminho = `${user.id}/${id}/${crypto.randomUUID()}.pdf`
        const { error } = await supabase.storage
          .from('trabalhos')
          .upload(caminho, arquivo, { contentType: 'application/pdf' })
        if (error) throw new Error('Falha ao enviar o PDF: ' + error.message)

        // 3) registra a versão
        await chamarApi(`/api/trabalhos/${id}/arquivo`, 'POST', { caminho })
      }

      // 4) envio para revisão
      if (acao === 'enviar') {
        await chamarApi(`/api/trabalhos/${id}/enviar`, 'POST')
      }

      router.push(`/painel/meus-trabalhos/${id}`)
      router.refresh()
    } catch (e) {
      setErro(e.message)
      setPendente(false)
    }
  }

  const campo = 'rounded border border-gray-300 bg-white px-3 py-2 text-black'

  return (
    <form onSubmit={aoEnviar} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Título
        <input
          name="titulo"
          required
          minLength={5}
          maxLength={300}
          defaultValue={trabalho?.titulo ?? ''}
          className={campo}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Resumo
        <textarea
          name="resumo"
          rows={6}
          maxLength={5000}
          defaultValue={trabalho?.resumo ?? ''}
          className={campo}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Palavras-chave (separadas por vírgula)
        <input
          name="palavras_chave"
          defaultValue={(trabalho?.palavras_chave ?? []).join(', ')}
          className={campo}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          Ano
          <input
            name="ano"
            type="number"
            min={2000}
            max={2100}
            defaultValue={trabalho?.ano ?? anoAtual}
            className={campo}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Curso
          <select name="curso_id" defaultValue={trabalho?.curso_id ?? ''} className={campo}>
            <option value="">Selecione...</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Orientador
          <select
            name="orientador_id"
            defaultValue={trabalho?.orientador_id ?? ''}
            className={campo}
          >
            <option value="">Selecione...</option>
            {orientadores.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Arquivo PDF (máx. 20 MB)
        <input name="arquivo" type="file" accept="application/pdf" className="text-sm" />
        {trabalho?.arquivo_path && (
          <span className="text-xs opacity-70">
            Já existe um PDF enviado. Escolha outro arquivo apenas se quiser substituí-lo.
          </span>
        )}
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input
          name="autorizacao_publicacao"
          type="checkbox"
          defaultChecked={trabalho?.autorizacao_publicacao ?? false}
          className="mt-1"
        />
        Autorizo a publicação deste trabalho no repositório público.
      </label>

      {erro && (
        <p role="alert" className="rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="acao"
          value="salvar"
          disabled={pendente}
          className="rounded border border-blue-700 px-4 py-2 font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60"
        >
          {pendente ? 'Aguarde...' : 'Salvar rascunho'}
        </button>
        <button
          type="submit"
          name="acao"
          value="enviar"
          disabled={pendente}
          className="rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-60"
        >
          Salvar e enviar para revisão
        </button>
      </div>
    </form>
  )
}
