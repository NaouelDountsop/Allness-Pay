import { Navigate } from "react-router-dom";
import { authStorage } from "@/lib/auth-storage";

export function UserProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = authStorage.getToken();
  const role = authStorage.getRole();

  if (!token || role === "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
