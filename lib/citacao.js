// Monta a referência no formato ABNT de um TCC:
// SOBRENOME, Nome. Título. Ano. Trabalho de Conclusão de Curso (Curso) — Instituição, Cidade, Ano.
export const INSTITUICAO = 'Universidade Federal do Rio Grande do Norte'

export function citacaoAbnt({ autor, titulo, ano, curso }) {
  const partes = String(autor ?? '').trim().split(/\s+/).filter(Boolean)
  const sobrenome = partes.length > 1 ? partes[partes.length - 1].toUpperCase() : null
  const nome = partes.length > 1 ? partes.slice(0, -1).join(' ') : partes[0] ?? ''
  const autorFormatado = sobrenome ? `${sobrenome}, ${nome}` : nome

  return `${autorFormatado}. ${titulo}. ${ano}. Trabalho de Conclusão de Curso (${curso}) — ${INSTITUICAO}, Natal, ${ano}.`
}
