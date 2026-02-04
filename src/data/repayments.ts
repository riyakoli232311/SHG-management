export interface Repayment {
  repayment_id: string;
  loan_id: string;
  due_date: string;
  payment_date: string | null;
  amount_paid: number;
  remaining_balance: number;
  penalty: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export const repayments: Repayment[] = [
  // LOAN001 repayments
  { repayment_id: "REP001", loan_id: "LOAN001", due_date: "2024-02-15", payment_date: "2024-02-14", amount_paid: 889, remaining_balance: 9111, penalty: 0, status: "Paid" },
  { repayment_id: "REP002", loan_id: "LOAN001", due_date: "2024-03-15", payment_date: "2024-03-15", amount_paid: 889, remaining_balance: 8222, penalty: 0, status: "Paid" },
  { repayment_id: "REP003", loan_id: "LOAN001", due_date: "2024-04-15", payment_date: "2024-04-16", amount_paid: 889, remaining_balance: 7333, penalty: 0, status: "Paid" },
  { repayment_id: "REP004", loan_id: "LOAN001", due_date: "2024-05-15", payment_date: "2024-05-14", amount_paid: 889, remaining_balance: 6444, penalty: 0, status: "Paid" },
  { repayment_id: "REP005", loan_id: "LOAN001", due_date: "2024-06-15", payment_date: null, amount_paid: 0, remaining_balance: 6444, penalty: 0, status: "Pending" },
  
  // LOAN002 repayments
  { repayment_id: "REP006", loan_id: "LOAN002", due_date: "2024-02-20", payment_date: "2024-02-20", amount_paid: 917, remaining_balance: 14083, penalty: 0, status: "Paid" },
  { repayment_id: "REP007", loan_id: "LOAN002", due_date: "2024-03-20", payment_date: "2024-03-22", amount_paid: 917, remaining_balance: 13166, penalty: 20, status: "Paid" },
  { repayment_id: "REP008", loan_id: "LOAN002", due_date: "2024-04-20", payment_date: "2024-04-19", amount_paid: 917, remaining_balance: 12249, penalty: 0, status: "Paid" },
  { repayment_id: "REP009", loan_id: "LOAN002", due_date: "2024-05-20", payment_date: "2024-05-20", amount_paid: 917, remaining_balance: 11332, penalty: 0, status: "Paid" },
  { repayment_id: "REP010", loan_id: "LOAN002", due_date: "2024-06-20", payment_date: null, amount_paid: 0, remaining_balance: 11332, penalty: 0, status: "Pending" },

  // LOAN003 repayments
  { repayment_id: "REP011", loan_id: "LOAN003", due_date: "2024-03-01", payment_date: "2024-03-01", amount_paid: 840, remaining_balance: 7160, penalty: 0, status: "Paid" },
  { repayment_id: "REP012", loan_id: "LOAN003", due_date: "2024-04-01", payment_date: "2024-04-01", amount_paid: 840, remaining_balance: 6320, penalty: 0, status: "Paid" },
  { repayment_id: "REP013", loan_id: "LOAN003", due_date: "2024-05-01", payment_date: "2024-05-02", amount_paid: 840, remaining_balance: 5480, penalty: 0, status: "Paid" },
  { repayment_id: "REP014", loan_id: "LOAN003", due_date: "2024-06-01", payment_date: null, amount_paid: 0, remaining_balance: 5480, penalty: 50, status: "Overdue" },

  // LOAN005 repayments
  { repayment_id: "REP015", loan_id: "LOAN005", due_date: "2024-03-15", payment_date: "2024-03-14", amount_paid: 942, remaining_balance: 19058, penalty: 0, status: "Paid" },
  { repayment_id: "REP016", loan_id: "LOAN005", due_date: "2024-04-15", payment_date: "2024-04-15", amount_paid: 942, remaining_balance: 18116, penalty: 0, status: "Paid" },
  { repayment_id: "REP017", loan_id: "LOAN005", due_date: "2024-05-15", payment_date: "2024-05-16", amount_paid: 942, remaining_balance: 17174, penalty: 0, status: "Paid" },
  { repayment_id: "REP018", loan_id: "LOAN005", due_date: "2024-06-15", payment_date: null, amount_paid: 0, remaining_balance: 17174, penalty: 0, status: "Pending" },

  // LOAN006 repayments
  { repayment_id: "REP019", loan_id: "LOAN006", due_date: "2024-04-01", payment_date: "2024-04-01", amount_paid: 1060, remaining_balance: 10940, penalty: 0, status: "Paid" },
  { repayment_id: "REP020", loan_id: "LOAN006", due_date: "2024-05-01", payment_date: "2024-05-01", amount_paid: 1060, remaining_balance: 9880, penalty: 0, status: "Paid" },
  { repayment_id: "REP021", loan_id: "LOAN006", due_date: "2024-06-01", payment_date: null, amount_paid: 0, remaining_balance: 9880, penalty: 75, status: "Overdue" },

  // LOAN008 repayments
  { repayment_id: "REP022", loan_id: "LOAN008", due_date: "2024-02-01", payment_date: "2024-02-01", amount_paid: 1155, remaining_balance: 23845, penalty: 0, status: "Paid" },
  { repayment_id: "REP023", loan_id: "LOAN008", due_date: "2024-03-01", payment_date: "2024-03-01", amount_paid: 1155, remaining_balance: 22690, penalty: 0, status: "Paid" },
  { repayment_id: "REP024", loan_id: "LOAN008", due_date: "2024-04-01", payment_date: "2024-04-02", amount_paid: 1155, remaining_balance: 21535, penalty: 0, status: "Paid" },
  { repayment_id: "REP025", loan_id: "LOAN008", due_date: "2024-05-01", payment_date: "2024-05-01", amount_paid: 1155, remaining_balance: 20380, penalty: 0, status: "Paid" },
  { repayment_id: "REP026", loan_id: "LOAN008", due_date: "2024-06-01", payment_date: null, amount_paid: 0, remaining_balance: 20380, penalty: 0, status: "Pending" },
];

// Helper to get repayments by loan
export const getRepaymentsByLoan = (loanId: string): Repayment[] => {
  return repayments.filter(r => r.loan_id === loanId);
};

// Helper to get overdue repayments
export const getOverdueRepayments = (): Repayment[] => {
  return repayments.filter(r => r.status === 'Overdue');
};

// Helper to get pending repayments
export const getPendingRepayments = (): Repayment[] => {
  return repayments.filter(r => r.status === 'Pending');
};

// Helper to get total collected
export const getTotalCollected = (): number => {
  return repayments.filter(r => r.status === 'Paid').reduce((sum, r) => sum + r.amount_paid, 0);
};
