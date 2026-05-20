"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      if ((session?.user as any)?.rol === "ADMINISTRADOR") {
        router.push("/admin/reportes");
      } else {
        router.push("/dashboard");
      }
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
              <Link href="#" className="text-primary text-sm font-medium underline hover:text-primary/80 transition">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
