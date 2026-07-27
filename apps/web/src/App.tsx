import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "@/app/auth/signup-page";
import VerifyEmailPage from "@/app/auth/verify-email-page";
import LoginPage from "@/app/auth/login-page";
import DashboardPage from "@/app/user_dashboard/dashboard-page";
import KycPage from "@/app/user_dashboard/kyc-page";
import WalletPage from "@/app/user_dashboard/wallet-page";
import SendMoneyPage from "@/app/user_dashboard/send-money-page";
import PaymentsPage from "@/app/user_dashboard/payements-page";
import BillPaymentPage from "@/app/user_dashboard/bill-payement-page";
import QrPaymentPage from "@/app/user_dashboard/qr-payement-page";
import QrScanPage from "@/app/user_dashboard/qr-scan-page";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/kyc" element={<KycPage />} />
        <Route path="/dashboard/wallet" element={<WalletPage />} />
        <Route path="/dashboard/send" element={<SendMoneyPage />} />
        <Route path="/dashboard/payments" element={<PaymentsPage />} />
<Route path="/dashboard/payments/scan" element={<QrScanPage />} />
<Route path="/dashboard/payments/qr-result" element={<QrPaymentPage />} />
<Route path="/dashboard/payments/:category" element={<BillPaymentPage />} />
      </Routes>
    </BrowserRouter>
  );
}
