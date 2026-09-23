import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const INVITATION_TOKEN_KEY = 'pending_invitation_token';

export default function AcceptInvitationPage() {
  const navigate = useNavigate();
  const token = useSearchParams()[0].get('token');

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    localStorage.setItem(INVITATION_TOKEN_KEY, token);
    navigate('/', { replace: true });
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <Loader2 className="h-12 w-12 text-allness-blue mx-auto animate-spin mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Redirection en cours...</h1>
        <p className="text-sm text-gray-500">Veuillez patienter.</p>
      </div>
    </div>
  );
}
