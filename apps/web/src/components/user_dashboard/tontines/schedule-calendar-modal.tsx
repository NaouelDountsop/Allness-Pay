import { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface DayEvent {
  day: number;
  type: 'collecte' | 'levee' | 'retard';
}

const dotColor: Record<DayEvent['type'], string> = {
  collecte: 'bg-afrilink-green',
  levee: 'bg-afrilink-orange',
  retard: 'bg-red-500',
};

function generateEvents(year: number, month: number, frequence: string): DayEvent[] {
  const events: DayEvent[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const intervals: Record<string, number> = {
    Hebdomadaire: 7,
    Bimensuelle: 14,
    Mensuelle: daysInMonth,
  };

  const interval = intervals[frequence] ?? daysInMonth;

  for (let day = 1; day <= daysInMonth; day += interval) {
    events.push({ day, type: 'collecte' });
    if (day + 5 <= daysInMonth) {
      events.push({ day: day + 5, type: 'levee' });
    }
    if (day + 10 <= daysInMonth) {
      events.push({ day: day + 10, type: 'retard' });
    }
  }

  return events;
}

function getMonthLabel(year: number, month: number): string {
  return new Date(year, month).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getStartOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

interface ScheduleCalendarModalProps {
  onClose: () => void;
  frequence?: string;
}

export function ScheduleCalendarModal({
  onClose,
  frequence = 'Mensuelle',
}: ScheduleCalendarModalProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const startOffset = useMemo(() => getStartOffset(year, month), [year, month]);
  const events = useMemo(() => generateEvents(year, month, frequence), [year, month, frequence]);
  const monthLabel = useMemo(() => getMonthLabel(year, month), [year, month]);

  const goToPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goToNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const upcoming = events
    .filter((e) => e.day >= now.getDate() || month !== now.getMonth() || year !== now.getFullYear())
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Calendrier des Échéances</h3>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <button
            onClick={goToPrev}
            aria-label="Mois précédent"
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-800">{monthLabel}</span>
          <button
            onClick={goToNext}
            aria-label="Mois suivant"
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 mb-1">
          {['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'].map((d) => (
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
                  event ? 'bg-gray-50 font-medium text-gray-800' : 'text-gray-600'
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
            <span className="w-2 h-2 rounded-full bg-afrilink-green" /> Cotisation
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-afrilink-orange" /> Levée
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Retard
          </span>
        </div>

        {upcoming.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-2">Événements à venir</p>
            <div className="space-y-2 mb-4">
              {upcoming.map((e) => {
                const label =
                  e.type === 'collecte' ? 'Cotisation' : e.type === 'levee' ? 'Levée' : 'Retard';
                const color =
                  e.type === 'collecte'
                    ? 'text-afrilink-green'
                    : e.type === 'levee'
                      ? 'text-afrilink-orange'
                      : 'text-red-500';
                return (
                  <div
                    key={`${e.day}-${e.type}`}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-600">
                      {e.day} {monthLabel}
                    </span>
                    <span className={`font-medium ${color}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

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
