// Layout do painel restrito (requer autenticação)
export default function PainelLayout({ children }) {
  return (
    <div>
      <nav>{/* Navegação do painel */}</nav>
      <main>{children}</main>
    </div>
  )
}
