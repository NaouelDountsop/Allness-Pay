import { ArrowUpRight, UserPlus} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tontineBannerStyle } from '@/styles/banners';

interface TontineInvitationBannerProps {
  count: number;
}

export function TontineInvitationBanner({ count }: TontineInvitationBannerProps) {
  const navigate = useNavigate();

  if (count === 0) return null;

  return (
    <div className={tontineBannerStyle.wrapper}>
      <div className="flex items-start sm:items-center gap-3">

        <span className={tontineBannerStyle.iconWrapper}>
          <UserPlus className={`w-4 h-4 ${tontineBannerStyle.iconColor}`} />
        </span>
        <p className={`text-sm font-medium ${tontineBannerStyle.textColor}`}>
          Vous avez {count} invitation{count > 1 ? 's' : ''} à rejoindre une tontine
        </p>
      </div>
      <button
        onClick={() => navigate('/dashboard/tontines/invitations', { state: { fromBanner: true } })}
        className={tontineBannerStyle.button}
      >
        Voir
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>
    </div>
  );
}
