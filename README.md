# Repositório de TCC

Sistema web para guardar, revisar e publicar Trabalhos de Conclusão de Curso de uma instituição de ensino. Os trabalhos passam por um fluxo de revisão e, depois de aprovados e autorizados pelo autor, entram em um acervo público com busca.

> **Projeto acadêmico.** Desenvolvido na disciplina de **[Programação Web]**, com base nas receitas 13 a 21 de Programação Web (Next.js). Os dados usados na demonstração são **fictícios**.

**Autor:** Leandro Sérgio da Silva

## O problema

Em muitas instituições, os TCCs ficam espalhados em pen drives, e-mails e pastas de professores. Isso causa:

- perda de trabalhos antigos;
- temas repetidos sem que ninguém perceba;
- alunos sem referências de trabalhos anteriores;
- coordenação sem visão de quem está em cada etapa.

## O que o sistema faz

| Perfil | O que pode fazer |
|---|---|
| **Visitante** (sem login) | Buscar no acervo por título, resumo, palavras-chave, curso e ano. Ler os dados e baixar o PDF dos trabalhos publicados. |
| **Aluno** | Criar o trabalho, enviar o PDF (cada envio vira uma versão), autorizar a publicação, enviar para revisão e acompanhar o histórico. |
| **Orientador** | Ver os trabalhos que orienta, ler o PDF, e aprovar ou devolver com comentário. |
| **Coordenador** | Ver todos os trabalhos, publicar os aprovados e despublicar quando necessário. |
| **Admin** | Gerenciar cursos e definir o papel dos usuários. |

### Fluxo de um trabalho

```
rascunho ──► em_revisao ──► aprovado ──► publicado
   ▲             │              ▲            │
   └─ devolvido ◄┘              └────────────┘
                                 (despublicar)
```

- O **aluno** envia o rascunho para revisão (precisa de resumo, ano, curso, orientador e PDF).
- O **orientador** aprova ou devolve (a devolução exige um motivo).
- A **coordenação** publica, e só se o autor tiver dado a autorização.

## Tecnologias

- **Next.js 15** (App Router), React e JavaScript, como nas receitas da disciplina
- **Supabase**: Postgres, Auth e Storage
- **API própria** com Route Handlers (`app/api`)
- Deploy na **Vercel**

## Requisitos da disciplina

| Requisito | Como foi atendido |
|---|---|
| Banco de dados Supabase | Tabelas `cursos`, `perfis`, `trabalhos`, `trabalho_versoes`, `revisoes` e `historico`, mais bucket privado para os PDFs |
| API própria | Route Handlers em `app/api` (veja a seção de endpoints) |
| Operação CRUD | Criar, listar, editar e excluir trabalhos (exclusão lógica) |
| Página ou funcionalidade restrita | Painel do aluno, do orientador e da coordenação, protegidos por login, perfil e RLS |

## Receitas aplicadas

| Receita | Onde aparece no projeto |
|---|---|
| 13 e 14 | Estrutura da aplicação, páginas e componentes |
| 15 | Layouts: público e painel restrito |
| 16 | Listagem de trabalhos com busca de dados no servidor |
| 17 | Formulário de pesquisa do acervo |
| 18 | Filtros interativos em Client Components |
| 19 | API própria em `app/api` |
| 20 | Server Actions no envio e na revisão |
| 21 | Página de cada trabalho publicado (`/acervo/[id]`) com geração estática |

## Segurança e proteção dos dados

A proteção é feita em **três camadas**, para que uma falha em uma não exponha os dados:

1. **Rota:** o middleware do Next.js redireciona para o login quem não tem sessão.
2. **Servidor:** cada rota da API e cada Server Action confere o usuário antes de agir.
3. **Banco (RLS):** o Postgres só devolve as linhas que aquele usuário pode ver, mesmo se a API errar.

Outras medidas:

- **Exclusão lógica:** nada é apagado de verdade (`deleted_at`), então tudo pode ser restaurado.
- **Versões de arquivo:** o PDF nunca é sobrescrito. Cada envio é uma nova versão.
- **Histórico:** toda criação, edição, mudança de status e exclusão é registrada.
- **Papéis protegidos:** quem se cadastra entra como aluno. Só um admin muda o papel de alguém.
- **Máquina de estados no banco:** as transições de status são validadas por trigger, e não só pela tela.
- **Acervo público restrito:** o visitante acessa só a view `acervo_publico`, sem e-mail nem caminho do arquivo.
- **Autorização do autor e embargo:** sem autorização não há publicação, e o download respeita a data de embargo.
- **PDFs em bucket privado:** o download público usa um link temporário gerado no servidor.

## Endpoints da API

| Método e rota | Quem usa | Função |
|---|---|---|
| `GET /api/acervo` | Público | Busca e filtros no acervo |
| `GET /api/acervo/[id]/download` | Público | Link temporário do PDF (confere publicação, autorização e embargo) |
| `GET /api/trabalhos` | Logado | Lista os trabalhos do usuário |
| `POST /api/trabalhos` | Aluno | Cria um rascunho |
| `GET /api/trabalhos/[id]` | Logado | Detalhe, se tiver permissão |
| `PUT /api/trabalhos/[id]` | Aluno | Edita (só rascunho ou devolvido) |
| `DELETE /api/trabalhos/[id]` | Aluno | Exclusão lógica |
| `POST /api/trabalhos/[id]/arquivo` | Aluno | Envia uma nova versão do PDF |
| `POST /api/trabalhos/[id]/enviar` | Aluno | Envia para revisão |
| `POST /api/trabalhos/[id]/revisao` | Orientador | Aprova ou devolve |
| `POST /api/trabalhos/[id]/publicar` | Coordenador | Publica ou despublica |

## Como rodar localmente

### Pré-requisitos

- Node.js (versão LTS)
- Uma conta e um projeto no [Supabase](https://supabase.com)

### Passo a passo

1. **Clone o repositório e instale as dependências**

   ```bash
   git clone [URL DO REPOSITÓRIO]
   cd [NOME DA PASTA]
   npm install
   ```

2. **Crie o banco.** No painel do Supabase, abra o *SQL Editor* e rode o arquivo [`supabase/schema.sql`](supabase/schema.sql). Ele cria as tabelas, as regras de acesso (RLS), o bucket de PDFs e alguns cursos de exemplo.

3. **Configure as variáveis de ambiente.** Crie um arquivo `.env.local` na raiz:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico
   ```

   > O nome da chave pública (`anon` ou `publishable`) varia conforme o painel do Supabase. Use o que ele mostrar e ajuste o nome no código.

   > **Atenção:** a `SUPABASE_SERVICE_ROLE_KEY` ignora o RLS. Use apenas no servidor, nunca em variável `NEXT_PUBLIC_` e nunca a envie ao GitHub.

4. **Crie os usuários de teste.** Cadastre contas pelo próprio app (ou pelo painel do Supabase) e promova-as no *SQL Editor*:

   ```sql
   update public.perfis set papel = 'orientador'  where id = '<uuid do professor>';
   update public.perfis set papel = 'coordenador' where id = '<uuid da coordenação>';
   update public.perfis set papel = 'admin'       where id = '<uuid do admin>';
   ```

5. **Inicie o servidor**

   ```bash
   npm run dev
   ```

   Acesse `http://localhost:3000`.

## Como testar as permissões

Crie pelo menos duas contas de aluno e confira que:

- uma aluna **não enxerga** os trabalhos da outra;
- o aluno **não consegue editar** o trabalho depois de enviá-lo para revisão;
- o visitante só vê trabalhos **publicados** e **autorizados**;
- o orientador só vê os trabalhos que orienta;
- ninguém consegue pular etapas do fluxo (por exemplo, de "em revisão" direto para "publicado").

## Estrutura do projeto

```
middleware.js                 proteção de rotas e renovação da sessão
lib/
  supabase/                   clientes do Supabase (navegador, servidor e admin)
  server/                     regras de negócio usadas pela API e pelas Server Actions
app/
  (publico)/                  home, acervo e página de cada trabalho
  (auth)/                     login e cadastro
  (restrito)/painel/          meus trabalhos, revisões e gestão
  actions/                    Server Actions (receita 20)
  api/                        rotas da API (receita 19)
components/                   interface reutilizável
supabase/
  schema.sql                  tabelas, RLS, triggers e bucket
```

> Ajuste esta árvore ao que de fato existir no repositório.

## Status do projeto

- [ ] Banco no Supabase com RLS
- [ ] Login e cadastro
- [ ] Proteção de rotas
- [ ] CRUD de trabalhos pela API
- [ ] Envio de PDF com versões
- [ ] Fluxo de revisão (aprovar e devolver)
- [ ] Publicação pela coordenação
- [ ] Acervo público com busca
- [ ] Página de detalhe com geração estática
- [ ] Deploy na Vercel

## Telas

> Adicione aqui os prints do acervo, do painel do aluno, da revisão e da coordenação. Use apenas dados fictícios.

## Limitações e próximos passos

- Cada trabalho tem **um autor**. Trabalhos em dupla ou grupo ficam para uma próxima versão.
- Não há integração com o sistema acadêmico da instituição. A matrícula e outros dados cadastrais não são coletados.
- Possíveis evoluções: campos da ficha catalográfica, banca examinadora, detecção de temas parecidos por palavras-chave e relatório para a coordenação.

## Aviso

Este é um projeto acadêmico. Não use trabalhos reais sem a autorização dos autores. Os dados de demonstração são fictícios.

## Licença

[ESCOLHA UMA LICENÇA, por exemplo MIT, ou remova esta seção]