// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import MemberProfile from "./pages/MemberProfile";
import Savings from "./pages/Savings";
import Loans from "./pages/Loans";
import Repayments from "./pages/Repayments";
import Reports from "./pages/Reports";
import Chatbot from "./pages/Chatbot";
import SettingsPage from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Meetings from "./pages/Meeting";
import MeetingAttendance from "./pages/MeetingAttendance";

// Member pages
import MemberLoanDashboard from "./pages/MemberLoanDashboard";
import MemberOverview from "./pages/member/MemberOverview";
import MemberRepayments from "./pages/member/MemberRepayments";
import MemberSavings from "./pages/member/MemberSavings";
import MemberSHG from "./pages/member/MemberSHG";

import LeaderLoanApproval from "./pages/LeaderLoanApproval";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminSignup from "./pages/admin/AdminSignup";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SchemePosting from "./pages/admin/SchemePosting";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/signup" element={<AdminSignup />} />
              <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="schemes" element={<SchemePosting />} />
              </Route>

              {/* Onboarding */}
              <Route
                path="/setup"
                element={
                  <ProtectedRoute requireOnboarding={false}>
                    <Setup />
                  </ProtectedRoute>
                }
              />

              {/* Leader protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
              <Route path="/members/:memberId" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
              <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
              <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
              <Route path="/leader/loans/verify" element={<ProtectedRoute><LeaderLoanApproval /></ProtectedRoute>} />
              <Route path="/repayments" element={<ProtectedRoute><Repayments /></ProtectedRoute>} />
              <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
              <Route path="/meeting-attendance" element={<ProtectedRoute><MeetingAttendance /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Member portal routes */}
              <Route path="/member/overview"    element={<ProtectedRoute><MemberOverview /></ProtectedRoute>} />
              <Route path="/member/loans"       element={<ProtectedRoute><MemberLoanDashboard /></ProtectedRoute>} />
              <Route path="/member/repayments"  element={<ProtectedRoute><MemberRepayments /></ProtectedRoute>} />
              <Route path="/member/savings"     element={<ProtectedRoute><MemberSavings /></ProtectedRoute>} />
              <Route path="/member/shg"         element={<ProtectedRoute><MemberSHG /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;