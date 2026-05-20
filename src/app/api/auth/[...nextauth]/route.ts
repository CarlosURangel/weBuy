// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        correo: { label: "Correo", type: "email" },
        contrasena: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.contrasena) {
          throw new Error("Faltan credenciales");
        }

        const usuario = await prisma.usuario.findUnique({
          where: { correo: credentials.correo }
        });

        if (!usuario) {
          throw new Error("No existe una cuenta con este correo");
        }

        const contrasenaValida = await bcrypt.compare(credentials.contrasena, usuario.contrasena);

        if (!contrasenaValida) {
          throw new Error("Contraseña incorrecta");
        }


        return {
          id: usuario.id_usuario.toString(),
          name: usuario.nombre,
          email: usuario.correo,
          rol: usuario.rol,
          localidad: usuario.localidad
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = (user as any).rol;
        token.localidad = (user as any).localidad;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.rol = token.rol;
        session.user.localidad = token.localidad;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };