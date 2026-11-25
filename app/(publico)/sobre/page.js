import Link from 'next/link'

export const metadata = {
  title: 'Sobre | Repositório de TCC • UFRN',
  description: 'Como funciona o repositório de trabalhos de conclusão de curso.',
}

const ETAPAS = [
  ['Envio', 'O aluno cadastra o trabalho e envia o PDF.'],
  ['Revisão', 'O orientador confere e aprova, ou devolve com comentários.'],
  ['Publicação', 'A coordenação publica o trabalho aprovado, com licença e embargo opcional.'],
  ['Acesso', 'Qualquer pessoa busca no acervo e baixa os trabalhos liberados.'],
]

export default function Sobre() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold text-marca">Sobre o repositório</h1>
      <p className="mt-4 text-lg text-slate-600">
        Um espaço para preservar a produção acadêmica e compartilhar o conhecimento construído nos
        cursos de graduação.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Como funciona</h2>
      <ol className="mt-4 flex flex-col gap-3">
        {ETAPAS.map(([titulo, texto], i) => (
          <li key={titulo} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marca font-semibold text-white">
              {i + 1}
            </span>
            <span>
              <span className="block font-semibold">{titulo}</span>
              <span className="text-sm text-slate-600">{texto}</span>
            </span>
          </li>
        ))}
      </ol>

      <h2 id="contato" className="mt-10 scroll-mt-6 text-2xl font-bold">
        Ajuda e contato
      </h2>
      <p className="mt-3 text-slate-600">
        Dúvidas sobre o envio de um trabalho? Fale com o seu orientador ou com a coordenação do curso.
        Para acompanhar um trabalho já enviado,{' '}
        <Link href="/painel" className="text-marca underline">
          entre na sua conta
        </Link>
        .
      </p>

      <p className="mt-10 rounded-xl bg-marca-claro px-4 py-3 text-sm text-slate-600">
        Protótipo demonstrativo desenvolvido como projeto acadêmico. Não é um serviço oficial da
        universidade.
      </p>
    </article>
  )
}
