import { useState, useEffect } from 'react';
import { userService } from '@/lib/api/user.service';
import type { UserProfile } from '@afrilinkpay/shared';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  return { profile, loading };
}
