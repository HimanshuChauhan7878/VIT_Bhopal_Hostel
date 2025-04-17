import React, { useState, useRef, useEffect } from 'react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async () => {
    if (input.trim() === '') return;
    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');

    try {
      const response = await fetch('http://localhost:5005/webhooks/rest/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sender: 'user', message: messageToSend }),
      });
      if (!response.ok) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: 'Sorry, I could not reach the chatbot server.' }
        ]);
        return;
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        for (const msg of data) {
          if (msg.text) {
            setMessages(prev => [...prev, { sender: 'bot', text: msg.text }]);
          }
        }
      } else {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: 'Sorry, I did not get a response from the bot.' }
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Error connecting to the chatbot server.' }
      ]);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      <button
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000,
          background: '#2563eb',
          color: 'white',
          borderRadius: '50%',
          width: 56,
          height: 56,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: 'none',
          fontSize: 28,
          cursor: 'pointer',
        }}
        aria-label="Open Chatbot"
        onClick={() => setOpen(o => !o)}
      >
        💬
      </button>
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 100,
            right: 32,
            width: 340,
            maxHeight: 480,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ background: '#2563eb', color: 'white', padding: '12px 16px', fontWeight: 600 }}>
            Chatbot
            <button
              style={{ float: 'right', background: 'transparent', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}
              onClick={() => setOpen(false)}
              aria-label="Close Chatbot"
            >
              ×
            </button>
          </div>
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: '#f8fafc' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    background: msg.sender === 'user' ? '#2563eb' : '#e5e7eb',
                    color: msg.sender === 'user' ? 'white' : '#111827',
                    borderRadius: 16,
                    padding: '8px 14px',
                    maxWidth: '80%',
                    fontSize: 15,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #e5e7eb', background: '#fff' }}>
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              style={{ flex: 1, border: 'none', padding: 12, fontSize: 15, outline: 'none', background: 'transparent' }}
            />
            <button
              onClick={handleSend}
              style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: 16, padding: '0 16px', cursor: 'pointer' }}
              aria-label="Send"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
