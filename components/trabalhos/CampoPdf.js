'use client'

import { useState } from 'react'

function formatarTamanho(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

// Área de upload do PDF. O <input type="file"> continua dentro do formulário
// (name="arquivo"), então o FormTrabalho lê o arquivo normalmente com FormData.
// O <label> faz o papel do botão: clicar nele abre a janela de escolha de arquivo.
export default function CampoPdf({ jaTemArquivo = false }) {
  const [arquivo, setArquivo] = useState(null)

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-900">Arquivo PDF (máx. 20 MB)</span>

      <label
        htmlFor="arquivo"
        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-8 text-center hover:border-marca hover:bg-marca-claro focus-within:border-marca focus-within:outline-2 focus-within:outline-marca/30"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-8 w-8 text-marca"
        >
          <path d="M12 16V5" />
          <path d="m7.5 9.5 4.5-4.5 4.5 4.5" />
          <path d="M5 19.5h14" />
        </svg>

        {arquivo ? (
          <span className="text-sm font-semibold text-slate-900">
            {arquivo.name} <span className="font-normal text-slate-500">({formatarTamanho(arquivo.size)})</span>
          </span>
        ) : (
          <span className="text-sm font-semibold text-marca">Clique para escolher o PDF</span>
        )}
        <span className="text-xs text-slate-500">
          {arquivo
            ? 'Clique de novo para trocar o arquivo.'
            : jaTemArquivo
              ? 'Já existe um PDF enviado. Escolha outro apenas se quiser substituí-lo.'
              : 'Somente arquivos .pdf'}
        </span>

        <input
          id="arquivo"
          name="arquivo"
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  )
}