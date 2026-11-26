import { exigirPerfil } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { carregarVisaoGeral } from '@/lib/server/painel'
import { STATUS_EDITAVEIS } from '@/lib/status'
import TabelaVisaoGeral from '@/components/trabalhos/TabelaVisaoGeral'

export const metadata = { title: 'Visão Geral | Repositório de TCC' }

function acaoRapida(trabalho, papel) {
  if (papel === 'aluno') {
    const editavel = STATUS_EDITAVEIS.includes(trabalho.status)
    return {
      href: `/painel/meus-trabalhos/${trabalho.id}`,
      texto: editavel ? (trabalho.arquivo_path ? 'Editar' : 'Enviar PDF') : 'Ver',
      secundaria:
        editavel && Boolean(trabalho.arquivo_path)
          ? { href: `/painel/meus-trabalhos/${trabalho.id}`, texto: 'Enviar PDF' }
          : null,
    }
  }

  if (papel === 'orientador') {
    return {
      href: `/painel/revisoes/${trabalho.id}`,
      texto: trabalho.status === 'em_revisao' ? 'Revisar' : 'Ver',
      secundaria: null,
    }
  }

  return {
    href: `/painel/gestao/${trabalho.id}`,
    texto: trabalho.status === 'aprovado' ? 'Publicar' : 'Gerenciar',
    secundaria: null,
  }
}

export default async function VisaoGeralPainel() {
  const perfil = await exigirPerfil()
  const supabase = await createClient()

  const { trabalhos, cursosPorId, versoesPorTrabalho, resumo, error } =
    await carregarVisaoGeral(supabase, perfil)

  const itens = trabalhos.map((t) => {
    const cursoNome = cursosPorId[t.curso_id] ?? null
    return {
      id: t.id,
      titulo: t.titulo,
      status: t.status,
      curso_id: t.curso_id,
      cursoNome,
      cursoAno: [cursoNome, t.ano].filter(Boolean).join(' · ') || '—',
      versao: versoesPorTrabalho[t.id] ?? null,
      acao: acaoRapida(t, perfil.papel),
    }
  })

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
        <p className="mt-1 text-sm text-slate-600">
          Acompanhe o andamento dos Trabalhos de Conclusão de Curso vinculados ao seu perfil.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          Não foi possível carregar os dados do painel.
        </p>
      )}

      <TabelaVisaoGeral trabalhos={itens} resumo={resumo} />
    </section>
  )
}
