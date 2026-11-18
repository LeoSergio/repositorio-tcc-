-- =====================================================================
-- Repositório institucional de TCC — esquema Supabase (Postgres)
-- Rodar uma vez no SQL Editor do Supabase.
--
-- Perfis:  aluno | orientador | coordenador | admin
-- Fluxo:   rascunho -> em_revisao -> (devolvido | aprovado) -> publicado
--
-- Regras de segurança (resumo):
--  * Todo acesso é decidido no banco (RLS), mesmo que a API tenha falha.
--  * Ninguém apaga de verdade: exclusão lógica (deleted_at).
--  * Arquivos nunca são sobrescritos: cada envio é uma nova versão.
--  * O público só enxerga a view acervo_publico (trabalhos publicados e
--    com autorização do autor). Os PDFs ficam em bucket privado.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tabelas
-- ---------------------------------------------------------------------

create table public.cursos (
  id    uuid primary key default gen_random_uuid(),
  nome  text not null unique,
  ativo boolean not null default true
);

create table public.perfis (
  id         uuid primary key references auth.users (id) on delete cascade,
  nome       text not null,
  papel      text not null default 'aluno'
             check (papel in ('aluno', 'orientador', 'coordenador', 'admin')),
  curso_id   uuid references public.cursos (id),
  created_at timestamptz not null default now()
);

create table public.trabalhos (
  id                     uuid primary key default gen_random_uuid(),
  titulo                 text not null check (char_length(titulo) between 5 and 300),
  resumo                 text check (char_length(resumo) <= 5000),
  palavras_chave         text[] not null default '{}',
  ano                    int check (ano between 2000 and 2100),
  curso_id               uuid references public.cursos (id),
  autor_id               uuid not null references public.perfis (id),
  orientador_id          uuid references public.perfis (id),
  status                 text not null default 'rascunho'
                         check (status in ('rascunho', 'em_revisao', 'devolvido', 'aprovado', 'publicado')),
  arquivo_path           text,                       -- versão mais recente no Storage
  autorizacao_publicacao boolean not null default false,
  embargo_ate            date,                       -- download liberado só depois dessa data
  licenca                text,
  defesa_data            date,
  busca                  tsvector,                   -- mantido por trigger
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  published_at           timestamptz,
  deleted_at             timestamptz
);

create table public.trabalho_versoes (
  id           uuid primary key default gen_random_uuid(),
  trabalho_id  uuid not null references public.trabalhos (id),
  numero       int  not null,
  arquivo_path text not null,
  enviado_por  uuid not null references public.perfis (id),
  created_at   timestamptz not null default now(),
  unique (trabalho_id, numero)
);

create table public.revisoes (
  id          uuid primary key default gen_random_uuid(),
  trabalho_id uuid not null references public.trabalhos (id),
  autor_id    uuid not null references public.perfis (id),
  decisao     text not null check (decisao in ('comentario', 'devolvido', 'aprovado')),
  texto       text not null default '',
  created_at  timestamptz not null default now()
);

create table public.historico (
  id              bigint generated always as identity primary key,
  trabalho_id     uuid not null references public.trabalhos (id),
  usuario_id      uuid,
  acao            text not null,
  status_anterior text,
  status_novo     text,
  created_at      timestamptz not null default now()
);

create index trabalhos_busca_idx       on public.trabalhos using gin (busca);
create index trabalhos_status_idx      on public.trabalhos (status);
create index trabalhos_autor_idx       on public.trabalhos (autor_id);
create index trabalhos_orientador_idx  on public.trabalhos (orientador_id);
create index trabalhos_curso_ano_idx   on public.trabalhos (curso_id, ano);
create index revisoes_trabalho_idx     on public.revisoes (trabalho_id);
create index historico_trabalho_idx    on public.historico (trabalho_id);

-- ---------------------------------------------------------------------
-- 2. Funções auxiliares
-- ---------------------------------------------------------------------

-- Papel do usuário logado. SECURITY DEFINER evita recursão nas políticas.
create or replace function public.papel_atual()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.papel from public.perfis p where p.id = (select auth.uid())
$$;

-- Ao criar a conta no Supabase Auth, cria o perfil SEMPRE como aluno.
-- (O papel nunca vem do formulário de cadastro: evita escalada de privilégio.)
create or replace function public.criar_perfil_ao_cadastrar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.criar_perfil_ao_cadastrar();

-- Só admin (ou o SQL Editor / service role) muda o papel de alguém.
create or replace function public.proteger_papel()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.papel is distinct from old.papel
     and auth.uid() is not null
     and coalesce(public.papel_atual(), '') <> 'admin' then
    raise exception 'Somente admin pode alterar o papel de um usuário';
  end if;
  return new;
end;
$$;

create trigger perfis_proteger_papel
  before update on public.perfis
  for each row execute function public.proteger_papel();

-- Mantém updated_at, o índice de busca e valida o orientador.
create or replace function public.trabalhos_preparar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.busca := to_tsvector(
    'portuguese',
    coalesce(new.titulo, '') || ' ' ||
    coalesce(new.resumo, '') || ' ' ||
    coalesce(array_to_string(new.palavras_chave, ' '), '')
  );

  if new.orientador_id is not null and not exists (
    select 1 from public.perfis p
    where p.id = new.orientador_id and p.papel in ('orientador', 'coordenador')
  ) then
    raise exception 'Orientador inválido';
  end if;

  return new;
end;
$$;

create trigger trabalhos_a_preparar
  before insert or update on public.trabalhos
  for each row execute function public.trabalhos_preparar();

-- Máquina de estados: quem pode mover o trabalho de um status para outro.
-- Contextos sem usuário (SQL Editor, service role) passam direto.
create or replace function public.trabalhos_validar_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid   uuid := auth.uid();
  papel text := public.papel_atual();
  staff boolean := coalesce(papel, '') in ('coordenador', 'admin');
begin
  if uid is null then
    return new;
  end if;

  if new.autor_id <> old.autor_id then
    raise exception 'O autor do trabalho não pode ser alterado';
  end if;

  -- a autorização de publicação é um ato do autor
  if new.autorizacao_publicacao is distinct from old.autorizacao_publicacao
     and uid <> old.autor_id then
    raise exception 'Somente o autor pode alterar a autorização de publicação';
  end if;

  -- quem não é autor nem coordenação não edita o conteúdo, só decide o status
  if uid <> old.autor_id and not staff
     and (new.titulo, new.resumo, new.palavras_chave, new.arquivo_path, new.deleted_at)
         is distinct from
         (old.titulo, old.resumo, old.palavras_chave, old.arquivo_path, old.deleted_at) then
    raise exception 'O orientador não pode editar o conteúdo do trabalho';
  end if;

  -- autor só exclui rascunho ou devolvido
  if new.deleted_at is distinct from old.deleted_at
     and uid = old.autor_id and not staff
     and old.status not in ('rascunho', 'devolvido') then
    raise exception 'Só é possível excluir trabalhos em rascunho ou devolvidos';
  end if;

  if new.status is distinct from old.status then
    if uid = old.autor_id and old.status in ('rascunho', 'devolvido') and new.status = 'em_revisao' then
      if new.resumo is null or new.arquivo_path is null or new.orientador_id is null
         or new.curso_id is null or new.ano is null then
        raise exception 'Preencha resumo, ano, curso, orientador e envie o PDF antes de enviar para revisão';
      end if;

    elsif old.status = 'em_revisao' and new.status in ('aprovado', 'devolvido')
          and (uid = old.orientador_id or staff) then
      null;

    elsif staff and old.status = 'aprovado' and new.status = 'publicado' then
      if not new.autorizacao_publicacao then
        raise exception 'Não é possível publicar sem a autorização do autor';
      end if;
      new.published_at := now();

    elsif staff and old.status = 'publicado' and new.status = 'aprovado' then
      new.published_at := null;   -- despublicar

    else
      raise exception 'Transição de status não permitida: % -> %', old.status, new.status;
    end if;
  end if;

  return new;
end;
$$;

create trigger trabalhos_b_validar_update
  before update on public.trabalhos
  for each row execute function public.trabalhos_validar_update();

-- Registra no histórico toda criação, edição, mudança de status e exclusão.
create or replace function public.trabalhos_registrar_historico()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_acao text;
begin
  if tg_op = 'INSERT' then
    insert into public.historico (trabalho_id, usuario_id, acao, status_novo)
    values (new.id, auth.uid(), 'criado', new.status);
    return new;
  end if;

  if new.deleted_at is distinct from old.deleted_at then
    v_acao := case when new.deleted_at is null then 'restaurado' else 'excluido' end;
  elsif new.status is distinct from old.status then
    v_acao := 'status';
  else
    v_acao := 'editado';
  end if;

  insert into public.historico (trabalho_id, usuario_id, acao, status_anterior, status_novo)
  values (new.id, auth.uid(), v_acao, old.status, new.status);
  return new;
end;
$$;

create trigger trabalhos_c_historico
  after insert or update on public.trabalhos
  for each row execute function public.trabalhos_registrar_historico();

-- Aprovar/devolver numa única transação (comentário + mudança de status).
-- SECURITY INVOKER: as políticas e triggers acima continuam valendo.
create or replace function public.revisar_trabalho(p_trabalho uuid, p_decisao text, p_texto text default '')
returns void
language plpgsql
as $$
begin
  if p_decisao not in ('aprovado', 'devolvido') then
    raise exception 'Decisão inválida';
  end if;
  if p_decisao = 'devolvido' and btrim(coalesce(p_texto, '')) = '' then
    raise exception 'Informe o motivo da devolução';
  end if;

  insert into public.revisoes (trabalho_id, autor_id, decisao, texto)
  values (p_trabalho, auth.uid(), p_decisao, coalesce(p_texto, ''));

  update public.trabalhos set status = p_decisao where id = p_trabalho;
  if not found then
    raise exception 'Trabalho não encontrado ou sem permissão';
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------

alter table public.cursos           enable row level security;
alter table public.perfis           enable row level security;
alter table public.trabalhos        enable row level security;
alter table public.trabalho_versoes enable row level security;
alter table public.revisoes         enable row level security;
alter table public.historico        enable row level security;

-- cursos: qualquer um lê; só admin escreve
create policy cursos_leitura on public.cursos
  for select using (true);
create policy cursos_admin on public.cursos
  for all to authenticated
  using (public.papel_atual() = 'admin')
  with check (public.papel_atual() = 'admin');

-- perfis
create policy perfis_leitura on public.perfis
  for select to authenticated
  using (
    id = (select auth.uid())
    or public.papel_atual() in ('coordenador', 'admin')
    or exists (   -- orientador vê o autor; autor vê o orientador
      select 1 from public.trabalhos t
      where (t.autor_id = perfis.id and t.orientador_id = (select auth.uid()))
         or (t.orientador_id = perfis.id and t.autor_id = (select auth.uid()))
    )
  );
create policy perfis_atualiza_proprio on public.perfis
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
create policy perfis_admin on public.perfis
  for update to authenticated
  using (public.papel_atual() = 'admin')
  with check (public.papel_atual() = 'admin');

-- trabalhos (não há política de DELETE: ninguém apaga de verdade)
create policy trabalhos_leitura on public.trabalhos
  for select to authenticated
  using (
    autor_id = (select auth.uid())
    or orientador_id = (select auth.uid())
    or public.papel_atual() in ('coordenador', 'admin')
  );

create policy trabalhos_criar on public.trabalhos
  for insert to authenticated
  with check (
    autor_id = (select auth.uid())
    and status = 'rascunho'
    and public.papel_atual() = 'aluno'
  );

create policy trabalhos_atualizar on public.trabalhos
  for update to authenticated
  using (
    (autor_id = (select auth.uid()) and status in ('rascunho', 'devolvido'))
    or (orientador_id = (select auth.uid()) and status = 'em_revisao')
    or public.papel_atual() in ('coordenador', 'admin')
  )
  with check (
    autor_id = (select auth.uid())
    or orientador_id = (select auth.uid())
    or public.papel_atual() in ('coordenador', 'admin')
  );

-- versões do arquivo: o autor envia enquanto o trabalho é editável
create policy versoes_leitura on public.trabalho_versoes
  for select to authenticated
  using (exists (select 1 from public.trabalhos t where t.id = trabalho_id));

create policy versoes_criar on public.trabalho_versoes
  for insert to authenticated
  with check (
    enviado_por = (select auth.uid())
    and exists (
      select 1 from public.trabalhos t
      where t.id = trabalho_id
        and t.autor_id = (select auth.uid())
        and t.status in ('rascunho', 'devolvido')
        and t.deleted_at is null
    )
  );

-- revisões: quem enxerga o trabalho enxerga as revisões; só orientador/coordenação escrevem
create policy revisoes_leitura on public.revisoes
  for select to authenticated
  using (exists (select 1 from public.trabalhos t where t.id = trabalho_id));

create policy revisoes_criar on public.revisoes
  for insert to authenticated
  with check (
    autor_id = (select auth.uid())
    and (
      public.papel_atual() in ('coordenador', 'admin')
      or exists (
        select 1 from public.trabalhos t
        where t.id = trabalho_id and t.orientador_id = (select auth.uid())
      )
    )
  );

-- histórico: só leitura; quem escreve é o trigger
create policy historico_leitura on public.historico
  for select to authenticated
  using (exists (select 1 from public.trabalhos t where t.id = trabalho_id));

-- ---------------------------------------------------------------------
-- 4. Views públicas (únicas portas de entrada para quem não tem login)
-- ---------------------------------------------------------------------

-- Acervo público: só trabalhos publicados (o trigger exige autorização do autor).
-- Expõe apenas campos seguros: sem e-mail, matrícula ou caminho do arquivo.
create or replace view public.acervo_publico as
select
  t.id,
  t.titulo,
  t.resumo,
  t.palavras_chave,
  t.ano,
  c.nome  as curso,
  a.nome  as autor,
  o.nome  as orientador,
  t.licenca,
  t.published_at,
  t.busca,
  (t.autorizacao_publicacao and (t.embargo_ate is null or t.embargo_ate <= current_date)) as download_liberado
from public.trabalhos t
join public.cursos  c on c.id = t.curso_id
join public.perfis  a on a.id = t.autor_id
left join public.perfis o on o.id = t.orientador_id
where t.status = 'publicado' and t.deleted_at is null;

grant select on public.acervo_publico to anon, authenticated;

-- Lista de orientadores para o aluno escolher no formulário.
create or replace view public.orientadores as
select p.id, p.nome, p.curso_id
from public.perfis p
where p.papel in ('orientador', 'coordenador');

revoke all on public.orientadores from anon;
grant select on public.orientadores to authenticated;

-- ---------------------------------------------------------------------
-- 5. Storage: bucket privado só para PDF
-- Convenção do caminho:  {autor_id}/{trabalho_id}/v{numero}.pdf
-- Não há política de UPDATE nem DELETE: arquivos enviados nunca são
-- sobrescritos nem apagados (cada envio vira uma nova versão).
-- O download público é feito pela API (Route Handler), que confere
-- status = publicado, autorização e embargo antes de gerar um link
-- temporário (signed URL) com a service role key no servidor.
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trabalhos', 'trabalhos', false, 20971520, array['application/pdf'])
on conflict (id) do nothing;

create policy trabalhos_storage_enviar on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'trabalhos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy trabalhos_storage_ler on storage.objects
  for select to authenticated
  using (
    bucket_id = 'trabalhos'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.papel_atual() in ('coordenador', 'admin')
      or exists (
        select 1 from public.trabalhos t
        where t.orientador_id = (select auth.uid())
          and t.autor_id::text = (storage.foldername(name))[1]
      )
    )
  );

-- ---------------------------------------------------------------------
-- 6. Dados de exemplo (FICTÍCIOS) e como criar os perfis de teste
-- ---------------------------------------------------------------------

insert into public.cursos (nome) values
  ('Análise e Desenvolvimento de Sistemas'),
  ('Enfermagem'),
  ('Administração')
on conflict (nome) do nothing;

-- Depois de criar as contas pelo Auth (cadastro do app ou painel do Supabase),
-- promova os usuários de teste no SQL Editor (lá o auth.uid() é nulo, então passa):
--
--   update public.perfis set papel = 'orientador'  where id = '<uuid do professor>';
--   update public.perfis set papel = 'coordenador' where id = '<uuid da coordenação>';
--   update public.perfis set papel = 'admin'       where id = '<uuid do admin>';