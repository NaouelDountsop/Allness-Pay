import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { BillerLookupForm } from "@/components/user_dashboard/payements/biller-lookup-form";
import { InvoiceDetails } from "@/components/user_dashboard/payements/invoice-details";

const categoryLabels: Record<string, string> = {
  electricity: "Paiement d'électricité",
  water: "Paiement d'eau",
  telecom: "Paiement télécom",
  tv: "Paiement télévision",
  education: "Paiement éducation",
  transport: "Paiement transport",
};

export default function BillPaymentPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState("");
  const [reference, setReference] = useState("");
  const [invoiceFound, setInvoiceFound] = useState(false);

  const title = categoryLabels[category ?? ""] ?? "Paiement de facture";

  const handleSearch = () => {
    if (supplier && reference) setInvoiceFound(true);
  };

  const handleConfirm = () => {
    navigate("/dashboard/payments", { state: { success: true } });
  };

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div className="max-w-4xl">
        <button
          onClick={() => navigate("/dashboard/payments")}
          className="flex items-center gap-2 text-2xl font-semibold text-afrilink-dark mb-1"
        >
          <ArrowLeft className="w-5 h-5" />
          {title}
        </button>
        <p className="text-sm text-gray-500 mb-6">
          Réglez vos factures en toute simplicité.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <BillerLookupForm
            supplier={supplier}
            reference={reference}
            onSupplierChange={setSupplier}
            onReferenceChange={setReference}
            onSearch={handleSearch}
          />

          <div className="rounded-xl border-2 border-afrilink-orange p-4 flex items-center justify-center">
            {supplier ? (
              <img
                src="/socadel.svg"
                alt={supplier}
                className="max-h-24 object-contain"
              />
            ) : (
              <p className="text-xs text-gray-400 text-center">
                Le logo du fournisseur apparaîtra ici
              </p>
            )}
          </div>
        </div>

        {invoiceFound && (
          <InvoiceDetails
            clientName="Jean Dupont"
            reference="CMD123456"
            amount={15000}
            dueDate="31/07/2026"
            serviceFee={0}
            total={442150}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
