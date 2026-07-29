import { Delete } from "lucide-react";

interface PinPadProps {
  value: string;
  length?: number;
  onChange: (value: string) => void;
  error?: boolean;
}

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

export function PinPad({ value, length = 4, onChange, error }: PinPadProps) {
  const handlePress = (key: string) => {
    if (key === "del") {
      onChange(value.slice(0, -1));
    } else if (value.length < length) {
      onChange(value + key);
    }
  };

  return (
    <div>
      <div className="flex justify-center gap-3 mb-8">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-11 h-11 rounded-lg border flex items-center justify-center text-lg font-semibold ${
              error
                ? "border-red-400"
                : value[i]
                ? "border-afrilink-orange"
                : "border-afrilink-orange/40"
            }`}
          >
            {value[i] ? "•" : ""}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
        {keys.map((key, i) =>
          key === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => handlePress(key)}
              className="h-14 rounded-xl bg-afrilink-dark hover:bg-afrilink-darker text-white flex items-center justify-center text-lg font-medium transition-colors"
            >
              {key === "del" ? <Delete className="w-4 h-4 text-afrilink-orange" /> : key}
            </button>
          )
        )}
      </div>
    </div>
  );
}
