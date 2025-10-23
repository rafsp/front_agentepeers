import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

alert('teste');

// Rotas que precisam de autenticação
const protectedRoutes = ['/dashboard', '/code-analysis']

// Rotas públicas (não precisam de login)
const publicRoutes = ['/login', '/', '/api/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
    console.log('teste');
  // Verificar se é rota protegida
    const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Pegar cookie de autenticação
  const isAuthenticated = request.cookies.get('peers_authenticated')?.value === 'true'
  
  // Se está tentando acessar rota protegida sem estar autenticado
  if (isProtectedRoute && !isAuthenticated) {
    // Redirecionar para login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Se está autenticado e tentando acessar login, redirecionar para dashboard
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

// Configurar em quais rotas o middleware vai rodar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

