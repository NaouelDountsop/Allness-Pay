import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@afrilinkpay/shared';
import { userService } from '@/lib/api/user.service';

export function useDashboardHeader() {
  const { data: user } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
    retry: false,
  });

  const firstName = user?.prenom ?? 'Utilisateur';
  const fullName = user ? `${user.prenom} ${user.nom}` : 'Utilisateur Allness';
  const memberLabel = user?.profession || 'Membre';

  return { user, firstName, fullName, memberLabel };
}
