/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Chatbot.tsx — Dark Theme
import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Send, Sparkles, Trash2, Loader2, ChevronDown, Wrench, User, Bot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { shgApi } from "@/lib/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface Message { role: "user" | "assistant"; content: string; }

const LANGUAGES = [
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "hi", label: "हिंदी",    flag: "🇮🇳" },
  { code: "mr", label: "मराठी",    flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்",    flag: "🇮🇳" },
  { code: "te", label: "తెలుగు",   flag: "🇮🇳" },
  { code: "kn", label: "ಕನ್ನಡ",   flag: "🇮🇳" },
  { code: "bn", label: "বাংলা",    flag: "🇮🇳" },
];

const SUGGESTED_QUESTIONS = [
  "Which members have overdue EMIs?",
  "Show me all active loans",
  "How many members do we have?",
  "Who paid savings this month?",
  "What government schemes are available?",
  "What is a loan?",
  "How is EMI calculated?",
];

function MessageContent({ content }: { content: string }) {
  if (!content) return null;
  const lines = content.split("\n");
  return (
    <div className="space-y-1 leading-relaxed">
      {lines.map((line, i) => {
        const rendered = line
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/`(.*?)`/g, "<code class='px-1 rounded text-xs font-mono' style='background:rgba(255,255,255,0.12)'>$1</code>");
        if (/^\s*[-•]\s/.test(line)) return <div key={i} className="flex gap-2"><span className="mt-1 text-[#C2185B] shrink-0">•</span><span dangerouslySetInnerHTML={{ __html: rendered.replace(/^\s*[-•]\s/, "") }} /></div>;
        if (/^\s*\d+\.\s/.test(line)) { const num = line.match(/^\s*(\d+)\./)?.[1]; return <div key={i} className="flex gap-2"><span className="text-[#C2185B] font-bold min-w-[1.2rem] shrink-0">{num}.</span><span dangerouslySetInnerHTML={{ __html: rendered.replace(/^\s*\d+\.\s/, "") }} /></div>; }
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: rendered }} />;
      })}
    </div>
  );
}

export default function Chatbot() {
  const { user } = useAuth();
  const [shg, setShg]             = useState<any>(null);
  const [language, setLanguage]   = useState(LANGUAGES[0]);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toolActivity, setToolActivity] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { shgApi.get().then((res: any) => setShg(res.data || res)).catch(() => {}); }, []);

  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([{ role: "assistant", content: `Namaste **${user.name}**! 🙏 I'm Sakhi, your AI assistant for **${shg?.name || "your SHG"}**.\n\nI can look up your members, savings, loans, repayments, and meetings. I can also record new entries and answer general questions about finance and SHGs.\n\nHow can I help you today?` }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, shg]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading, toolActivity]);

  async function sendMessage(text?: string) {
    const userText = (text || input).trim();
    if (!userText || isLoading) return;
    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages); setInput(""); setIsLoading(true); setToolActivity("Thinking…");
    try {
      const response = await fetch(`${BASE_URL}/api/chat`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: newMessages, language: language.code, shgName: shg?.name || "", userName: user?.name || "", userRole: "leader" }) });
      let data: any = {};
      try { data = await response.json(); } catch { throw new Error("Server returned an invalid response."); }
      if (response.status === 429) { setMessages(prev => [...prev, { role: "assistant", content: `⏳ ${data.error || "The AI is busy. Please wait 10–15 seconds."}` }]); return; }
      if (!response.ok) throw new Error(data.error || `Server error ${response.status}.`);
      if (!data.success) throw new Error(data.error || "Something went wrong.");
      const reply = data.reply;
      if (!reply || typeof reply !== "string" || reply.trim() === "") throw new Error("The assistant didn't return a response.");
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) { setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${err.message || "Something went wrong."}` }]); }
    finally { setIsLoading(false); setToolActivity(null); setTimeout(() => inputRef.current?.focus(), 50); }
  }

  function clearChat() { setMessages([{ role: "assistant", content: `Chat cleared! I'm still here, **${user?.name}**. What would you like to know?` }]); }
  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)", boxShadow: "0 0 20px rgba(194,24,91,0.35)" }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-[#ff6bc1] to-[#b56bff] bg-clip-text text-transparent">
                Sakhi AI Assistant
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-white/35">Live SHG data · {shg?.name || "Loading…"}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:bg-white/8"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.7)" }}>
                  {language.flag} {language.label} <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGUAGES.map(lang => (
                  <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang)} className={language.code === lang.code ? "bg-[#C2185B]/10 text-[#C2185B]" : ""}>
                    {lang.flag} {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button onClick={clearChat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:bg-white/8"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}>
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
                  style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "rounded-tr-sm text-white"
                  : "rounded-tl-sm text-white/85"
              }`}
              style={msg.role === "user"
                ? { background: "linear-gradient(135deg,#C2185B,#9C1551)" }
                : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {msg.role === "assistant" ? <MessageContent content={msg.content} /> : <p>{msg.content}</p>}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(255,255,255,0.08)" }}>
                  <User className="w-4 h-4 text-white/60" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}><Bot className="w-4 h-4 text-white" /></div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-2 text-sm text-white/40">
                  {toolActivity?.includes("tool") || toolActivity?.includes("Fetching")
                    ? <Wrench className="w-3.5 h-3.5 text-[#C2185B] animate-pulse" />
                    : <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C2185B]" />}
                  <span>{toolActivity || "Thinking…"}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && !isLoading && (
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full transition-colors font-medium"
                style={{ border: "1px solid rgba(194,24,91,0.3)", color: "#C2185B", background: "rgba(194,24,91,0.08)" }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Sakhi anything about your SHG…"
            disabled={isLoading}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white font-medium placeholder:text-white/20 outline-none transition-all disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(194,24,91,0.5)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 rounded-xl text-white font-bold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)", boxShadow: "0 0 16px rgba(194,24,91,0.3)" }}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}