import { useNavigate } from "react-router-dom";

export function KycProcessing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center text-center py-6">
      <img
        src="/Waiting-amico.svg"
        alt="Validation en cours"
        className="w-80 h-80 mb-6"
      />

      <button
        onClick={() => navigate("/dashboard")}
        className="w-full h-11 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium transition-colors"
      >
        Retour au Tableau de Bord
      </button>
    </div>
  );
}
