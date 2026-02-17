const savings = [
  { saving_id: "SAV001", member_id: "MEM001", month: "January", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-01-05" },
  { saving_id: "SAV002", member_id: "MEM002", month: "January", year: 2024, amount: 500, payment_mode: "UPI", date: "2024-01-05" },
  { saving_id: "SAV003", member_id: "MEM003", month: "January", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-01-06" },
  { saving_id: "SAV004", member_id: "MEM004", month: "January", year: 2024, amount: 500, payment_mode: "Bank Transfer", date: "2024-01-07" },
  { saving_id: "SAV005", member_id: "MEM005", month: "January", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-01-05" },
  { saving_id: "SAV006", member_id: "MEM006", month: "January", year: 2024, amount: 500, payment_mode: "UPI", date: "2024-01-08" },
  { saving_id: "SAV007", member_id: "MEM007", month: "January", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-01-05" },
  { saving_id: "SAV008", member_id: "MEM008", month: "January", year: 2024, amount: 500, payment_mode: "UPI", date: "2024-01-09" },
  { saving_id: "SAV009", member_id: "MEM009", month: "January", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-01-05" },
  { saving_id: "SAV010", member_id: "MEM010", month: "January", year: 2024, amount: 500, payment_mode: "Bank Transfer", date: "2024-01-10" },
  { saving_id: "SAV011", member_id: "MEM011", month: "January", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-01-05" },
  { saving_id: "SAV012", member_id: "MEM012", month: "January", year: 2024, amount: 500, payment_mode: "UPI", date: "2024-01-11" },
  
  { saving_id: "SAV013", member_id: "MEM001", month: "February", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-02-05" },
  { saving_id: "SAV014", member_id: "MEM002", month: "February", year: 2024, amount: 500, payment_mode: "UPI", date: "2024-02-05" },
  { saving_id: "SAV015", member_id: "MEM003", month: "February", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-02-06" },
  { saving_id: "SAV016", member_id: "MEM004", month: "February", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-02-07" },
  { saving_id: "SAV017", member_id: "MEM005", month: "February", year: 2024, amount: 500, payment_mode: "UPI", date: "2024-02-05" },
  { saving_id: "SAV018", member_id: "MEM006", month: "February", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-02-08" },
  { saving_id: "SAV019", member_id: "MEM007", month: "February", year: 2024, amount: 600, payment_mode: "Cash", date: "2024-02-05" },
  { saving_id: "SAV020", member_id: "MEM008", month: "February", year: 2024, amount: 500, payment_mode: "UPI", date: "2024-02-09" },
  { saving_id: "SAV021", member_id: "MEM009", month: "February", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-02-05" },
  { saving_id: "SAV022", member_id: "MEM010", month: "February", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-02-10" },
  { saving_id: "SAV023", member_id: "MEM011", month: "February", year: 2024, amount: 500, payment_mode: "UPI", date: "2024-02-05" },
  { saving_id: "SAV024", member_id: "MEM012", month: "February", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-02-11" },

  { saving_id: "SAV025", member_id: "MEM001", month: "March", year: 2024, amount: 500, payment_mode: "UPI", date: "2024-03-05" },
  { saving_id: "SAV026", member_id: "MEM002", month: "March", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-03-05" },
  { saving_id: "SAV027", member_id: "MEM003", month: "March", year: 2024, amount: 600, payment_mode: "Cash", date: "2024-03-06" },
  { saving_id: "SAV028", member_id: "MEM004", month: "March", year: 2024, amount: 500, payment_mode: "UPI", date: "2024-03-07" },
  { saving_id: "SAV029", member_id: "MEM005", month: "March", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-03-05" },
  { saving_id: "SAV030", member_id: "MEM006", month: "March", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-03-08" },
  { saving_id: "SAV031", member_id: "MEM007", month: "March", year: 2024, amount: 500, payment_mode: "UPI", date: "2024-03-05" },
  { saving_id: "SAV032", member_id: "MEM008", month: "March", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-03-09" },
  { saving_id: "SAV033", member_id: "MEM009", month: "March", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-03-05" },
  { saving_id: "SAV034", member_id: "MEM010", month: "March", year: 2024, amount: 500, payment_mode: "UPI", date: "2024-03-10" },
  { saving_id: "SAV035", member_id: "MEM011", month: "March", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-03-05" },
  { saving_id: "SAV036", member_id: "MEM012", month: "March", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-03-11" },

  { saving_id: "SAV037", member_id: "MEM001", month: "April", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-04-05" },
  { saving_id: "SAV038", member_id: "MEM002", month: "April", year: 2024, amount: 600, payment_mode: "UPI", date: "2024-04-05" },
  { saving_id: "SAV039", member_id: "MEM003", month: "April", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-04-06" },
  { saving_id: "SAV040", member_id: "MEM004", month: "April", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-04-07" },
  { saving_id: "SAV041", member_id: "MEM005", month: "April", year: 2024, amount: 500, payment_mode: "UPI", date: "2024-04-05" },
  { saving_id: "SAV042", member_id: "MEM006", month: "April", year: 2024, amount: 500, payment_mode: "Cash", date: "2024-04-08" },
];

// Helper functions
const getSavingsByMember = (memberId) => {
  return savings.filter(s => s.member_id === memberId);
};

const getTotalSavings = () => {
  return savings.reduce((sum, s) => sum + s.amount, 0);
};

const getMemberTotalSavings = (memberId) => {
  return savings.filter(s => s.member_id === memberId).reduce((sum, s) => sum + s.amount, 0);
};

export { savings, getSavingsByMember, getTotalSavings, getMemberTotalSavings };
