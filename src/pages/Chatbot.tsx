import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Namaste! 🙏 I'm your SHG Assistant. I can help you with:\n\n• Understanding loan terms and EMI calculations\n• Group savings information\n• Member details and records\n• Financial guidance\n\nHow can I assist you today?",
    timestamp: new Date(),
  },
];

const mockResponses: Record<string, string> = {
  loan: "To apply for a loan, you need to:\n\n1. Be a member for at least 3 months\n2. Have regular savings contributions\n3. Submit a loan application form\n4. Get approval from the group\n\nLoans are available from ₹5,000 to ₹50,000 with interest rates of 10-12% per annum. Would you like to know more about EMI calculations?",
  emi: "EMI (Equated Monthly Installment) is calculated using this formula:\n\nEMI = P × r × (1+r)^n / ((1+r)^n - 1)\n\nWhere:\n• P = Principal loan amount\n• r = Monthly interest rate\n• n = Loan tenure in months\n\nFor example, a ₹10,000 loan at 12% interest for 12 months = ₹889/month EMI.",
  savings: "Your group's current savings status:\n\n• Total Group Savings: ₹21,200\n• Monthly Contribution: ₹500/member\n• Total Members: 12\n• Average per Member: ₹1,767\n\nRegular savings help build group funds for loans and emergencies!",
  interest: "Interest rates in our SHG:\n\n• Savings Interest: 4% per annum (credited annually)\n• Loan Interest: 10-12% per annum (reducing balance)\n\nOur rates are lower than money lenders and help the group earn income!",
  default: "I understand you're asking about SHG management. Could you please be more specific? I can help with:\n\n• Loan applications and EMI\n• Savings queries\n• Member information\n• Interest rates\n• Group meetings\n\nJust type your question!",
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      let response = mockResponses.default;

      if (lowerInput.includes("loan") || lowerInput.includes("borrow")) {
        response = mockResponses.loan;
      } else if (lowerInput.includes("emi") || lowerInput.includes("installment")) {
        response = mockResponses.emi;
      } else if (lowerInput.includes("saving") || lowerInput.includes("bachat")) {
        response = mockResponses.savings;
      } else if (lowerInput.includes("interest") || lowerInput.includes("byaj")) {
        response = mockResponses.interest;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="AI Assistant"
        description="Get help with your SHG queries"
      />

      <div className="bg-card rounded-xl border border-border flex flex-col h-[calc(100vh-220px)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === "assistant"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary"
                )}
              >
                {message.role === "assistant" ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3",
                  message.role === "assistant"
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                )}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    message.role === "assistant"
                      ? "text-muted-foreground"
                      : "text-primary-foreground/70"
                  )}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-soft"></div>
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-soft" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-soft" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question... (e.g., How to apply for a loan?)"
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Try asking about loans, savings, EMI, or interest rates
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
