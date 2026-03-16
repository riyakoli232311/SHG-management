import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, Trash2, Loader2, ChevronDown } from "lucide-react";
import { currentUser, shgInfo } from "@/data/users";
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

const buildSystemPrompt = (langCode: string) => {
  const langInstruction =
    langCode === "en"
      ? "Always respond in English only."
      : `Always respond in ${LANGUAGES.find((l) => l.code === langCode)?.label} only. Do not mix languages.`;

  return `You are Sakhi, an AI assistant for ${shgInfo.name}, a Self Help Group (SHG) based in ${shgInfo.village}, ${shgInfo.district}, ${shgInfo.state}. You are warm, supportive, and knowledgeable about:
- SHG operations, savings, and loan management
- Microfinance and rural banking
- Women's empowerment and financial literacy
- Indian government schemes for SHGs (NRLM, DAY-NRLM, SHG-Bank linkage, etc.)
- Record keeping and accounting for SHGs

The current user is ${currentUser.name}, who is the ${currentUser.role} of the group. The group was formed on ${shgInfo.formation_date} and has a monthly savings target of ₹${shgInfo.monthly_saving} per member.

Keep responses concise, friendly, and practical. Use simple language. When discussing money, use Indian currency format (₹). ${langInstruction}`;
};

const SUGGESTED_QUESTIONS = [
  "How do I calculate interest on a group loan?",
  "What government schemes are available for SHGs?",
  "How should we maintain our meeting minutes?",
  "Explain SHG-Bank linkage programme",
];

export default function Chatbot() {
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Namaste ${currentUser.name}! 🙏 I'm Sakhi, your AI assistant for ${shgInfo.name}. I can help you with loan calculations, savings tracking, government schemes, record keeping, and more. How can I assist you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
            { role: "system", content: buildSystemPrompt(language.code) },
            ...newMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const reply =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't get a response. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ I'm having trouble connecting right now. Please check your internet connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: `Namaste ${currentUser.name}! 🙏 I'm Sakhi, your AI assistant for ${shgInfo.name}. How can I help you today?`,
      },
    ]);
  };

  return (
    <DashboardLayout noPadding>
      <div className="flex flex-col h-[calc(100vh-theme(spacing.12))] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sakhi AI Assistant</h1>
              <p className="text-xs text-muted-foreground">Your SHG companion, always here to help</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-[#C2185B]/20 hover:bg-[#C2185B]/5 gap-2 text-sm">
                  <span>{language.flag}</span>
                  <span>{language.label}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang)}
                    className={language.code === lang.code ? "bg-[#C2185B]/5 text-[#C2185B] font-medium" : ""}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-muted-foreground hover:text-red-500 hover:bg-red-50 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-[#C2185B]/10 bg-white shadow-soft p-4 space-y-4 mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
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

              {/* Bubble */}
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

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 flex-row">
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

        {/* Suggested Questions — shown only at conversation start */}
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
            placeholder="Ask Sakhi anything about your SHG..."
            className="flex-1 rounded-xl border-[#C2185B]/20 focus-visible:ring-[#C2185B]/30 bg-white"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="btn-gradient text-white border-0 rounded-xl px-4"
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