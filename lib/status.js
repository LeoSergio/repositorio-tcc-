// Rótulos e cores dos status de um trabalho.
// As classes do Tailwind aparecem escritas por inteiro de propósito:
// o Tailwind só gera as classes que encontra no texto dos arquivos.

export const ROTULO_STATUS = {
  rascunho: 'Rascunho',
  em_revisao: 'Em revisão',
  devolvido: 'Devolvido',
  aprovado: 'Aprovado',
  publicado: 'Publicado',
}

export const CLASSE_STATUS = {
  rascunho: 'border border-slate-200 bg-slate-100 text-slate-700',
  em_revisao: 'border border-sky-200 bg-sky-100 text-sky-800',
  devolvido: 'border border-amber-200 bg-amber-100 text-amber-800',
  aprovado: 'border border-emerald-200 bg-emerald-100 text-emerald-800',
  publicado: 'border border-[#164194]/25 bg-[#164194]/10 text-[#164194]',
}

// Só nestes status o aluno pode editar, enviar PDF novo ou excluir
export const STATUS_EDITAVEIS = ['rascunho', 'devolvido']
