import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

interface Message {
  role: "user" | "bot";
  text: string;
}

const WHATSAPP_URL = "https://wa.me/919999999999?text=Hi%20Bhoomi%2C%20I%20would%20like%20to%20place%20an%20order.";

function getAIResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.match(/menu|items|food|dishes|what.*serve|eat/)) {
    return "We serve authentic South Indian delicacies: Masala Dosa, Idly Sambar, Vada, Pongal, Upma, Rava Dosa, Filter Coffee, and much more. Visit our Menu page to see the full selection with prices!";
  }
  if (q.match(/hour|time|open|close|timing/)) {
    return "Bhoomi is open every day from 7:00 AM to 10:00 PM. We serve breakfast, lunch, and evening snacks!";
  }
  if (q.match(/location|address|where|find|directions|map/)) {
    return "We are located at 123 Gandhi Nagar, Bangalore, Karnataka. You can find us on Google Maps — just search 'Bhoomi Tiffins'. Easy parking available!";
  }
  if (q.match(/popular|best|recommend|famous|special/)) {
    return "Our most loved dishes are:\n1. Ghee Masala Dosa — crispy perfection\n2. Filter Coffee — authentic South Indian brew\n3. Idly Sambar — soft, fluffy, with our secret sambar recipe\n4. Onion Rava Dosa — crispy and light\nAll made fresh daily!";
  }
  if (q.match(/offer|discount|deal|coupon|promotion/)) {
    return "We have exciting offers running! Check our Offers page for the latest deals. Currently: Early Bird Special (20% off before 9 AM) and Weekend Combo deals!";
  }
  if (q.match(/order|pre.?order|book|place/)) {
    return "To pre-order: visit our Order page, choose your items, pick a pickup date and time, enter your name and phone number — and we'll have it ready fresh when you arrive! No waiting in line.";
  }
  if (q.match(/cater|event|party|wedding|function|bulk/)) {
    return "Yes, we offer catering for all occasions — weddings, corporate events, pooja functions, birthday parties. Visit our Catering page to submit an inquiry and we'll get back to you within 24 hours!";
  }
  if (q.match(/price|cost|how much|rate/)) {
    return "Our prices start from just ₹30 for idly! Most dishes are between ₹50-₹150. Filter coffee is ₹40. Great quality at honest prices — that's the Bhoomi promise.";
  }
  if (q.match(/contact|phone|number|call|reach/)) {
    return "You can reach us on WhatsApp for instant support, or call us during business hours. Would you like me to connect you to WhatsApp now?";
  }
  if (q.match(/hello|hi|hey|namaste|start/)) {
    return "Vanakkam! Welcome to Bhoomi Tiffins & Snacks. I'm here to help with menu questions, hours, pre-orders, catering inquiries, and more. What can I help you with today?";
  }
  return "I'm not sure about that — let me connect you to our team on WhatsApp for immediate assistance!";
}

export default function FloatingButtons() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Vanakkam! I'm Bhoomi's assistant. Ask me about our menu, hours, location, or pre-orders!" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input.trim() };
    const botResponse = getAIResponse(input.trim());
    setMessages((prev) => [...prev, userMsg, { role: "bot", text: botResponse }]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* WhatsApp Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="btn-whatsapp"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-400 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110"
      >
        <SiWhatsapp size={24} />
      </a>

      {/* AI Chat Button */}
      <button
        data-testid="btn-ai-chat"
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 left-6 z-50 bg-amber text-black rounded-full p-4 shadow-2xl transition-all hover:scale-110"
      >
        {chatOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 z-50 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            data-testid="chat-panel"
          >
            <div className="bg-amber/10 border-b border-border px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber flex items-center justify-center text-black font-bold text-sm">B</div>
              <div>
                <div className="font-semibold text-sm text-foreground">Bhoomi AI</div>
                <div className="text-xs text-muted-foreground">Always here to help</div>
              </div>
            </div>

            <div className="h-64 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-amber text-black"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.text}
                    {msg.role === "bot" && msg.text.includes("WhatsApp") && (
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-green-400 underline text-xs"
                      >
                        Open WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border p-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about menu, hours..."
                className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-amber"
                data-testid="chat-input"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-2 bg-amber text-black rounded-xl disabled:opacity-40 hover:bg-amber/80 transition-colors"
                data-testid="chat-send"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
