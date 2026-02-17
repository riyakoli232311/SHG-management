import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import MemberProfile from "./pages/MemberProfile";
import Savings from "./pages/Savings";
import Loans from "./pages/Loans";
import Repayments from "./pages/Repayments";
import Reports from "./pages/Reports";
import Training from "./pages/Training";
import Marketplace from "./pages/Marketplace";
import Chatbot from "./pages/Chatbot";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/:memberId" element={<MemberProfile />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/repayments" element={<Repayments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/training" element={<Training />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/chatbot" element={<Chatbot />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
