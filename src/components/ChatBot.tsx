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
import { currentUser } from '@/data/users';

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
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Namaste ${currentUser.name}! 🙏\n\nI'm your SakhiSahyog AI assistant. I can help you with information about our SHG - members, savings, loans, repayments, and more.\n\nHow can I assist you today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowQuickReplies(false);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content.trim(),
          sessionId: sessionId,
          userRole: currentUser.role
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(data.data.timestamp)
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or check if the server is running.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleQuickReply = (query: string) => {
    sendMessage(query);
  };

  const clearConversation = async () => {
    try {
      await fetch(`${API_BASE_URL}/chat/history/${sessionId}`, {
        method: 'DELETE'
      });
      
      // Generate new session
      const newSession = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSession);
      localStorage.setItem('sakhisahyog_chat_session', newSession);
      
      setMessages([]);
      setShowQuickReplies(true);
      addWelcomeMessage();
    } catch (error) {
      console.error('Failed to clear conversation:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format message content with basic markdown-like styling
  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg btn-gradient hover:shadow-xl transition-all duration-300 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className={cn(
      "fixed right-6 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-[#C2185B]/20 overflow-hidden transition-all duration-300",
      isMinimized ? "bottom-6 w-80 h-14" : "bottom-6 w-96 h-[500px]"
    )}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Sakhi AI</h3>
            <p className="text-white/70 text-xs">Ask me anything about SHG</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-pink-50/50 to-white">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar className={cn(
                    "h-8 w-8 shrink-0",
                    message.role === 'user' 
                      ? "bg-gradient-to-br from-[#C2185B] to-[#6A1B9A]" 
                      : "bg-gradient-to-br from-[#FBC02D] to-[#F57F17]"
                  )}>
                    <AvatarFallback className="text-white text-xs">
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                    message.role === 'user'
                      ? "bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] text-white rounded-br-md"
                      : "bg-white border border-gray-100 text-gray-700 rounded-bl-md shadow-sm"
                  )}>
                    <div 
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                      className="prose prose-sm max-w-none"
                    />
                    <span className={cn(
                      "text-[10px] mt-1 block",
                      message.role === 'user' ? "text-white/60" : "text-gray-400"
                    )}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8 bg-gradient-to-br from-[#FBC02D] to-[#F57F17]">
                    <AvatarFallback className="text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#C2185B]" />
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Replies */}
          {showQuickReplies && messages.length < 3 && (
            <div className="px-4 py-2 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply.label}
                    onClick={() => handleQuickReply(reply.query)}
                    className="text-xs px-3 py-1.5 bg-pink-50 text-[#C2185B] rounded-full hover:bg-[#C2185B] hover:text-white transition-colors border border-pink-100"
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border-gray-200 focus:border-[#C2185B] focus:ring-[#C2185B]/20"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            
            {/* Clear conversation button */}
            {messages.length > 2 && (
              <button
                onClick={clearConversation}
                className="mt-2 text-xs text-gray-400 hover:text-[#C2185B] flex items-center gap-1 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Clear conversation
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ChatBot;
