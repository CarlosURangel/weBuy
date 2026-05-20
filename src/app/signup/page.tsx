"use client";

import { useState, useTransition } from "react";
import { registrarUsuario } from "@/app/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ESTADOS_MEXICO = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Coahuila", "Colima", "Ciudad de México",
  "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "México",
  "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla",
  "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora",
  "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas",
];

type ServerErrors = Record<string, string[] | undefined>;

export default function SignupPage() {
  const [isPending, startTransition] = useTransition();
  const [serverErrors, setServerErrors] = useState<ServerErrors>({});
  const router = useRouter();

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerErrors({});
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await registrarUsuario(formData);

      if (res?.errors) {
        setServerErrors(res.errors);
        toast.error("Revisa los errores en el formulario");
      } else if (res?.message) {
        toast.error(res.message);
      } else if (res?.success) {
        toast.success("¡Cuenta creada! Redirigiendo...");
        setTimeout(() => router.push("/login"), 2000);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="flex flex-col items-center w-full max-w-lg">
        <img src="/logowe.png" alt="WeBuy Logo" className="w-24 h-24 md:w-28 md:h-28 object-contain mb-6" />

        <div className="w-full bg-[#f4f0f5] rounded-xl shadow-2xl border p-8 md:p-10">
          <h1 className="text-4xl font-extrabold text-primary mb-2 tracking-tight text-center">Sign up</h1>
          <p className="text-muted-foreground text-sm mb-8 text-center">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary font-medium underline hover:text-primary/80 transition">
              Inicia sesión.
            </Link>
          </p>

          <form onSubmit={handleForm} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup label="Nombre" name="nombre" placeholder="Juan Pérez" error={serverErrors.nombre} disabled={isPending} />
              <InputGroup label="Email" name="correo" type="email" placeholder="juan@mail.com" error={serverErrors.correo} disabled={isPending} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup label="Contraseña" name="contrasena" placeholder="••••••" error={serverErrors.contrasena} disabled={isPending} isPassword />
              <InputGroup label="Confirmar Contraseña" name="confirmarContrasena" placeholder="••••••" error={serverErrors.confirmarContrasena} disabled={isPending} isPassword />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup label="Teléfono" name="telefono" placeholder="5512345678" error={serverErrors.telefono} disabled={isPending} />
              <div className="grid gap-2">
                <Label>Localidad</Label>
                <select
                  name="localidad"
                  className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                    serverErrors.localidad ? "border-destructive focus-visible:ring-destructive" : "border-input"
                  }`}
                  disabled={isPending}
                >
                  <option value="">Selecciona un estado</option>
                  {ESTADOS_MEXICO.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
                {serverErrors.localidad && <span className="text-xs font-medium text-destructive">{serverErrors.localidad[0]}</span>}
              </div>
            </div>

            <Button type="submit" variant="default" size="lg" disabled={isPending} className="w-full mt-4">
              {isPending ? "Validando datos..." : "Crear Cuenta"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, error, isPassword, type = "text", ...props }: {
  label: string;
  error?: string[];
  isPassword?: boolean;
  type?: string;
  [key: string]: unknown;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={inputType}
          className={error ? "border-destructive focus-visible:ring-destructive" : ""}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs font-medium text-destructive">{error[0]}</span>}
    </div>
  );
}
