// Nouveau mock au format attendu par MonthlySummary (TrendPoint[]),
// à la place de mockSpendingChart / mockSpendingBreakdown qui étaient
// prévus pour l'ancien composant SpendingChart (barres + %).

export interface TrendPoint {
  label: string;
  revenus: number;
  depenses: number;
  epargne: number;
  solde: number;
}

export const mockMonthlyTrend: TrendPoint[] = [
  { label: 'Avr', revenus: 120000, depenses: 90000, epargne: 30000, solde: 60000 },
  { label: 'Mai', revenus: 140000, depenses: 95000, epargne: 45000, solde: 85000 },
  { label: 'Juin', revenus: 155000, depenses: 100000, epargne: 55000, solde: 100000 },
  { label: 'Juil', revenus: 185000, depenses: 110000, epargne: 75000, solde: 150000 },
];

// Valeurs dérivées pour les autres props de MonthlySummary, à calculer
// côté back si possible plutôt qu'en dur ici.
export const mockMonthlySummaryHeader = {
  month: 'Juillet 2026',
  incomePercent: 62,
  expensePercent: 38,
  netAmount: 185000,
};
