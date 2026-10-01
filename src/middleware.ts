import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 1. Sessão NextAuth (Microsoft Entra ID)
  const nextAuthUser = req.auth?.user as any;

  // 2. Sessão via Cookie Seguro de Motorista / Usuário
  const sessionCookie = req.cookies.get("prime_session")?.value;
  let driverUser: any = null;
  if (sessionCookie) {
    try {
      driverUser = JSON.parse(decodeURIComponent(sessionCookie));
    } catch {
      try {
        driverUser = JSON.parse(sessionCookie);
      } catch {}
    }
  }

  const activeUser = nextAuthUser || driverUser;
  const isLoggedIn = Boolean(activeUser);
  const userPerfil = activeUser?.perfil || "motorista";

  // Rotas protegidas (/app e /admin)
  if (pathname.startsWith("/app") || pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Motoristas não entram no painel administrativo
    if (pathname.startsWith("/admin") && userPerfil === "motorista") {
      return NextResponse.redirect(new URL("/app", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|logo.png|logo.jpg|icon-app.png).*)"],
};
