import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface DayEvent {
  day: number;
  type: "collecte" | "levee" | "retard";
}

const events: DayEvent[] = [
  { day: 11, type: "collecte" },
  { day: 13, type: "collecte" },
  { day: 20, type: "levee" },
  { day: 26, type: "retard" },
];

const dotColor: Record<DayEvent["type"], string> = {
  collecte: "bg-afrilink-green",
  levee: "bg-afrilink-orange",
  retard: "bg-red-500",
};

interface ScheduleCalendarModalProps {
  onClose: () => void;
}

export function ScheduleCalendarModal({ onClose }: ScheduleCalendarModalProps) {
  const [monthLabel] = useState("Octobre 2023");
  const daysInMonth = 31;
  const startOffset = 6; // le 1er tombe un dimanche dans cet exemple

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Calendrier des Échéances</h3>
          <button onClick={onClose} aria-label="Fermer" className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <button aria-label="Mois précédent" className="text-gray-400">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-800">{monthLabel}</span>
          <button aria-label="Mois suivant" className="text-gray-400">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 mb-1">
          {["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {Array.from({ length: startOffset }).map((_, i) => (
            <span key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const event = events.find((e) => e.day === day);
            return (
              <div
                key={day}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs relative ${
                  event ? "bg-gray-50 font-medium text-gray-800" : "text-gray-600"
                }`}
              >
                {day}
                {event && (
                  <span
                    className={`absolute bottom-1 w-1 h-1 rounded-full ${dotColor[event.type]}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-[10px] text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-afrilink-green" /> Cotisation Standard
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-afrilink-orange" /> Levée (Versement)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Retard / Échéance Critique
          </span>
        </div>

        <p className="text-xs text-gray-400 mb-4">Événements à venir (30 jours)</p>

        <button
          onClick={onClose}
          className="w-full h-11 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium transition-colors"
        >
          Fermer le calendrier
        </button>
      </div>
    </div>
  );
}
