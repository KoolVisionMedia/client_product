import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi there! I'm the HomeFront Builders virtual assistant. How can I help you today? Whether you have questions about our custom home process, floor plans, or available lots, I'm here to answer them." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error connecting to my server. Please try again later or reach out to us via the contact form!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#1b2518] hover:bg-[#c9a96e] transition-colors duration-300 rounded-full shadow-2xl flex items-center justify-center z-50 text-white"
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-[#1b2518] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
                <img src="/logo-round.png" alt="Homefront Builders Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-white font-serif text-lg leading-tight">HomeFront Assistant</h3>
                <p className="text-[#c9a96e] text-[10px] font-sans tracking-widest uppercase">Online</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4F3F0]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mr-2 mt-1 shadow-sm">
                      <img src="/logo-round.png" alt="HFB" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-sm font-sans leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#c9a96e] text-[#1b2518] rounded-tr-sm'
                        : 'bg-white text-primary rounded-tl-sm border border-gray-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 ml-2 mt-1 shadow-sm">
                      <User size={12} className="text-gray-500" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mr-2 mt-1 shadow-sm">
                    <img src="/logo-round.png" alt="HFB" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm border border-gray-100 p-3 shadow-sm flex items-center gap-1.5 h-[44px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-end gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about our custom homes..."
                className="flex-1 bg-[#F4F3F0] rounded-xl px-4 py-3 text-sm font-sans text-primary focus:outline-none focus:ring-1 focus:ring-[#c9a96e] transition-shadow placeholder:text-primary/40"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 rounded-xl bg-[#1b2518] flex items-center justify-center text-white shrink-0 hover:bg-[#c9a96e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
