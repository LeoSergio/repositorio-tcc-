// Layout raiz da aplicação
export const metadata = {
  title: 'Repositório TCC',
  description: 'Repositório de Trabalhos de Conclusão de Curso',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
