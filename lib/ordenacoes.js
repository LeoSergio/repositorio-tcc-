// Ordenações do acervo. Fica separado de lib/server/acervo.js porque o seletor
// é um Client Component e não pode importar código que usa o banco.
export const ORDENACOES = {
  recentes: { rotulo: 'Mais recentes', coluna: 'published_at', asc: false },
  antigos: { rotulo: 'Mais antigos', coluna: 'published_at', asc: true },
  titulo: { rotulo: 'Título (A–Z)', coluna: 'titulo', asc: true },
}
