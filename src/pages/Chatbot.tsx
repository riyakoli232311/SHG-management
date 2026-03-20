/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Trash2, Loader2, ChevronDown, Wrench, User, Bot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { shgApi } from "@/lib/api";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const LANGUAGES = [
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "hi", label: "हिंदी",    flag: "🇮🇳" },
  { code: "mr", label: "मराठी",    flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்",    flag: "🇮🇳" },
  { code: "te", label: "తెలుగు",   flag: "🇮🇳" },
  { code: "kn", label: "ಕನ್ನಡ",    flag: "🇮🇳" },
  { code: "bn", label: "বাংলা",    flag: "🇮🇳" },
];

const SUGGESTED_QUESTIONS = [
  "What are our total savings this year?",
  "Which members have overdue EMIs?",
  "Show me all active loans",
  "How many members do we have?",
  "Who paid savings this month?",
  "What government schemes are available for us?",
  "What is a loan?",
  "How is EMI calculated?",
];

// ── Markdown renderer ─────────────────────────────────────────
function MessageContent({ content }: { content: string }) {
  if (!content) return null;
  const lines = content.split("\n");
  return (
    <div className="space-y-1 leading-relaxed">
      {lines.map((line, i) => {
        const rendered = line
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/`(.*?)`/g, "<code class='bg-gray-100 px-1 rounded text-xs font-mono'>$1</code>");
        if (/^\s*[-•]\s/.test(line)) {
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-1 text-[#C2185B] shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: rendered.replace(/^\s*[-•]\s/, "") }} />
            </div>
          );
        }
        if (/^\s*\d+\.\s/.test(line)) {
          const num = line.match(/^\s*(\d+)\./)?.[1];
          return (
            <div key={i} className="flex gap-2">
              <span className="text-[#C2185B] font-semibold min-w-[1.2rem] shrink-0">{num}.</span>
              <span dangerouslySetInnerHTML={{ __html: rendered.replace(/^\s*\d+\.\s/, "") }} />
            </div>
          );
        }
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: rendered }} />;
      })}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function Chatbot() {
  const { user } = useAuth();
  const [shg, setShg]             = useState<any>(null);
  const [language, setLanguage]   = useState(LANGUAGES[0]);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toolActivity, setToolActivity] = useState<string | null>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    shgApi.get().then((res: any) => setShg(res.data || res)).catch(() => {});
  }, []);

  // Welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Namaste **${user.name}**! 🙏 I'm Sakhi, your AI assistant for **${shg?.name || "your SHG"}**.\n\nI can look up your members, savings, loans, repayments, and meetings. I can also record new entries and answer general questions about finance and SHGs.\n\nHow can I help you today?`,
      }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, shg]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, toolActivity]);

  // ── Send message ──────────────────────────────────────────────
  async function sendMessage(text?: string) {
    const userText = (text || input).trim();
    if (!userText || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setToolActivity("Thinking…");

    try {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          language: language.code,
          shgName: shg?.name || "",
          userName: user?.name || "",
          userRole: "leader",
        }),
      });

      // Parse JSON safely
      let data: any = {};
      try {
        data = await response.json();
      } catch {
        throw new Error("Server returned an invalid response. Please try again.");
      }

      // Handle rate limit (429)
      if (response.status === 429) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `⏳ ${data.error || "The AI is busy right now. Please wait 10–15 seconds and try again."}`,
        }]);
        return;
      }

      // Handle other HTTP errors
      if (!response.ok) {
        throw new Error(data.error || `Server error ${response.status}. Please try again.`);
      }

      // Handle success=false in body
      if (!data.success) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      // Handle missing reply
      const reply = data.reply;
      if (!reply || typeof reply !== "string" || reply.trim() === "") {
        throw new Error("The assistant didn't return a response. Please try again.");
      }

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);

    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `⚠️ ${err.message || "Something went wrong. Please try again."}`,
      }]);
    } finally {
      setIsLoading(false);
      setToolActivity(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function clearChat() {
    setMessages([{
      role: "assistant",
      content: `Chat cleared! I'm still here, **${user?.name}**. What would you like to know?`,
    }]);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] bg-clip-text text-transparent">
                Sakhi AI Assistant
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs text-muted-foreground">
                  Live SHG data · {shg?.name || "Loading…"}
                </p>
              </div>
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
                {LANGUAGES.map(lang => (
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

        {/* ── Messages ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-[#C2185B] to-[#9C1551] text-white rounded-tr-sm"
                  : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
              }`}>
                {msg.role === "assistant"
                  ? <MessageContent content={msg.content} />
                  : <p>{msg.content}</p>
                }
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {toolActivity?.includes("tool") || toolActivity?.includes("Fetching")
                    ? <Wrench className="w-3.5 h-3.5 text-[#C2185B] animate-pulse" />
                    : <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C2185B]" />
                  }
                  <span>{toolActivity || "Thinking…"}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Suggested questions ───────────────────────────────── */}
        {messages.length <= 1 && !isLoading && (
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-[#C2185B]/30 text-[#C2185B] bg-[#C2185B]/5 hover:bg-[#C2185B]/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* ── Input ─────────────────────────────────────────────── */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Sakhi anything about your SHG…"
            disabled={isLoading}
            className="flex-1 rounded-xl border-gray-200 focus-visible:ring-[#C2185B]/30 text-sm"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] hover:opacity-90 text-white rounded-xl px-4 shrink-0"
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </Button>
        </div>

      </div>
    </DashboardLayout>
  );
}