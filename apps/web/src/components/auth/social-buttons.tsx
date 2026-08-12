import { AppButton } from '@/components/common/button';

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const apiBase =
  rawBase.replace(/\/$/, '') +
  (rawBase.includes('/api/v1') ? '' : rawBase.includes('/api') ? '/v1' : '/api/v1');

export function SocialButtons() {
  const handleGoogleLogin = () => {
    window.location.href = `${apiBase}/auth/google?prompt=select_account`;
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      <AppButton variant="outline" type="button" onClick={handleGoogleLogin}>
        <img src="/Google.jpg" className="w-9 h-9" alt="" />
        Continuer avec Google
      </AppButton>
      {/* <AppButton variant="outline" type="button">
        <img src="/Apple.jpg" className="w-9 h-9" alt="" /> Apple
      </AppButton> */}
    </div>
  );
}
