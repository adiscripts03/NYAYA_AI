import React, { useState, useEffect, useRef } from 'react';
import { Send, FileText, Info, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { saveCase, getCase } from '../utils/storage';

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'ai',
    text: "Hello. I'm Nyaya AI. I can help you understand your rights and figure out your next steps. What situation are you dealing with today?"
  }
];

export default function AIChat({ onNavigate, initialQuery, autoSend, initialGreeting, caseId, clearQuery, userPersona }) {
  const customInitialMessage = initialGreeting ? {
    id: 1,
    sender: 'ai',
    text: initialGreeting
  } : INITIAL_MESSAGES[0];

  const [messages, setMessages] = useState([customInitialMessage]);
  const [input, setInput] = useState('');
  const [currentCaseId, setCurrentCaseId] = useState(caseId || null);
  const hasFiredRef = useRef(false);

  // Load case if caseId is provided
  useEffect(() => {
    if (caseId) {
      const savedCase = getCase(caseId);
      if (savedCase && savedCase.data) {
        setMessages(savedCase.data);
        setCurrentCaseId(caseId);
        hasFiredRef.current = true; // Prevent initial query firing if loading old case
      }
    }
  }, [caseId]);

  // Save case whenever messages change (if there are user messages)
  useEffect(() => {
    const userMessages = messages.filter(m => m.sender === 'user');
    if (userMessages.length > 0) {
      const id = currentCaseId || `chat-${Date.now()}`;
      if (!currentCaseId) setCurrentCaseId(id);
      
      const title = userMessages[0].text.substring(0, 40) + '...';
      const lastMsg = messages[messages.length - 1].text;
      const snippet = lastMsg.substring(0, 60) + '...';
      
      saveCase({
        id,
        title,
        category: 'Legal Advice',
        status: 'In Draft',
        statusColor: 'var(--color-warning)',
        type: 'Chat Session',
        snippet,
        data: messages
      });
    }
  }, [messages, currentCaseId]);

  const handleSend = async (textOverride) => {
    // If called from an event handler, textOverride might be an event object.
    const textToSend = typeof textOverride === 'string' ? textOverride : input;
    if (!textToSend.trim()) return;
    
    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = textToSend;
    setInput('');
    
    // Add a loading message
    const loadingId = Date.now() + 1;
    setMessages((prev) => [...prev, { id: loadingId, sender: 'ai', text: "Analyzing your story and searching legal databases...", isLoading: true }]);

    try {
      const response = await fetch("http://localhost:8000/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          story: currentInput,
          history: messages.map(m => ({ role: m.sender, content: m.text })),
          persona: userPersona
        })
      });
      
      const result = await response.json();
      
      // Remove loading message
      setMessages((prev) => prev.filter(msg => msg.id !== loadingId));

      if (result.success && result.data) {
        const data = result.data;
        
        // Combine Advice and Action Plan into a single message
        const combinedText = data.action_plan 
          ? `${data.advice}\n\n---\n\n**Action Plan:**\n${data.action_plan}`
          : data.advice;

        const aiMsg = { 
          id: Date.now() + 2, 
          sender: 'ai', 
          text: combinedText,
          citation: `Category: ${data.category} | ${data.kanoon_results?.length ? 'Found relevant cases' : 'No cases found'}`
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(result.error || "Failed to get advice");
      }
    } catch (error) {
      setMessages((prev) => prev.filter(msg => msg.id !== loadingId));
      setMessages((prev) => [...prev, { id: Date.now() + 4, sender: 'ai', text: `Sorry, an error occurred: ${error.message}` }]);
    }
  };

  useEffect(() => {
    if ((initialQuery || initialGreeting) && !hasFiredRef.current) {
      hasFiredRef.current = true;
      if (initialQuery && autoSend) {
        handleSend(initialQuery);
      } else if (initialQuery) {
        setInput(initialQuery);
      }
      if (clearQuery) clearQuery();
    }
  }, [initialQuery, initialGreeting, autoSend]);

  return (
    <div className="chat-container">
      {/* Back Button Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
        <button onClick={() => onNavigate('home')} style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>AI Legal Assistant</h2>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div className={`message ${msg.sender}`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
            
            {msg.citation && (
              <div className="source-citation" style={{ alignSelf: 'flex-start', marginLeft: '4px' }}>
                <Info size={12} />
                {msg.citation}
              </div>
            )}
            
            {msg.isAction && (
              <div style={{ alignSelf: 'flex-start', marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                  <FileText size={16} /> Yes, draft notice
                </button>
                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                  Not right now
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="chat-input-area">
        <textarea 
          placeholder="Type your message here in plain language..." 
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="send-btn" onClick={handleSend}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
