import { updateSession } from '@/lib/supabase/middleware'

// Camada 1 da proteção: roda antes de cada página e
// redireciona para o login quem tenta abrir /painel sem sessão.
// (No Next.js 16 este arquivo passa a se chamar proxy.js.)
export async function middleware(request) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // tudo, menos arquivos estáticos e imagens
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
