"use client";

interface ProgressBarProps {
  participantesActuales: number;
  metaParticipantes: number;
  titulo?: string;
}

export function ProgressBar({
  participantesActuales,
  metaParticipantes,
  titulo = "Participantes",
}: ProgressBarProps) {
  const porcentaje = (participantesActuales / metaParticipantes) * 100;
  const porcentajeRedondeado = Math.min(100, Math.round(porcentaje));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{titulo}</span>
        <span className="text-sm font-semibold text-blue-600">
          {participantesActuales}/{metaParticipantes}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
          style={{ width: `${porcentajeRedondeado}%` }}
        />
      </div>
      <div className="text-xs text-gray-600">
        {porcentajeRedondeado}% completado
      </div>
    </div>
  );
}
