// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/novo-pipeline', '/project', '/projeto', '/repositorios', '/relatorios', '/squads', '/integracoes', '/code-analysis', '/code-generation', '/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!PROTECTED.some(r => pathname === r || pathname.startsWith(`${r}/`))) return NextResponse.next()
  if (request.cookies.get('peers_authenticated')?.value !== 'true') {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/novo-pipeline/:path*', '/project/:path*', '/projeto/:path*', '/repositorios/:path*', '/relatorios/:path*', '/squads/:path*', '/integracoes/:path*', '/code-analysis/:path*', '/code-generation/:path*', '/admin/:path*'],
}