import Link from 'next/link'
import { exigirPerfil } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { contarResumoPainel } from '@/lib/server/painel'
import SidebarPainel from '@/components/layout/SidebarPainel'

// Layout das páginas restritas (receita 15).
// Camada 2 da proteção: se não houver sessão, redireciona para o login.
const ROTULO_DO_PAPEL = {
  aluno: 'Aluno',
  orientador: 'Orientador',
  coordenador: 'Coordenador',
  admin: 'Administrador',
}

export default async function LayoutPainel({ children }) {
  const perfil = await exigirPerfil()
  const supabase = await createClient()
  const resumo = await contarResumoPainel(supabase, perfil)
  const rotuloPapel = ROTULO_DO_PAPEL[perfil.papel] ?? perfil.papel

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SidebarPainel perfil={{ nome: perfil.nome, papel: perfil.papel }} resumo={resumo} />

      <div className="md:pl-64">
        <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-base font-semibold text-slate-900">
                Olá, {perfil.nome}
              </p>
              <span className="inline-flex items-center rounded-full border border-[#0095DB]/30 bg-[#0095DB]/10 px-2.5 py-0.5 text-xs font-semibold text-[#164194]">
                {rotuloPapel}
              </span>
            </div>

            {perfil.papel === 'aluno' && (
              <Link
                href="/painel/meus-trabalhos/novo"
                className="inline-flex items-center rounded-lg bg-[#164194] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#143378]"
              >
                + Novo Trabalho
              </Link>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
