// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Aquí pones las rutas que quieres bloquear a usuarios no logueados
  matcher: [
    "/perfil/:path*",
    "/crear-publicacion",
    "/foro/:path*"
  ],
};