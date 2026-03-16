import { members } from '../data/members.js';
import { savings, getTotalSavings, getMemberTotalSavings } from '../data/savings.js';
import { loans, getActiveLoans, getTotalDisbursed, getLoansByMember, getRepaymentPercentage } from '../data/loans.js';
import { repayments, getTotalCollected, getOverdueRepayments, getPendingRepayments } from '../data/repayments.js';

/**
 * Data Service for SakhiSahyog AI Chatbot
 * Provides methods to query SHG data for context-aware responses
 */

class DataService {
  // Member Queries
  static getAllMembers() {
    return members;
  }

  static getMemberById(memberId) {
    return members.find(m => m.member_id === memberId);
  }

  static getMemberByName(name) {
    return members.filter(m => m.name.toLowerCase().includes(name.toLowerCase()));
  }

  static getMembersByVillage(village) {
    return members.filter(m => m.village.toLowerCase() === village.toLowerCase());
  }

  static getTotalMemberCount() {
    return members.length;
  }

  static getMembersCountByVillage() {
    const counts = {};
    members.forEach(m => {
      counts[m.village] = (counts[m.village] || 0) + 1;
    });
    return counts;
  }

  // Savings Queries
  static getTotalSavingsAmount() {
    return getTotalSavings();
  }

  static getMemberSavings(memberId) {
    return {
      member: this.getMemberById(memberId),
      totalSavings: getMemberTotalSavings(memberId),
      transactions: savings.filter(s => s.member_id === memberId)
    };
  }

  static getSavingsByMonth(month, year = 2024) {
    return savings.filter(s => s.month === month && s.year === year);
  }

  static getMonthlySavingsTotal(month, year = 2024) {
    return this.getSavingsByMonth(month, year).reduce((sum, s) => sum + s.amount, 0);
  }

  // Loan Queries
  static getAllLoans() {
    return loans.map(loan => ({
      ...loan,
      member: this.getMemberById(loan.member_id),
      repaymentProgress: getRepaymentPercentage(loan)
    }));
  }

  static getLoanById(loanId) {
    const loan = loans.find(l => l.loan_id === loanId);
    if (!loan) return null;
    return {
      ...loan,
      member: this.getMemberById(loan.member_id),
      repaymentProgress: getRepaymentPercentage(loan)
    };
  }

  static getMemberLoans(memberId) {
    return getLoansByMember(memberId).map(loan => ({
      ...loan,
      repaymentProgress: getRepaymentPercentage(loan)
    }));
  }

  static getActiveLoansCount() {
    return getActiveLoans().length;
  }

  static getTotalDisbursedAmount() {
    return getTotalDisbursed();
  }

  static getActiveLoansTotal() {
    return getActiveLoans().reduce((sum, l) => sum + l.loan_amount, 0);
  }

  // Repayment Queries
  static getTotalCollectedAmount() {
    return getTotalCollected();
  }

  static getOverdueRepaymentsCount() {
    return getOverdueRepayments().length;
  }

  static getPendingRepaymentsCount() {
    return getPendingRepayments().length;
  }

  static getLoanRepayments(loanId) {
    return repayments.filter(r => r.loan_id === loanId);
  }

  // Dashboard Summary
  static getDashboardSummary() {
    return {
      totalMembers: this.getTotalMemberCount(),
      totalSavings: this.getTotalSavingsAmount(),
      totalLoansDisbursed: this.getTotalDisbursedAmount(),
      totalRepaymentsCollected: this.getTotalCollectedAmount(),
      activeLoansCount: this.getActiveLoansCount(),
      overdueRepayments: this.getOverdueRepaymentsCount(),
      pendingRepayments: this.getPendingRepaymentsCount(),
      averageSavingsPerMember: Math.round(this.getTotalSavingsAmount() / this.getTotalMemberCount()),
      membersByVillage: this.getMembersCountByVillage()
    };
  }

  // Search across all data
  static search(query) {
    const results = {
      members: [],
      loans: [],
      savings: []
    };

    const lowerQuery = query.toLowerCase();

    // Search members
    results.members = members.filter(m => 
      m.name.toLowerCase().includes(lowerQuery) ||
      m.village.toLowerCase().includes(lowerQuery) ||
      m.member_id.toLowerCase().includes(lowerQuery)
    );

    // Search loans
    results.loans = loans.filter(l => 
      l.purpose.toLowerCase().includes(lowerQuery) ||
      l.loan_id.toLowerCase().includes(lowerQuery)
    );

    return results;
  }

  // Get context for AI based on user query
  static getContextForQuery(query) {
    const lowerQuery = query.toLowerCase();
    let context = {};

    // Determine what data is relevant based on query keywords
    if (lowerQuery.includes('member') || lowerQuery.includes('people') || lowerQuery.includes('sakhis')) {
      context.members = this.getAllMembers();
      context.memberCount = this.getTotalMemberCount();
    }

    if (lowerQuery.includes('saving') || lowerQuery.includes('deposit') || lowerQuery.includes('collection')) {
      context.totalSavings = this.getTotalSavingsAmount();
      context.averageSavings = Math.round(this.getTotalSavingsAmount() / this.getTotalMemberCount());
    }

    if (lowerQuery.includes('loan') || lowerQuery.includes('credit') || lowerQuery.includes('borrow')) {
      context.totalLoans = this.getTotalDisbursedAmount();
      context.activeLoans = this.getActiveLoansCount();
      context.loans = this.getAllLoans();
    }

    if (lowerQuery.includes('repayment') || lowerQuery.includes('emi') || lowerQuery.includes('payment')) {
      context.totalCollected = this.getTotalCollectedAmount();
      context.overdueCount = this.getOverdueRepaymentsCount();
      context.pendingCount = this.getPendingRepaymentsCount();
    }

    if (lowerQuery.includes('dashboard') || lowerQuery.includes('summary') || lowerQuery.includes('overview')) {
      context.dashboard = this.getDashboardSummary();
    }

    // If no specific context detected, provide summary
    if (Object.keys(context).length === 0) {
      context = { dashboard: this.getDashboardSummary() };
    }

    return context;
  }
}

export default DataService;
