-- Schema do banco de dados — Repositório TCC
-- Execute via: supabase db push

-- Tabela de perfis (complementa auth.users)
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  papel text not null check (papel in ('aluno', 'orientador', 'coordenador')),
  created_at timestamptz default now()
);

-- Tabela de trabalhos
create table if not exists public.trabalhos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  resumo text,
  autor_id uuid not null references public.perfis(id),
  orientador_id uuid references public.perfis(id),
  status text not null default 'rascunho'
    check (status in ('rascunho', 'enviado', 'em_revisao', 'aprovado', 'publicado', 'rejeitado')),
  arquivo_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de revisões
create table if not exists public.revisoes (
  id uuid primary key default gen_random_uuid(),
  trabalho_id uuid not null references public.trabalhos(id) on delete cascade,
  revisor_id uuid not null references public.perfis(id),
  parecer text,
  resultado text check (resultado in ('aprovado', 'reprovado', 'revisao_necessaria')),
  created_at timestamptz default now()
);
