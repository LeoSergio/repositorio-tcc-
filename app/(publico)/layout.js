import CabecalhoPublico from '@/components/layout/CabecalhoPublico'
import RodapePublico from '@/components/layout/RodapePublico'

// Layout das páginas públicas (receita 15). Não lê cookies de propósito,
// para que a home e as páginas dos trabalhos possam ser geradas estaticamente.
export default function LayoutPublico({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <CabecalhoPublico />
      <div className="flex-1">{children}</div>
      <RodapePublico />
    </div>
  )
}
