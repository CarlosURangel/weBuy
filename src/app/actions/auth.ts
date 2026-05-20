"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

const SignupSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  correo: z.string().email("Correo electrónico inválido"),
  contrasena: z.string().min(6, "La contraseña requiere 6 caracteres mínimo"),
  confirmarContrasena: z.string(),
  telefono: z.string().min(8, "Teléfono inválido"),
  localidad: z.string().min(2, "Localidad muy corta"),
}).refine((data) => data.contrasena === data.confirmarContrasena, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarContrasena"],
});

export async function registrarUsuario(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validation = SignupSchema.safeParse(rawData);

  if (!validation.success) {
    return { 
      errors: validation.error.flatten().fieldErrors 
    };
  }

  const { nombre, correo, contrasena, telefono, localidad } = validation.data;

  try {
    const existe = await prisma.usuario.findUnique({ where: { correo } });
    if (existe) return { message: "El correo ya está en uso" };

    const hashed = await bcrypt.hash(contrasena, 10);
    await prisma.usuario.create({
      data: { nombre, correo, contrasena: hashed, telefono, localidad }
    });

    return { success: true };
  } catch (e) {
    return { message: "Error técnico en el servidor" };
  }
}