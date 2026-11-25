// Formulário de busca (receita 17). Usa method GET: os filtros ficam na URL
// (/?q=saude&curso=...&ano=2026), então o resultado pode ser compartilhado
// e funciona até sem JavaScript. A página lê os valores em searchParams.
export default function FormBusca({ q, curso, ano, cursos, anos }) {
  const campo = 'rounded border border-gray-300 bg-white px-3 py-2 text-black'

  return (
    <form action="/" method="GET" className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1 text-sm">
        Buscar
        <input
          name="q"
          type="search"
          defaultValue={q ?? ''}
          placeholder="Título, resumo, palavras-chave..."
          className={campo}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Curso
        <select name="curso" defaultValue={curso ?? ''} className={campo}>
          <option value="">Todos</option>
          {cursos.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Ano
        <select name="ano" defaultValue={ano ?? ''} className={campo}>
          <option value="">Todos</option>
          {anos.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
      >
        Buscar
      </button>
    </form>
  )
}
