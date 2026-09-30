import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Se as credenciais do Azure/Google ainda não foram preenchidas no ambiente local,
  // permite a navegação para testes e homologação das telas do app e admin.
  const hasAuthSetup = Boolean(process.env.AZURE_AD_CLIENT_ID || process.env.GOOGLE_CLIENT_ID);

  if (hasAuthSetup && (pathname.startsWith("/app") || pathname.startsWith("/admin"))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    const userPerfil = (req.auth?.user as any)?.perfil;
    if (pathname.startsWith("/admin") && userPerfil === "motorista") {
      return NextResponse.redirect(new URL("/app", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|logo.jpg|icon-app.png).*)"],
};
