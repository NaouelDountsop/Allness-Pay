import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProtectedRoute } from "@/components/common/admin-protected-route";
import { UserProtectedRoute } from "@/components/common/user-protected-route";
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
import TontineMembersPage from "@/app/user_dashboard/tontine-members-page";
import ContributionHistoryPage from "@/app/user_dashboard/contribution-history-page";
import MakeContributionPage from "@/app/user_dashboard/make-contribution-page";
import TontineSettingsPage from "@/app/user_dashboard/tontine-settings-page";
import TontineChatPage from "@/app/user_dashboard/tontine-chat-page";
import ProfilePage from "@/app/user_dashboard/profile-page";
import SettingsPage from "@/app/user_dashboard/settings-page";
import AdminLoginPage from "@/app/admin-dashboard/admin-login-page";
import AdminDashboardPage from "@/app/admin-dashboard/a-dashboard-page";
import UsersListPage from "@/app/admin-dashboard/users-list-page";
import TontinesSupervisionPage from "@/app/admin-dashboard/tontines-supervision-page";
import MerchantsListPage from "@/app/admin-dashboard/merchant-list-page";
import MerchantDetailPage from "@/app/admin-dashboard/merchant-detail-page";
import AddMerchantPage from "@/app/admin-dashboard/add-merchant-page";
import KycListPage from "@/app/admin-dashboard/kyc-list-page";
import KycDetailPage from "@/app/admin-dashboard/kyc-details-page";
import ExchangeRatesPage from "./app/admin-dashboard/exchange-rate-list-page";
import EditExchangeRatePage from "@/app/admin-dashboard/edit-exchange-rate-page";
import AddExchangeRatePage from "@/app/admin-dashboard/add-exchange-rate-page";
import ExchangeRateHistoryPage from "@/app/admin-dashboard/exchange-rate-history-page";
import ExchangeRateSettingsPage from "@/app/admin-dashboard/exchange-rate-settings-page";
import TransactionsPage from "@/app/user_dashboard/transaction-page";
import AdminTransactionsPage from "@/app/admin-dashboard/transactions-page";
import PartnersPage from "@/app/admin-dashboard/partners-page";

import { DepositFlowProvider } from './context/deposit-flow-context';
import InitiateDepositPage from '@/app/user_dashboard/initiate-deposit-page';
import RequestSentPage from '@/app/user_dashboard/request-sent-page';
import PhoneConfirmationPage from '@/app/user_dashboard/phone-confirmation-page';
import ProcessingPage from '@/app/user_dashboard/processing-page';
import DepositSuccessPage from '@/app/user_dashboard/deposit-success-page';
import BeneficiariesPage from './app/user_dashboard/beneficiary-page';
import AcceptInvitationPage from '@/app/accept-invitation-page';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/invitations/accept" element={<AcceptInvitationPage />} />
        <Route path="/dashboard" element={<UserProtectedRoute><DashboardPage /></UserProtectedRoute>} />
        <Route path="/dashboard/kyc" element={<UserProtectedRoute><KycPage /></UserProtectedRoute>} />
        <Route path="/dashboard/wallet" element={<UserProtectedRoute><WalletPage /></UserProtectedRoute>} />
        <Route path="/dashboard/send" element={<UserProtectedRoute><SendMoneyPage /></UserProtectedRoute>} />
        <Route path="/dashboard/payments" element={<UserProtectedRoute><PaymentsPage /></UserProtectedRoute>} />
        <Route path="/dashboard/payments/scan" element={<UserProtectedRoute><QrScanPage /></UserProtectedRoute>} />
        <Route path="/dashboard/payments/qr-result" element={<UserProtectedRoute><QrPaymentPage /></UserProtectedRoute>} />
        <Route path="/dashboard/payments/:category" element={<UserProtectedRoute><BillPaymentPage /></UserProtectedRoute>} />
        <Route path="/dashboard/tontines" element={<UserProtectedRoute><TontinesPage /></UserProtectedRoute>} />
        <Route path="/dashboard/tontines/create" element={<UserProtectedRoute><CreateTontinePage /></UserProtectedRoute>} />
        <Route path="/dashboard/tontines/:id" element={<UserProtectedRoute><TontineDetailPage /></UserProtectedRoute>} />
        <Route path="/dashboard/tontines/:id/members" element={<UserProtectedRoute><TontineMembersPage /></UserProtectedRoute>} />
        <Route path="/dashboard/tontines/:id/history" element={<UserProtectedRoute><ContributionHistoryPage /></UserProtectedRoute>} />
        <Route path="/dashboard/tontines/:id/contribute" element={<UserProtectedRoute><MakeContributionPage /></UserProtectedRoute>} />
        <Route path="/dashboard/tontines/:id/chat" element={<UserProtectedRoute><TontineChatPage /></UserProtectedRoute>} />
        <Route path="/dashboard/tontines/chat" element={<UserProtectedRoute><TontineChatPage /></UserProtectedRoute>} />
        <Route path="/dashboard/tontines/:id/settings" element={<UserProtectedRoute><TontineSettingsPage /></UserProtectedRoute>} />
        <Route path="/dashboard/transactions" element={<UserProtectedRoute><TransactionsPage /></UserProtectedRoute>} />
        <Route path="/dashboard/beneficiaries" element={<UserProtectedRoute><BeneficiariesPage /></UserProtectedRoute>} />
        <Route path="/dashboard/profile" element={<UserProtectedRoute><ProfilePage /></UserProtectedRoute>} />
        <Route path="/dashboard/settings" element={<UserProtectedRoute><SettingsPage /></UserProtectedRoute>} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboardPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/utilisateurs"
          element={
            <AdminProtectedRoute>
              <UsersListPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <AdminProtectedRoute>
              <AdminTransactionsPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/tontines"
          element={
            <AdminProtectedRoute>
              <TontinesSupervisionPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/marchands"
          element={
            <AdminProtectedRoute>
              <MerchantsListPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/marchands/nouveau"
          element={
            <AdminProtectedRoute>
              <AddMerchantPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/marchands/:id"
          element={
            <AdminProtectedRoute>
              <MerchantDetailPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/kyc"
          element={
            <AdminProtectedRoute>
              <KycListPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/kyc/:id"
          element={
            <AdminProtectedRoute>
              <KycDetailPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/taux-de-change"
          element={
            <AdminProtectedRoute>
              <ExchangeRatesPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/taux-de-change/nouveau"
          element={
            <AdminProtectedRoute>
              <AddExchangeRatePage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/taux-de-change/historique"
          element={
            <AdminProtectedRoute>
              <ExchangeRateHistoryPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/taux-de-change/parametres"
          element={
            <AdminProtectedRoute>
              <ExchangeRateSettingsPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/taux-de-change/:id/modifier"
          element={
            <AdminProtectedRoute>
              <EditExchangeRatePage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/partenaires"
          element={
            <AdminProtectedRoute>
              <PartnersPage />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/deposit"
          element={
            <DepositFlowProvider>
              <InitiateDepositPage />
            </DepositFlowProvider>
          }
        />
        <Route
          path="/deposit/request-sent"
          element={
            <DepositFlowProvider>
              <RequestSentPage />
            </DepositFlowProvider>
          }
        />
        <Route
          path="/deposit/confirm"
          element={
            <DepositFlowProvider>
              <PhoneConfirmationPage />
            </DepositFlowProvider>
          }
        />
        <Route
          path="/deposit/processing"
          element={
            <DepositFlowProvider>
              <ProcessingPage />
            </DepositFlowProvider>
          }
        />
        <Route
          path="/deposit/success"
          element={
            <DepositFlowProvider>
              <DepositSuccessPage />
            </DepositFlowProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
