
import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/geminiService';
import { Message } from '../types';

interface ExtendedMessage extends Message {
  isOffline?: boolean;
}

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ExtendedMessage[]>([
    { id: 'init', role: 'model', text: 'HELLO! I AM VIN DIESEL AI. ASK ME ABOUT CARB REGULATIONS, FIND TESTERS NEAR YOU, OR CLARIFY COMPLEX COMPLIANCE RULES.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Escalation Modal State
  const [showEscalation, setShowEscalation] = useState(false);
  const [escName, setEscName] = useState('');
  const [escPhone, setEscPhone] = useState('');
  const [escIssue, setEscIssue] = useState('');
  const [escSubmitted, setEscSubmitted] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
      const pending = sessionStorage.getItem('pending_chat_query');
      if (pending) {
          sessionStorage.removeItem('pending_chat_query');
          handleSend(pending);
      }
  }, []);

  const saveRecentQuestion = (question: string) => {
      if (question.length < 5) return;
      try {
          const existing = JSON.parse(localStorage.getItem('vin_diesel_recent_questions') || '[]');
          const updated = [question, ...existing.filter((q: string) => q !== question)].slice(0, 5);
          localStorage.setItem('vin_diesel_recent_questions', JSON.stringify(updated));
      } catch (e) {
          console.error("Failed to save question", e);
      }
  };

  const handleSend = async (textOverride?: string, imageFile?: File) => {
    const textToSend = textOverride || input;
    if ((!textToSend.trim() && !imageFile) || loading) return;
    
    if (!imageFile && textToSend) {
        saveRecentQuestion(textToSend);
    }

    const userMsg: ExtendedMessage = { 
        id: Date.now().toString(), 
        role: 'user', 
        text: imageFile ? `[IMAGE: ${imageFile.name}] ${textToSend || 'Analyze image.'}`.toUpperCase() : textToSend.toUpperCase(), 
        timestamp: Date.now() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInput('');
    setLoading(true);

    try {
      let imageData;
      if (imageFile) {
          const b64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve((reader.result as string).split(',')[1]);
              reader.onerror = reject;
              reader.readAsDataURL(imageFile);
          });
          imageData = { data: b64, mimeType: imageFile.type };
      }

      const history = messages
        .filter(m => m.id !== 'init')
        .map(m => ({ role: m.role, parts: [{ text: m.text }] }));

      const response: any = await sendMessage(
          imageFile ? (textToSend || "Analyze this image.") : textToSend, 
          'standard', 
          history, 
          undefined, 
          imageData
      );

      const botMsg: ExtendedMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: Date.now(),
        groundingUrls: response.groundingUrls,
        isOffline: response.isOffline
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error(error);
      const contactInfo = "\n\n📞 **IMMEDIATE SUPPORT:**\n617-359-6953";
      
      setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'model', 
          text: "⚠️ CONNECTION FAILED. " + contactInfo, 
          timestamp: Date.now() 
      }]);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadChat = () => {
      const chatText = messages
          .filter(m => m.id !== 'init')
          .map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role.toUpperCase()}: ${m.text}`)
          .join('\n\n');
      
      const blob = new Blob([chatText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carb-chat.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  if (showEscalation) {
      return (
          <div className="fixed inset-0 z-[100] bg-navy/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
              <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl space-y-6 border-t-[12px] border-teslaRed" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center">
                      <h2 className="text-xl font-black text-navy uppercase tracking-tighter">CARB Escalation</h2>
                      <button onClick={() => setShowEscalation(false)} className="text-gray-400 text-2xl">&times;</button>
                  </div>

                  {!escSubmitted ? (
                      <div className="space-y-4">
                          <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">We log all issues before providing official state contact details.</p>
                          <input type="text" placeholder="YOUR NAME" value={escName} onChange={e => setEscName(e.target.value.toUpperCase())} className="w-full p-4 border-2 border-navy rounded-xl font-black outline-none" />
                          <input type="tel" placeholder="PHONE NUMBER" value={escPhone} onChange={e => setEscPhone(e.target.value)} className="w-full p-4 border-2 border-navy rounded-xl font-black outline-none" />
                          <textarea placeholder="DESCRIBE ISSUE..." rows={3} value={escIssue} onChange={e => setEscIssue(e.target.value.toUpperCase())} className="w-full p-4 border-2 border-navy rounded-xl font-black outline-none text-xs" />
                          <button onClick={() => setEscSubmitted(true)} className="w-full btn-heavy py-4 rounded-xl">GET CONTACT INFO</button>
                      </div>
                  ) : (
                      <div className="space-y-6 text-center">
                          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
                          <div>
                              <p className="text-xs font-black text-navy uppercase mb-4">Official CARB Hotline</p>
                              <a href="tel:8666343735" className="block w-full btn-heavy py-5 rounded-xl text-xl mb-4">866-634-3735</a>
                              <a href="mailto:hdim@arb.ca.gov" className="text-xs font-black text-teslaRed underline uppercase">hdim@arb.ca.gov</a>
                          </div>
                          <button onClick={() => setShowEscalation(false)} className="text-[10px] font-black text-gray-400 uppercase">Return to Chat</button>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-200px)] bg-white/95 rounded-3xl border-4 border-navy overflow-hidden shadow-2xl mb-10">
      
      {/* HEADER */}
      <div className="bg-navy text-white p-3 px-5 flex justify-between items-center">
        <div>
            <h2 className="font-black text-xs uppercase tracking-widest leading-none">VIN DIESEL AI</h2>
            <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-[8px] font-black opacity-70">DISPATCH READY</span>
            </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEscalation(true)} className="bg-teslaRed text-white text-[8px] font-black px-2 py-1 rounded-md border border-white/20 uppercase">
            CARB HELP
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="text-white hover:text-teslaRed p-1">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleSend("Analyze this component.", file);
          }} />
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-navy text-white rounded-br-none font-black text-xs' 
                : 'bg-white border-2 border-navy/10 text-navy rounded-bl-none font-bold text-xs'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-navy/5 space-y-1">
                  <p className="font-black text-[9px] uppercase text-gray-400">References:</p>
                  {msg.groundingUrls.map((url, idx) => (
                    <a key={idx} href={url.uri} target="_blank" rel="noopener noreferrer" className="block text-teslaRed hover:underline truncate text-[9px] font-black">
                      {url.title?.toUpperCase() || "LINK"}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl border-2 border-navy/10 animate-pulse">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-navy rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-navy rounded-full opacity-50"></div>
                <div className="w-1.5 h-1.5 bg-navy rounded-full opacity-20"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 bg-white border-t-2 border-navy/5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="ASK COMPLIANCE..."
            className="w-full pl-5 pr-14 py-4 rounded-2xl border-2 border-navy bg-white text-navy placeholder:text-gray-300 font-black text-sm outline-none focus:border-teslaRed shadow-inner"
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading}
            className="absolute right-2 p-2 bg-navy text-white rounded-xl active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
