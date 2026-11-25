import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Rotas só para quem NÃO está logado
const ROTAS_DE_VISITANTE = ['/login', '/cadastro']

function ehRotaRestrita(pathname) {
  return pathname === '/painel' || pathname.startsWith('/painel/')
}

// Cria um redirecionamento sem perder os cookies de sessão renovados
function redirecionar(url, respostaOriginal) {
  const resposta = NextResponse.redirect(url)
  respostaOriginal.cookies.getAll().forEach((cookie) => resposta.cookies.set(cookie))
  return resposta
}

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: não coloque código entre createServerClient e getUser.
  // getUser() confere a sessão com o servidor de autenticação e renova o token.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Sem login tentando abrir o painel -> vai para o login
  if (!user && ehRotaRestrita(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    return redirecionar(url, supabaseResponse)
  }

  // Já logado abrindo login ou cadastro -> vai para o painel
  if (user && ROTAS_DE_VISITANTE.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/painel'
    url.search = ''
    return redirecionar(url, supabaseResponse)
  }

  return supabaseResponse
}
