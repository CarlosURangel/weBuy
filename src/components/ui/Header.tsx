"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  session: { user: { name: string; rol?: string } } | null;
}

export function Header({ session }: HeaderProps) {
  const esAdmin = session?.user?.rol === "ADMINISTRADOR";

  return (
    <div className="bg-[#2D1340] text-white py-4 px-6 lg:px-10">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-2xl hover:opacity-80 transition-opacity">
          <ShoppingCart className="w-7 h-7 text-[#D4AF37]" />
          <span className="font-extrabold tracking-tight">WeBuy</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="/dashboard" className="hover:text-white transition-colors">Inicio</Link>
          <Link href="/perfil" className="hover:text-white transition-colors">Mi Perfil</Link>
          {esAdmin && (
            <Link href="/admin" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-6">
          {session ? (
            <div className="flex items-center gap-3">
              <Badge className="bg-[#D4AF37] text-[#2D1340] px-4 py-1.5 text-sm font-semibold">
                Hola, {session.user.name}
              </Badge>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors" aria-label="Iniciar sesión">
              <User className="w-6 h-6" />
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
