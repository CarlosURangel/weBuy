// components/producto/GaleriaInteractiva.tsx
"use client";

import { useState } from "react";

type GaleriaProps = {
  // Aceptamos un arreglo de objetos con la URL
  images: Array<{ url: string }>; 
}

export default function GaleriaInteractiva({ images }: GaleriaProps) {
  // Estado para controlar qué imagen está seleccionada (por defecto la primera)
  const [selectedImage, setSelectedImage] = useState(images[0]?.url);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-2xl aspect-[1/1] flex items-center justify-center text-6xl shadow-inner border border-gray-200">
        🛍️
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Imagen Principal Grande (Inspirado en tu referencia) */}
      <div className="bg-[#F6F6F6] rounded-2xl aspect-[1/1] flex items-center justify-center overflow-hidden shadow-md p-6 border border-gray-100">
        <img 
          src={selectedImage} 
          alt="Imagen principal del producto" 
          className="object-contain w-full h-full" 
        />
      </div>

      {/* Galería de Miniaturas abajo (Inspirado en tu referencia) */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((img, index) => (
          <button 
            key={index}
            onClick={() => setSelectedImage(img.url)}
            className={`bg-[#F6F6F6] rounded-xl aspect-[1/1] flex items-center justify-center overflow-hidden border-2 transition p-3 hover:border-gray-300 ${
              selectedImage === img.url ? "border-[#A855F7] shadow-lg" : "border-gray-100"
            }`}
          >
            <img 
              src={img.url} 
              alt={`Miniatura ${index + 1}`} 
              className="object-contain w-full h-full" 
            />
          </button>
        ))}
      </div>

    </div>
  );
}