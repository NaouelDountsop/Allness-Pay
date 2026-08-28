import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { CreateTontineForm } from '@/components/user_dashboard/tontines/create-tontine-form';

export default function CreateTontinePage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/dashboard/tontines')}
            className="w-10 h-10 rounded-xl bg-allness-orange/10 dark:bg-allness-orange/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-allness-orange" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-allness-dark dark:text-white">Créer une tontine</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 ml-[52px]">
          Configurez votre tontine en quelques étapes.
        </p>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-allness-dark shadow-sm p-4 sm:p-6">
          <CreateTontineForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
