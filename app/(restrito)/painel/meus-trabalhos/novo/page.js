import Link from 'next/link'
import { exigirPapel } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { listarCursos, listarOrientadores } from '@/lib/server/trabalhos'
import FormTrabalho from '@/components/trabalhos/FormTrabalho'

export const metadata = { title: 'Novo trabalho | Repositório de TCC' }

export default async function NovoTrabalho() {
  await exigirPapel('aluno')
  const supabase = await createClient()
  const [{ data: cursos }, { data: orientadores }] = await Promise.all([
    listarCursos(supabase),
    listarOrientadores(supabase),
  ])

  return (
    <section>
      <Link href="/painel/meus-trabalhos" className="text-sm underline">
        &larr; Voltar
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">Novo trabalho</h1>
      <FormTrabalho cursos={cursos ?? []} orientadores={orientadores ?? []} />
    </section>
  )
}
