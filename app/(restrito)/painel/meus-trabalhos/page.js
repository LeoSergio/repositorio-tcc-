import { exigirPapel } from '@/lib/auth'

export const metadata = { title: 'Meus trabalhos | Repositório de TCC' }

// Tela provisória: será substituída pela lista de trabalhos do aluno.
export default async function MeusTrabalhos() {
  const perfil = await exigirPapel('aluno')

  return (
    <section>
      <h1 className="text-2xl font-semibold">Meus trabalhos</h1>
      <p className="mt-2 text-sm opacity-70">
        Olá, {perfil.nome}. Aqui ficará a lista dos seus trabalhos e o botão de novo trabalho.
      </p>
    </section>
  )
}
