import { IconeCasa, IconeInfo, IconeLivro } from '@/components/layout/Icones'

// Links do menu público. Para criar uma opção nova, basta acrescentar uma linha aqui:
// o cabeçalho se adapta sozinho (veja LIMITE_BOTOES em components/layout/NavPublica.js).
//   href:  endereço da página
//   texto: o que aparece no menu
//   Icone: ícone mostrado no celular
//   exato: true = só fica destacado em /, e não em /qualquercoisa
export const LINKS_PUBLICOS = [
  { href: '/', texto: 'Início', Icone: IconeCasa, exato: true },
  { href: '/acervo', texto: 'Acervo', Icone: IconeLivro },
  { href: '/sobre', texto: 'Sobre', Icone: IconeInfo },
]
