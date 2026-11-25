import { exigirPapel } from '@/lib/auth'

export const metadata = { title: 'Gestão | Repositório de TCC' }

// Tela provisória: será substituída pela lista de trabalhos aprovados para publicar.
export default async function Gestao() {
  const perfil = await exigirPapel('coordenador', 'admin')

  return (
    <section>
      <h1 className="text-2xl font-semibold">Gestão do acervo</h1>
      <p className="mt-2 text-sm opacity-70">
        Olá, {perfil.nome}. Aqui ficarão os trabalhos aprovados aguardando publicação.
      </p>
    </section>
  )
}
