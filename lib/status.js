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
  rascunho: 'bg-gray-200 text-gray-800',
  em_revisao: 'bg-yellow-100 text-yellow-900',
  devolvido: 'bg-red-100 text-red-800',
  aprovado: 'bg-green-100 text-green-800',
  publicado: 'bg-blue-100 text-blue-800',
}

// Só nestes status o aluno pode editar, enviar PDF novo ou excluir
export const STATUS_EDITAVEIS = ['rascunho', 'devolvido']
