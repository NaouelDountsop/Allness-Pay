import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/app/landing-page";
import SignupPage from "@/app/auth/signup-page";
import VerifyEmailPage from "@/app/auth/verify-email-page";
import LoginPage from "@/app/auth/login-page";
import AuthCallbackPage from "@/app/auth/auth-callback-page";
import DashboardPage from "@/app/user_dashboard/u-dashboard-page";
import KycPage from "@/app/user_dashboard/kyc-page";
import WalletPage from "@/app/user_dashboard/wallet-page";
import SendMoneyPage from "@/app/user_dashboard/send-money-page";
import PaymentsPage from "@/app/user_dashboard/payements-page";
import BillPaymentPage from "@/app/user_dashboard/bill-payement-page";
import QrPaymentPage from "@/app/user_dashboard/qr-payement-page";
import QrScanPage from "@/app/user_dashboard/qr-scan-page";
import TontinesPage from "@/app/user_dashboard/tontines-page";
import CreateTontinePage from "@/app/user_dashboard/create-tontine-page";
import TontineDetailPage from "@/app/user_dashboard/tontine-detail-page";
import ContributionHistoryPage from "@/app/user_dashboard/contribution-history-page";
import MakeContributionPage from "@/app/user_dashboard/make-contribution-page";
import TontineSettingsPage from "@/app/user_dashboard/tontine-settings-page";
import AdminDashboardPage from "@/app/admin-dashboard/a-dashboard-page";
import UsersListPage from "@/app/admin-dashboard/users-list-page";
import TontinesSupervisionPage from "@/app/admin-dashboard/tontines-supervision-page";
import MerchantsListPage from "@/app/admin-dashboard/merchant-list-page";
import MerchantDetailPage from "@/app/admin-dashboard/merchant-detail-page";
import AddMerchantPage from "@/app/admin-dashboard/add-merchant-page";
import KycListPage from "@/app/admin-dashboard/kyc-list-page";
import KycDetailPage from "@/app/admin-dashboard/kyc-details-page";
import ExchangeRatesListPage from "@/app/admin-dashboard/exchange-rate-list-page";
import EditExchangeRatePage from "@/app/admin-dashboard/edit-exchange-rate-page";
import AddExchangeRatePage from "@/app/admin-dashboard/add-exchange-rate-page";
import ExchangeRateHistoryPage from "@/app/admin-dashboard/exchange-rate-history-page";
import ExchangeRateSettingsPage from "@/app/admin-dashboard/exchange-rate-settings-page";

import { DepositFlowProvider } from "./context/deposit-flow-context";
import InitiateDepositPage from "@/app/user_dashboard/initiate-deposit-page";
import RequestSentPage from "@/app/user_dashboard/request-sent-page";
import PhoneConfirmationPage from "@/app/user_dashboard/phone-confirmation-page";
import ProcessingPage from "@/app/user_dashboard/processing-page";
import DepositSuccessPage from "@/app/user_dashboard/deposit-success-page";


export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/kyc" element={<KycPage />} />
        <Route path="/dashboard/wallet" element={<WalletPage />} />
        <Route path="/dashboard/send" element={<SendMoneyPage />} />
        <Route path="/dashboard/payments" element={<PaymentsPage />} />
        <Route path="/dashboard/payments/scan" element={<QrScanPage />} />
        <Route path="/dashboard/payments/qr-result" element={<QrPaymentPage />} />
        <Route path="/dashboard/payments/:category" element={<BillPaymentPage />} />
        <Route path="/dashboard/tontines" element={<TontinesPage />} />
        <Route path="/dashboard/tontines/create" element={<CreateTontinePage />} />
        <Route path="/dashboard/tontines/:id" element={<TontineDetailPage />} />
        <Route path="/dashboard/tontines/:id/history" element={<ContributionHistoryPage />} />
        <Route path="/dashboard/tontines/:id/contribute" element={<MakeContributionPage />} />
        <Route path="/dashboard/tontines/:id/settings" element={<TontineSettingsPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/utilisateurs" element={<UsersListPage />} />
        <Route path="/admin/tontines" element={<TontinesSupervisionPage />} />
        <Route path="/admin/marchands" element={<MerchantsListPage />} />
        <Route path="/admin/marchands/nouveau" element={<AddMerchantPage />} />
        <Route path="/admin/marchands/:id" element={<MerchantDetailPage />} />
        <Route path="/admin/kyc" element={<KycListPage />} />
        <Route path="/admin/kyc/:id" element={<KycDetailPage />} />
        <Route path="/admin/taux-de-change" element={<ExchangeRatesListPage />} />
        <Route path="/admin/taux-de-change/nouveau" element={<AddExchangeRatePage />} />
        <Route path="/admin/taux-de-change/historique" element={<ExchangeRateHistoryPage />} />
        <Route path="/admin/taux-de-change/parametres" element={<ExchangeRateSettingsPage />} />
        <Route path="/admin/taux-de-change/:id/modifier" element={<EditExchangeRatePage />} />

        <Route path="/deposit" element={<DepositFlowProvider><InitiateDepositPage /></DepositFlowProvider>} />
        <Route path="/deposit/request-sent" element={<DepositFlowProvider><RequestSentPage /></DepositFlowProvider>} />
        <Route path="/deposit/confirm" element={<DepositFlowProvider><PhoneConfirmationPage /></DepositFlowProvider>} />
        <Route path="/deposit/processing" element={<DepositFlowProvider><ProcessingPage /></DepositFlowProvider>} />
        <Route path="/deposit/success" element={<DepositFlowProvider><DepositSuccessPage /></DepositFlowProvider>} />
      </Routes>
    </BrowserRouter>
  );
}