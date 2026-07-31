import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authStorage } from "@/lib/auth-storage";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken) {
      authStorage.setToken(accessToken);
      if (refreshToken) {
        authStorage.setRefreshToken(refreshToken);
      }
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-sm text-gray-500">Connexion en cours...</p>
    </div>
  );
}
