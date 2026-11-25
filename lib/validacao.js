// Validação dos dados que chegam do formulário ou da API.
// Mesmo com esta validação, o banco continua sendo a última barreira (RLS e gatilhos).

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function ehUuid(valor) {
  return typeof valor === 'string' && UUID.test(valor)
}

function textoOuNulo(valor) {
  if (valor === null || valor === undefined) return null
  const texto = String(valor).trim()
  return texto === '' ? null : texto
}

// Aceita "a, b, c" (texto do formulário) ou ["a", "b", "c"] (JSON)
function normalizarPalavrasChave(valor) {
  const lista = Array.isArray(valor) ? valor : typeof valor === 'string' ? valor.split(',') : []
  const vistas = new Set()
  const saida = []

  for (const item of lista) {
    const palavra = String(item).trim()
    if (!palavra) continue
    const chave = palavra.toLowerCase()
    if (vistas.has(chave)) continue
    vistas.add(chave)
    saida.push(palavra)
  }
  return saida
}

// Devolve { dados, erros }. Se "erros" tiver itens, não grave nada.
// O autor, o status e as datas NUNCA vêm daqui: são definidos no servidor.
export function validarTrabalho(corpo) {
  const erros = []

  const titulo = textoOuNulo(corpo?.titulo)
  if (!titulo || titulo.length < 5 || titulo.length > 300) {
    erros.push('O título precisa ter entre 5 e 300 caracteres.')
  }

  const resumo = textoOuNulo(corpo?.resumo)
  if (resumo && resumo.length > 5000) {
    erros.push('O resumo pode ter no máximo 5000 caracteres.')
  }

  const palavras = normalizarPalavrasChave(corpo?.palavras_chave)
  if (palavras.length > 10) erros.push('Use no máximo 10 palavras-chave.')
  if (palavras.some((p) => p.length > 40)) {
    erros.push('Cada palavra-chave pode ter no máximo 40 caracteres.')
  }

  let ano = null
  const anoTexto = textoOuNulo(corpo?.ano)
  if (anoTexto !== null) {
    ano = Number(anoTexto)
    if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) {
      erros.push('Informe um ano válido (entre 2000 e 2100).')
      ano = null
    }
  }

  const cursoId = textoOuNulo(corpo?.curso_id)
  if (cursoId && !ehUuid(cursoId)) erros.push('Curso inválido.')

  const orientadorId = textoOuNulo(corpo?.orientador_id)
  if (orientadorId && !ehUuid(orientadorId)) erros.push('Orientador inválido.')

  return {
    erros,
    dados: {
      titulo,
      resumo,
      palavras_chave: palavras,
      ano,
      curso_id: cursoId,
      orientador_id: orientadorId,
      autorizacao_publicacao: corpo?.autorizacao_publicacao === true,
    },
  }
}
