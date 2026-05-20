"use client";

import { Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || undefined;
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await signIn("credentials", {
      correo,
      contrasena,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      const session = await getSession();
      router.push(callbackUrl || ((session?.user as any)?.rol === "ADMINISTRADOR" ? "/admin/reportes" : "/dashboard"));
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="flex flex-col items-center w-full max-w-md">
        <img src="/logowe.png" alt="WeBuy Logo" className="w-24 h-24 md:w-28 md:h-28 object-contain mb-6" />

        <div className="w-full bg-[#f4f0f5] rounded-xl shadow-2xl border p-8 md:p-10">
          <h1 className="text-4xl font-extrabold text-primary mb-2 tracking-tight text-center">Login</h1>
          <p className="text-muted-foreground text-sm mb-8 text-center">
            ¿No tienes cuenta aún?{" "}
            <Link href="/signup" className="text-primary font-medium underline hover:text-primary/80 transition">
              crea una nueva.
            </Link>
          </p>

          {error && (
            <p className="text-destructive text-sm mb-4 text-center font-medium">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="correo">Correo Electrónico</Label>
              <Input
                id="correo"
                type="email"
                placeholder="michael.joe@xmail.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contrasena">Contraseña</Label>
              <div className="relative">
                <Input
                  id="contrasena"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="default" size="lg" disabled={isLoading} className="w-full mt-2">
              {isLoading ? "Iniciando sesión..." : "Login"}
            </Button>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-primary text-sm font-medium underline hover:text-primary/80 transition cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6 relative">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Contacta con soporte</h3>
              <p className="text-sm text-gray-500 mb-4">
                Ponte en contacto con nosotros para recuperar tu contraseña:
              </p>
              <a
                href="mailto:webuy.support@gmail.com"
                className="text-purple-600 font-semibold text-base hover:text-purple-700 transition-colors"
              >
                webuy.support@gmail.com
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
