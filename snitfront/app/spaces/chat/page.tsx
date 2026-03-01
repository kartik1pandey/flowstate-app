'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import { Send, Bot, User, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: any[];
}

export default function AIChat() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-sync on mount (silently in background)
  useEffect(() => {
    if (isAuthenticated && user) {
      syncUserData();
    }
  }, [isAuthenticated, user]);

  const syncUserData = async () => {
    setSyncStatus('syncing');
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.post(
        `${API_URL}/api/rag/sync`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLastSync(new Date().toLocaleTimeString());
      setSyncStatus('synced');
      console.log('✅ Data synced to RAG:', response.data);
    } catch (error: any) {
      console.error('Sync error:', error);
      setSyncStatus('error');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please sign in.');
      }
      
      // Try RAG service first
      try {
        const response = await axios.post(
          `${API_URL}/api/rag/ask`,
          { question: input },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000
          }
        );

        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.answer,
          timestamp: new Date(),
          context: response.data.context,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        
        // Auto-sync after successful answer to keep data fresh
        syncUserData();
        return;
      } catch (ragError: any) {
        console.log('RAG service unavailable, using fallback mode...');
        
        // Fallback: Use analytics API to answer basic questions
        const question = input.toLowerCase();
        
        if (question.includes('focus score') || question.includes('average focus')) {
          try {
            const analyticsResponse = await axios.get(
              `${API_URL}/api/analytics/overview`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            
            const avgFocus = analyticsResponse.data.averageFocusScore || 0;
            const assistantMessage: Message = {
              role: 'assistant',
              content: `Based on your sessions, your average focus score is ${avgFocus.toFixed(1)} out of 100. ${avgFocus >= 80 ? 'Excellent work! 🎯' : avgFocus >= 60 ? 'Good job! Keep it up! 💪' : 'There\'s room for improvement. Try reducing distractions. 📈'}\n\n💡 Note: I'm using basic analytics mode. For more detailed AI insights, the RAG service needs to be running.`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            return;
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
          }
        }
        
        // If can't answer with fallback, show helpful message
        const helpMessage: Message = {
          role: 'assistant',
          content: `I can answer basic questions using analytics data, but for detailed AI-powered insights, the RAG service needs to be running.\n\n**Questions I can answer now:**\n- "What's my average focus score?"\n- "Show me my focus score"\n\n**To enable full AI capabilities:**\n1. Start RAG service: \`start-rag-service.ps1\`\n2. Wait 10 seconds\n3. Ask any question about your productivity!`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, helpMessage]);
        return;
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      let errorMsg = 'Sorry, I encountered an error. ';
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        errorMsg = '❌ Cannot connect to backend. Please ensure the backend server is running.';
      } else if (error.response?.status === 401) {
        errorMsg = '❌ Session expired. Please sign in again.';
        // Redirect to login
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else {
        errorMsg += error.message || 'Please try again.';
      }
      
      const errorMessage: Message = {
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "What's my average focus score?",
    "Which programming language do I use most?",
    "How many coding sessions have I completed?",
    "What are my productivity patterns?",
    "Am I at risk of burnout?",
    "What's my total coding time?",
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">AI Productivity Assistant</h1>
                <p className="text-gray-600">Ask questions about your coding sessions and productivity</p>
              </div>
            </div>
            
            {/* Sync Status Indicator */}
            <div className="flex items-center gap-2">
              {syncStatus === 'syncing' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing...</span>
                </div>
              )}
              {syncStatus === 'synced' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Synced {lastSync && `at ${lastSync}`}</span>
                </div>
              )}
              {syncStatus === 'error' && (
                <button
                  onClick={syncUserData}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Sync</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Start a conversation</h3>
                <p className="text-gray-600 mb-6">Ask me anything about your productivity and coding sessions</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(question)}
                      className="p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-sm text-gray-700"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your productivity..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
