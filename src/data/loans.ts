export interface Loan {
  loan_id: string;
  member_id: string;
  loan_amount: number;
  interest_rate: number;
  tenure: number; // in months
  emi: number;
  purpose: string;
  start_date: string;
  status: 'Active' | 'Completed' | 'Defaulted';
  total_paid: number;
}

export const loans: Loan[] = [
  {
    loan_id: "LOAN001",
    member_id: "MEM001",
    loan_amount: 10000,
    interest_rate: 12,
    tenure: 12,
    emi: 889,
    purpose: "Small Business - Tailoring",
    start_date: "2024-01-15",
    status: "Active",
    total_paid: 3556
  },
  {
    loan_id: "LOAN002",
    member_id: "MEM003",
    loan_amount: 15000,
    interest_rate: 12,
    tenure: 18,
    emi: 917,
    purpose: "Dairy Farming",
    start_date: "2024-01-20",
    status: "Active",
    total_paid: 3668
  },
  {
    loan_id: "LOAN003",
    member_id: "MEM005",
    loan_amount: 8000,
    interest_rate: 10,
    tenure: 10,
    emi: 840,
    purpose: "Vegetable Trading",
    start_date: "2024-02-01",
    status: "Active",
    total_paid: 2520
  },
  {
    loan_id: "LOAN004",
    member_id: "MEM007",
    loan_amount: 5000,
    interest_rate: 12,
    tenure: 6,
    emi: 864,
    purpose: "Child Education",
    start_date: "2023-09-01",
    status: "Completed",
    total_paid: 5184
  },
  {
    loan_id: "LOAN005",
    member_id: "MEM008",
    loan_amount: 20000,
    interest_rate: 12,
    tenure: 24,
    emi: 942,
    purpose: "Poultry Farm",
    start_date: "2024-02-15",
    status: "Active",
    total_paid: 2826
  },
  {
    loan_id: "LOAN006",
    member_id: "MEM010",
    loan_amount: 12000,
    interest_rate: 11,
    tenure: 12,
    emi: 1060,
    purpose: "Pickle Making Business",
    start_date: "2024-03-01",
    status: "Active",
    total_paid: 2120
  },
  {
    loan_id: "LOAN007",
    member_id: "MEM002",
    loan_amount: 6000,
    interest_rate: 12,
    tenure: 8,
    emi: 787,
    purpose: "Medical Emergency",
    start_date: "2023-10-01",
    status: "Completed",
    total_paid: 6296
  },
  {
    loan_id: "LOAN008",
    member_id: "MEM011",
    loan_amount: 25000,
    interest_rate: 10,
    tenure: 24,
    emi: 1155,
    purpose: "Handicraft Business",
    start_date: "2024-01-01",
    status: "Active",
    total_paid: 4620
  }
];

// Helper to calculate EMI
export const calculateEMI = (principal: number, rate: number, tenure: number): number => {
  const monthlyRate = rate / 12 / 100;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi);
};

// Helper to get loans by member
export const getLoansByMember = (memberId: string): Loan[] => {
  return loans.filter(l => l.member_id === memberId);
};

// Helper to get active loans
export const getActiveLoans = (): Loan[] => {
  return loans.filter(l => l.status === 'Active');
};

// Helper to get total disbursed
export const getTotalDisbursed = (): number => {
  return loans.reduce((sum, l) => sum + l.loan_amount, 0);
};

// Helper to get repayment percentage
export const getRepaymentPercentage = (loan: Loan): number => {
  const totalDue = loan.emi * loan.tenure;
  return Math.round((loan.total_paid / totalDue) * 100);
};
