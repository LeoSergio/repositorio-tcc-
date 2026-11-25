import { exigirPapel } from '@/lib/auth'

export const metadata = { title: 'Revisões | Repositório de TCC' }

// Tela provisória: será substituída pela lista de trabalhos pendentes do professor.
export default async function Revisoes() {
  const perfil = await exigirPapel('orientador')

  return (
    <section>
      <h1 className="text-2xl font-semibold">Trabalhos para revisar</h1>
      <p className="mt-2 text-sm opacity-70">
        Olá, {perfil.nome}. Aqui ficarão os trabalhos dos seus orientandos aguardando revisão.
      </p>
    </section>
  )
}
