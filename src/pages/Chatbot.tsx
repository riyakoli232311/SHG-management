/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, Trash2, Loader2, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { shgApi } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳" },
  { code: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "bn", label: "বাংলা", flag: "🇮🇳" },
];

const buildSystemPrompt = (langCode: string, shg: any, userName: string, userRole: string) => {
  const langInstruction =
    langCode === "en"
      ? "Always respond in English only."
      : `Always respond in ${LANGUAGES.find((l) => l.code === langCode)?.label} only. Do not mix languages.`;

  const shgName = shg?.name || "your SHG";
  const location = [shg?.village, shg?.district, shg?.state].filter(Boolean).join(", ");

  return `You are Sakhi, an AI assistant for ${shgName}, a Self Help Group (SHG)${location ? ` based in ${location}` : ""}. You are warm, supportive, and knowledgeable about:
- SHG operations, savings, and loan management
- Microfinance and rural banking
- Women's empowerment and financial literacy
- Indian government schemes for SHGs (NRLM, DAY-NRLM, SHG-Bank linkage, etc.)
- Record keeping and accounting for SHGs

The current user is ${userName}, who is the ${userRole} of the group.${shg?.formation_date ? ` The group was formed on ${shg.formation_date}.` : ""}

Keep responses concise, friendly, and practical. Use simple language. When discussing money, use Indian currency format (₹). ${langInstruction}`;
};

const SUGGESTED_QUESTIONS = [
  "How do I calculate interest on a group loan?",
  "What government schemes are available for SHGs?",
  "How should we maintain our meeting minutes?",
  "Explain SHG-Bank linkage programme",
];

export default function Chatbot() {
  const { user } = useAuth();
  const [shg, setShg] = useState<any>(null);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    shgApi.get()
      .then((res) => setShg(res.data || res))
      .catch(() => {});
  }, []);

  // Set welcome message once user is available
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Namaste ${user.name}! 🙏 I'm Sakhi, your AI assistant for ${shg?.name || "your SHG"}. I can help you with loan calculations, savings tracking, government schemes, record keeping, and more. How can I assist you today?`,
      }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Update SHG name in welcome message once SHG data loads (only if still on welcome)
  useEffect(() => {
    if (shg && user && messages.length === 1 && messages[0].role === "assistant") {
      setMessages([{
        role: "assistant",
        content: `Namaste ${user.name}! 🙏 I'm Sakhi, your AI assistant for ${shg.name}. I can help you with loan calculations, savings tracking, government schemes, record keeping, and more. How can I assist you today?`,
      }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shg]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userText = text || input.trim();
    if (!userText || isLoading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: buildSystemPrompt(
                language.code,
                shg,
                user?.name || "Leader",
                user?.role || "leader"
              ),
            },
            ...newMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const reply =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't get a response. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ I'm having trouble connecting right now. Please check your internet connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: `Namaste ${user?.name}! 🙏 I'm Sakhi, your AI assistant for ${shg?.name || "your SHG"}. How can I assist you today?`,
    }]);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] bg-clip-text text-transparent">
                Sakhi AI Assistant
              </h1>
              <p className="text-xs text-muted-foreground">
                Powered by Groq · {shg?.name || "SHG Assistant"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  {language.flag} {language.label} <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang)}
                    className={language.code === lang.code ? "bg-[#C2185B]/10 text-[#C2185B]" : ""}
                  >
                    {lang.flag} {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" onClick={clearChat} className="h-8 gap-1.5 text-xs">
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-[#C2185B] to-[#AD1457]"
                    : "bg-gradient-to-br from-[#6A1B9A] to-[#4A148C]"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-[#C2185B] to-[#AD1457] text-white rounded-tr-sm"
                    : "bg-[#C2185B]/5 text-foreground rounded-tl-sm border border-[#C2185B]/10"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-[#6A1B9A] to-[#4A148C] flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[#C2185B]/5 border border-[#C2185B]/10 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#C2185B]/40 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-[#C2185B]/40 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-[#C2185B]/40 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggested questions — only at start */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-[#C2185B]/20 bg-white hover:bg-[#C2185B]/5 text-[#C2185B] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="flex gap-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={`Ask Sakhi anything… (${language.label})`}
            className="flex-1 rounded-xl border-[#C2185B]/20 focus-visible:ring-[#C2185B]/30 bg-white"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] text-white border-0 rounded-xl px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}