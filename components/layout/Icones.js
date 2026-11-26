// Ícones em SVG (sem biblioteca). Herdam a cor do texto (currentColor).
function Base({ children, className = 'h-5 w-5', ...resto }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...resto}
    >
      {children}
    </svg>
  )
}

export const IconeLivro = (p) => (
  <Base {...p}>
    <path d="M12 6.5C10.5 5.3 8.3 4.7 5 4.7v13c3.3 0 5.5.6 7 1.8 1.5-1.2 3.7-1.8 7-1.8v-13c-3.3 0-5.5.6-7 1.8Z" />
    <path d="M12 6.5v13" />
  </Base>
)
export const IconeCadeado = (p) => (
  <Base {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 7.5-2" />
  </Base>
)
export const IconeCadeadoFechado = (p) => (
  <Base {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Base>
)
export const IconeCapelo = (p) => (
  <Base {...p}>
    <path d="m12 4.5 9.5 4.5-9.5 4.5L2.5 9 12 4.5Z" />
    <path d="M6.5 11.5v4c0 1.2 2.5 2.5 5.5 2.5s5.5-1.3 5.5-2.5v-4" />
    <path d="M21.5 9v5" />
  </Base>
)
export const IconeArquivo = (p) => (
  <Base {...p}>
    <rect x="4" y="4.5" width="16" height="4" rx="1" />
    <path d="M5.5 8.5V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V8.5" />
    <path d="M10 12.5h4" />
  </Base>
)
export const IconeSeta = (p) => (
  <Base {...p}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Base>
)
export const IconeBusca = (p) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Base>
)
export const IconeFiltro = (p) => (
  <Base {...p}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Base>
)
export const IconeCheck = (p) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Base>
)
export const IconeDocumento = (p) => (
  <Base {...p}>
    <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
    <path d="M14 3.5V8h4M8.5 13h7M8.5 16.5h7" />
  </Base>
)
export const IconeCasa = (p) => (
  <Base {...p}>
    <path d="M4 11.5 12 4.5l8 7" />
    <path d="M6 10.5V19a1 1 0 0 0 1 1h3.5v-5h3v5H17a1 1 0 0 0 1-1v-8.5" />
  </Base>
)
export const IconeInfo = (p) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5" />
    <path d="M12 7.8h.01" />
  </Base>
)
export const IconeMenu = (p) => (
  <Base {...p}>
    <path d="M4.5 7h15M4.5 12h15M4.5 17h15" />
  </Base>
)
export const IconeFechar = (p) => (
  <Base {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Base>
)
export const IconeDownload = (p) => (
  <Base {...p}>
    <path d="M12 4.5v10" />
    <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
    <path d="M5 19.5h14" />
  </Base>
)
