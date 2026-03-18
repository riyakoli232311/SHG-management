/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickReply {
  label: string;
  query: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

const quickReplies: QuickReply[] = [
  { label: 'Total Members', query: 'How many members do we have?' },
  { label: 'Total Savings', query: 'What is our total savings?' },
  { label: 'Active Loans', query: 'How many active loans do we have?' },
  { label: 'Dashboard', query: 'Give me a dashboard overview' },
];

export function ChatBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate session ID on mount
  useEffect(() => {
    const storedSession = localStorage.getItem('sakhisahyog_chat_session');
    if (storedSession) {
      setSessionId(storedSession);
      loadConversationHistory(storedSession);
    } else {
      const newSession = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSession);
      localStorage.setItem('sakhisahyog_chat_session', newSession);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationHistory = async (sid: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history/${sid}`);
      const data = await response.json();
      
      if (data.success && data.data.history.length > 0) {
        const formattedMessages: Message[] = data.data.history.map((h: any, index: number) => ({
          id: `msg_${index}`,
          role: h.role,
          content: h.content,
          timestamp: new Date(h.timestamp)
        }));
        setMessages(formattedMessages);
        setShowQuickReplies(false);
      } else {
        addWelcomeMessage();
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      addWelcomeMessage();
    }
  };

  const addWelcomeMessage = () => {
    const userName = user?.name || 'Sakhi';
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Namaste ${userName}! 🙏\n\nI'm your SakhiSahyog AI assistant. I can help you with:\n\n• **Member & savings queries**\n• **Loan status & repayments**\n• **SHG compliance & grading**\n• **Government schemes for SHGs**\n\nWhat would you like to know?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowQuickReplies(false);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: text,
          sessionId,
          userRole: user?.role || 'leader'
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: `msg_${Date.now()}_ai`,
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await fetch(`${API_BASE_URL}/chat/clear/${sessionId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to clear chat:', error);
    }
    setMessages([]);
    setShowQuickReplies(true);
    addWelcomeMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 w-80 bg-background border border-border rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300",
      isMinimized ? "h-14" : "h-[480px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Sakhi AI</p>
            <p className="text-[10px] text-white/70">SHG Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-white/80" />
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            {isMinimized ? <ChevronUp className="w-3.5 h-3.5 text-white/80" /> : <ChevronDown className="w-3.5 h-3.5 text-white/80" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-3.5 h-3.5 text-white/80" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex gap-2", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
                >
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarFallback className={cn(
                      "text-white text-[10px]",
                      msg.role === 'user'
                        ? "bg-gradient-to-br from-[#C2185B] to-[#AD1457]"
                        : "bg-gradient-to-br from-[#6A1B9A] to-[#4A148C]"
                    )}>
                      {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3 py-2 text-xs",
                      msg.role === 'user'
                        ? "bg-gradient-to-br from-[#C2185B] to-[#AD1457] text-white rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    )}
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-[#6A1B9A] to-[#4A148C] text-white">
                      <Bot className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2">
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              {showQuickReplies && messages.length <= 1 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickReplies.map((qr) => (
                    <button
                      key={qr.label}
                      onClick={() => sendMessage(qr.query)}
                      className="text-[10px] px-2.5 py-1.5 rounded-full border border-[#C2185B]/30 text-[#C2185B] hover:bg-[#C2185B]/10 transition-colors"
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                className="text-xs h-8 rounded-xl"
                disabled={isLoading}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="h-8 w-8 p-0 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] hover:opacity-90"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}