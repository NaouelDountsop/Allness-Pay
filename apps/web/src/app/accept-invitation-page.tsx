import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tontineService } from '@/lib/api/tontine.service';
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AcceptInvitationPage() {
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const hasCalled = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage("Lien d'invitation invalide — aucun token trouvé.");
      return;
    }

    // Empêche le double appel (StrictMode / remount) qui provoquait
    // faussement l'erreur "invitation déjà traitée" alors que le premier
    // appel avait réussi.
    if (hasCalled.current) return;
    hasCalled.current = true;

    tontineService
      .acceptByToken(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMessage(
          err?.response?.data?.message ||
            "Une erreur est survenue lors de l'activation de l'invitation.",
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 text-afrilink-blue mx-auto animate-spin mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Activation de l'invitation...</h1>
            <p className="text-sm text-gray-500">
              Veuillez patienter, nous rejoignons la tontine pour vous.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Invitation acceptée !</h1>
            <p className="text-sm text-gray-500 mb-6">
              Vous êtes maintenant membre de la tontine. Vous pouvez accéder à votre tableau de
              bord.
            </p>
            <Button onClick={() => navigate('/dashboard/tontines')} className="w-full">
              Voir mes tontines
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Impossible d'activer l'invitation
            </h1>
            <p className="text-sm text-gray-500 mb-6">{errorMessage}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/login')} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Se connecter
              </Button>
              <Button onClick={() => navigate('/dashboard/tontines')} className="flex-1">
                Retour aux tontines
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
