import './globals.css'
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-100">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
          </Providers>      </body>
    </html>
  )
}