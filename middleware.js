// Middleware Next.js — controle de acesso por rota
// Docs: https://nextjs.org/docs/app/building-your-application/routing/middleware

import { NextResponse } from 'next/server'

export async function middleware(request) {
  // TODO: validar sessão via Supabase e redirecionar rotas restritas
  return NextResponse.next()
}

export const config = {
  matcher: ['/painel/:path*'],
}
