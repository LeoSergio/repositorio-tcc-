'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  IconeArquivo,
  IconeBusca,
  IconeCasa,
  IconeCheck,
  IconeDocumento,
  IconeFechar,
  IconeInfo,
  IconeLivro,
  IconeMenu,
} from '@/components/layout/Icones'
import { sair } from '@/app/actions/authActions'

const ROTULO_PAPEL = {
  aluno: 'Aluno',
  orientador: 'Orientador',
  coordenador: 'Coordenador',
  admin: 'Administrador',
}

function iniciaisDoNome(nome) {
  const partes = String(nome ?? '').trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return 'U'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

function moduloDoPapel(papel, resumo) {
  if (papel === 'aluno') {
    return {
      href: '/painel/meus-trabalhos',
      texto: 'Meus Trabalhos',
      Icone: IconeDocumento,
      badge: resumo.devolvido > 0 ? resumo.devolvido : null,
      badgeTitulo: 'Devolvidos para ajuste',
    }
  }
  if (papel === 'orientador') {
    return {
      href: '/painel/revisoes',
      texto: 'Revisões',
      Icone: IconeCheck,
      badge: resumo.em_revisao > 0 ? resumo.em_revisao : null,
      badgeTitulo: 'Aguardando sua revisão',
    }
  }
  return {
    href: '/painel/gestao',
    texto: 'Gestão do Acervo',
    Icone: IconeArquivo,
    badge: resumo.aprovado > 0 ? resumo.aprovado : null,
    badgeTitulo: 'Aprovados aguardando publicação',
  }
}

function CardContexto({ papel, resumo }) {
  if (papel === 'aluno') {
    return (
      <div className="mx-3 rounded-xl border border-white/15 bg-white/10 p-3.5 text-xs text-white/90">
        <p className="font-semibold text-white">Fluxo do TCC</p>
        <p className="mt-1.5 leading-relaxed text-white/75">
          Rascunho &rarr; Revisão &rarr; Aprovado &rarr; Publicado
        </p>
        <p className="mt-2 text-[11px] text-white/70">
          {resumo.total === 0
            ? 'Comece criando um novo trabalho.'
            : `${resumo.total} trabalho(s) · ${resumo.publicado} publicado(s)`}
        </p>
      </div>
    )
  }

  if (papel === 'orientador') {
    return (
      <div className="mx-3 rounded-xl border border-white/15 bg-white/10 p-3.5 text-xs text-white/90">
        <p className="font-semibold text-white">Fila de Orientação</p>
        <p className="mt-1.5 leading-relaxed text-white/75">
          {resumo.em_revisao === 0
            ? 'Nenhum trabalho aguardando parecer no momento.'
            : `${resumo.em_revisao} trabalho(s) aguardando sua revisão.`}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-3 rounded-xl border border-white/15 bg-white/10 p-3.5 text-xs text-white/90">
      <p className="font-semibold text-white">Publicação no Acervo</p>
      <p className="mt-1.5 leading-relaxed text-white/75">
        {resumo.aprovado === 0
          ? `${resumo.publicado} trabalho(s) publicado(s) no acervo.`
          : `${resumo.aprovado} aprovado(s) aguardando publicação.`}
      </p>
    </div>
  )
}

function ConteudoSidebar({ perfil, resumo, pathname, aoNavegar }) {
  const modulo = moduloDoPapel(perfil.papel, resumo)
  const itensPrincipais = [
    { href: '/painel', exato: true, texto: 'Visão Geral', Icone: IconeCasa },
    modulo,
  ]
  const linksAcervo = [
    { href: '/acervo', texto: 'Explorar Acervo', Icone: IconeBusca },
    { href: '/sobre', texto: 'Sobre o Projeto', Icone: IconeInfo },
  ]

  const ativo = (item) =>
    item.exato
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`)

  return (
    <div className="flex h-full flex-col justify-between bg-[#164194] text-white">
      <div className="flex flex-col gap-5 overflow-y-auto">
        <div className="border-b border-white/15 px-5 py-5">
          <Link href="/painel" onClick={aoNavegar} className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0095DB] text-white shadow-sm">
              <IconeLivro className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight tracking-tight">
                Repositório de TCC
              </span>
              <span className="block text-xs text-white/75">UFRN · Painel Restrito</span>
            </span>
          </Link>
        </div>

        {/* Navegação do perfil logado */}
        <div className="px-3">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/55">
            Painel
          </p>
          <nav aria-label="Menu do painel" className="flex flex-col gap-1">
            {itensPrincipais.map((item) => {
              const estaAtivo = ativo(item)
              const Icone = item.Icone

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={aoNavegar}
                  aria-current={estaAtivo ? 'page' : undefined}
                  className={`flex items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
                    estaAtivo
                      ? 'bg-[#0095DB] font-semibold text-white shadow-sm'
                      : 'text-white/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icone className="h-5 w-5 shrink-0" />
                    <span>{item.texto}</span>
                  </span>
                  {item.badge != null && (
                    <span
                      title={item.badgeTitulo}
                      className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold ${
                        estaAtivo ? 'bg-white text-[#164194]' : 'bg-[#0095DB] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}

            {perfil.papel === 'aluno' && (
              <Link
                href="/painel/meus-trabalhos/novo"
                onClick={aoNavegar}
                className={`mt-1 flex items-center gap-3 rounded-lg border border-white/20 px-3.5 py-2 text-sm font-medium transition-colors ${
                  pathname === '/painel/meus-trabalhos/novo'
                    ? 'border-[#0095DB] bg-[#0095DB] text-white'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-white/15 text-xs font-bold">
                  +
                </span>
                <span>Novo Trabalho</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Links públicos */}
        <div className="px-3">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/55">
            Acervo
          </p>
          <nav aria-label="Links do acervo" className="flex flex-col gap-1">
            {linksAcervo.map((item) => {
              const Icone = item.Icone
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={aoNavegar}
                  className="flex items-center gap-3 rounded-lg px-3.5 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icone className="h-4 w-4 shrink-0" />
                  <span>{item.texto}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Resumo contextual do papel */}
        <CardContexto papel={perfil.papel} resumo={resumo} />
      </div>

      {/* Cartão do usuário + Sair */}
      <div className="border-t border-white/15 p-3">
        <div className="mb-2.5 flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0095DB] text-xs font-bold text-white">
            {iniciaisDoNome(perfil.nome)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{perfil.nome}</p>
            <p className="text-xs text-white/75">
              {ROTULO_PAPEL[perfil.papel] ?? perfil.papel}
            </p>
          </div>
        </div>

        <form action={sair}>
          <button
            type="submit"
            className="w-full rounded-lg border border-white/25 px-3.5 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Sair da conta
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SidebarPainel({ perfil, resumo }) {
  const pathname = usePathname()
  const [aberta, setAberta] = useState(false)

  useEffect(() => setAberta(false), [pathname])

  return (
    <>
      {/* Barra superior no mobile */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[#164194] px-4 py-3 text-white md:hidden">
        <Link href="/painel" className="flex items-center gap-2.5 text-sm font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0095DB]">
            <IconeLivro className="h-4 w-4" />
          </span>
          <span>Repositório de TCC · UFRN</span>
        </Link>

        <button
          type="button"
          onClick={() => setAberta((v) => !v)}
          aria-expanded={aberta}
          aria-label={aberta ? 'Fechar menu' : 'Abrir menu'}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 text-white"
        >
          {aberta ? <IconeFechar className="h-5 w-5" /> : <IconeMenu className="h-5 w-5" />}
        </button>
      </div>

      {/* Drawer mobile */}
      {aberta && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64 shrink-0 shadow-xl">
            <ConteudoSidebar
              perfil={perfil}
              resumo={resumo}
              pathname={pathname}
              aoNavegar={() => setAberta(false)}
            />
          </div>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setAberta(false)}
            className="flex-1 bg-slate-900/50"
          />
        </div>
      )}

      {/* Sidebar fixa no desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:block md:w-64">
        <ConteudoSidebar perfil={perfil} resumo={resumo} pathname={pathname} />
      </aside>
    </>
  )
}
