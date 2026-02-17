const repayments = [
  { repayment_id: "REP001", loan_id: "LOAN004", due_date: "2023-10-01", payment_date: "2023-10-01", amount_paid: 864, remaining_balance: 0, penalty: 0, status: "Paid" },
  { repayment_id: "REP002", loan_id: "LOAN004", due_date: "2023-11-01", payment_date: "2023-11-01", amount_paid: 864, remaining_balance: 0, penalty: 0, status: "Paid" },
  { repayment_id: "REP003", loan_id: "LOAN004", due_date: "2023-12-01", payment_date: "2023-12-01", amount_paid: 864, remaining_balance: 0, penalty: 0, status: "Paid" },
  { repayment_id: "REP004", loan_id: "LOAN004", due_date: "2024-01-01", payment_date: "2024-01-01", amount_paid: 864, remaining_balance: 0, penalty: 0, status: "Paid" },
  { repayment_id: "REP005", loan_id: "LOAN004", due_date: "2024-02-01", payment_date: "2024-02-01", amount_paid: 864, remaining_balance: 0, penalty: 0, status: "Paid" },
  { repayment_id: "REP006", loan_id: "LOAN004", due_date: "2024-03-01", payment_date: "2024-03-01", amount_paid: 864, remaining_balance: 0, penalty: 0, status: "Paid" },
  
  { repayment_id: "REP007", loan_id: "LOAN007", due_date: "2023-10-01", payment_date: "2023-10-01", amount_paid: 787, remaining_balance: 0, penalty: 0, status: "Paid" },
  { repayment_id: "REP008", loan_id: "LOAN007", due_date: "2023-11-01", payment_date: "2023-11-01", amount_paid: 787, remaining_balance: 0, penalty: 0, status: "Paid" },
  { repayment_id: "REP009", loan_id: "LOAN007", due_date: "2023-12-01", payment_date: "2023-12-01", amount_paid: 787, remaining_balance: 0, penalty: 0, status: "Paid" },
  { repayment_id: "REP010", loan_id: "LOAN007", due_date: "2024-01-01", payment_date: "2024-01-01", amount_paid: 787, remaining_balance: 0, penalty: 0, status: "Paid" },
  { repayment_id: "REP011", loan_id: "LOAN007", due_date: "2024-02-01", payment_date: "2024-02-01", amount_paid: 787, remaining_balance: 0, penalty: 0, status: "Paid" },
  { repayment_id: "REP012", loan_id: "LOAN007", due_date: "2024-03-01", payment_date: "2024-03-01", amount_paid: 787, remaining_balance: 0, penalty: 0, status: "Paid" },
  { repayment_id: "REP013", loan_id: "LOAN007", due_date: "2024-04-01", payment_date: "2024-04-01", amount_paid: 787, remaining_balance: 0, penalty: 0, status: "Paid" },
  { repayment_id: "REP014", loan_id: "LOAN007", due_date: "2024-05-01", payment_date: "2024-05-01", amount_paid: 787, remaining_balance: 0, penalty: 0, status: "Paid" },
  
  { repayment_id: "REP015", loan_id: "LOAN001", due_date: "2024-02-01", payment_date: "2024-02-01", amount_paid: 889, remaining_balance: 7112, penalty: 0, status: "Paid" },
  { repayment_id: "REP016", loan_id: "LOAN001", due_date: "2024-03-01", payment_date: "2024-03-01", amount_paid: 889, remaining_balance: 6223, penalty: 0, status: "Paid" },
  { repayment_id: "REP017", loan_id: "LOAN001", due_date: "2024-04-01", payment_date: "2024-04-01", amount_paid: 889, remaining_balance: 5334, penalty: 0, status: "Paid" },
  { repayment_id: "REP018", loan_id: "LOAN001", due_date: "2024-05-01", payment_date: null, amount_paid: 0, remaining_balance: 5334, penalty: 0, status: "Pending" },
  { repayment_id: "REP019", loan_id: "LOAN001", due_date: "2024-06-01", payment_date: null, amount_paid: 0, remaining_balance: 6223, penalty: 0, status: "Pending" },
  
  { repayment_id: "REP020", loan_id: "LOAN002", due_date: "2024-02-01", payment_date: "2024-02-01", amount_paid: 917, remaining_balance: 13833, penalty: 0, status: "Paid" },
  { repayment_id: "REP021", loan_id: "LOAN002", due_date: "2024-03-01", payment_date: "2024-03-01", amount_paid: 917, remaining_balance: 12916, penalty: 0, status: "Paid" },
  { repayment_id: "REP022", loan_id: "LOAN002", due_date: "2024-04-01", payment_date: "2024-04-01", amount_paid: 917, remaining_balance: 11999, penalty: 0, status: "Paid" },
  { repayment_id: "REP023", loan_id: "LOAN002", due_date: "2024-05-01", payment_date: null, amount_paid: 0, remaining_balance: 11999, penalty: 0, status: "Pending" },
  
  { repayment_id: "REP024", loan_id: "LOAN003", due_date: "2024-03-01", payment_date: "2024-03-01", amount_paid: 840, remaining_balance: 5880, penalty: 0, status: "Paid" },
  { repayment_id: "REP025", loan_id: "LOAN003", due_date: "2024-04-01", payment_date: "2024-04-01", amount_paid: 840, remaining_balance: 5040, penalty: 0, status: "Paid" },
  { repayment_id: "REP026", loan_id: "LOAN003", due_date: "2024-05-01", payment_date: "2024-05-01", amount_paid: 840, remaining_balance: 4200, penalty: 0, status: "Paid" },
  { repayment_id: "REP027", loan_id: "LOAN003", due_date: "2024-06-01", payment_date: null, amount_paid: 0, remaining_balance: 4200, penalty: 0, status: "Pending" },
];

// Helper functions
const getTotalCollected = () => {
  return repayments
    .filter(r => r.status === "Paid")
    .reduce((sum, r) => sum + r.amount_paid, 0);
};

const getOverdueRepayments = () => {
  return repayments.filter(r => r.status === "Overdue");
};

const getPendingRepayments = () => {
  return repayments.filter(r => r.status === "Pending");
};

const getRepaymentsByLoan = (loanId) => {
  return repayments.filter(r => r.loan_id === loanId);
};

export { 
  repayments, 
  getTotalCollected, 
  getOverdueRepayments, 
  getPendingRepayments,
  getRepaymentsByLoan 
};
