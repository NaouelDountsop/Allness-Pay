import { FileText, ShieldCheck, Bell, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function KycProcessing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center text-center max-w-md mx-auto pt-4">
      <div className="w-full">
        <div className="relative w-14 h-14 mx-auto mb-4">
          <div className="w-14 h-14 rounded-full bg-afrilink-green/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-afrilink-green" />
          </div>
          <span className="absolute -bottom-1 -right-3 text-[10px] font-medium bg-afrilink-orange/10 text-afrilink-orange px-2 py-0.5 rounded-full">
            En cours
          </span>
        </div>

        <h2 className="text-lg font-bold text-afrilink-dark mb-2">
          Validation en cours
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Nos équipes vérifient vos informations. Cela prend généralement moins de
          24 heures.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="rounded-xl bg-afrilink-dark/5 p-3">
            <ShieldCheck className="w-4 h-4 text-afrilink-green mb-1" />
            <p className="text-xs font-medium text-gray-700">Sécurité</p>
            <p className="text-[11px] text-gray-500">
              Vos données sont chiffrées selon les standards bancaires les plus
              stricts.
            </p>
          </div>
          <div className="rounded-xl bg-afrilink-dark/5 p-3">
            <Bell className="w-4 h-4 text-afrilink-green mb-1" />
            <p className="text-xs font-medium text-gray-700">Notification</p>
            <p className="text-[11px] text-gray-500">
              Vous recevrez un e-mail dès que votre compte sera prêt à l'emploi.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full h-11 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium transition-colors mb-3"
        >
          Retour au Tableau de Bord
        </button>
        <a href="/support" className="text-sm text-afrilink-green font-medium">
          Contacter le support
        </a>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-afrilink-green/5 border border-afrilink-green/10 p-4 mt-4 w-full text-left">
        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-afrilink-green" />
        <div>
          <p className="text-xs font-medium text-afrilink-dark">Le saviez-vous ?</p>
          <p className="text-xs text-gray-500">
            Vous pouvez déjà explorer nos guides de gestion de patrimoine en attendant
            la validation.
          </p>
        </div>
      </div>
    </div>
  );
}
