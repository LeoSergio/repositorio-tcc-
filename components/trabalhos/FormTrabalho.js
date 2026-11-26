'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CampoPdf from '@/components/trabalhos/CampoPdf'

const TAMANHO_MAXIMO = 20 * 1024 * 1024 // 20 MB

// crypto.randomUUID() só existe em HTTPS ou localhost. getRandomValues funciona em qualquer endereço.
function gerarId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

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

        const caminho = `${user.id}/${id}/${gerarId()}.pdf`
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

  const campo =
    'rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-marca focus:outline-2 focus:outline-marca/30'
  const rotulo = 'flex flex-col gap-2 text-sm font-medium text-slate-900'

  return (
    <form onSubmit={aoEnviar} className="flex flex-col gap-4">
      <label className={rotulo}>
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

      <label className={rotulo}>
        Resumo
        <textarea
          name="resumo"
          rows={6}
          maxLength={5000}
          defaultValue={trabalho?.resumo ?? ''}
          className={campo}
        />
      </label>

      <label className={rotulo}>
        Palavras-chave (separadas por vírgula)
        <input
          name="palavras_chave"
          defaultValue={(trabalho?.palavras_chave ?? []).join(', ')}
          className={campo}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={rotulo}>
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

        <label className={rotulo}>
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

        <label className={rotulo}>
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

      <CampoPdf jaTemArquivo={Boolean(trabalho?.arquivo_path)} />

      <label className="flex items-start gap-3 text-sm text-slate-700">
        <input
          name="autorizacao_publicacao"
          type="checkbox"
          defaultChecked={trabalho?.autorizacao_publicacao ?? false}
          className="mt-0.5 h-4 w-4"
        />
        Autorizo a publicação deste trabalho no repositório público.
      </label>

      {erro && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="acao"
          value="salvar"
          disabled={pendente}
          className="rounded-lg border border-marca px-5 py-3 font-semibold text-marca hover:bg-marca-claro disabled:opacity-60"
        >
          {pendente ? 'Aguarde...' : 'Salvar rascunho'}
        </button>
        <button
          type="submit"
          name="acao"
          value="enviar"
          disabled={pendente}
          className="rounded-lg bg-marca px-5 py-3 font-semibold text-white hover:bg-marca-escuro disabled:opacity-60"
        >
          Salvar e enviar para revisão
        </button>
      </div>
    </form>
  )
}