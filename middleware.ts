import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Routes publiques
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next()
  }

  // Routes protégées
  if (pathname.startsWith("/dashboard")) {
    const supabase = await createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

async function createServerSupabaseClient() {
  const { createServerSupabaseClient: createClient } = await import("@/lib/supabase-server");
  return createClient()
}
