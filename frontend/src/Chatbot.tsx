import React, { useState, useRef, useEffect } from 'react';
import stringSimilarity from 'string-similarity';

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

  // Simple FAQ knowledge base
  const faq: { [question: string]: string } = {
    'what are the hostel fees': 'The hostel fees depend on the type of room and facilities. Please visit the official VIT Bhopal website for the latest fee structure.',
    'is there wifi in the hostel': 'Yes, all hostels are equipped with high-speed WiFi for students.',
    'what is the hostel curfew time': 'The hostel curfew time is 10:00 PM. All students are expected to be inside the hostel premises by then.',
    'are meals included': 'Yes, meals are included in the hostel fees. The mess provides breakfast, lunch, evening snacks, and dinner.',
    'can i choose my roommate': 'Roommate selection is subject to availability and university policy. You can submit a request, but it is not guaranteed.',
    'how to apply for hostel': 'You can apply for the hostel through the VIT Bhopal student portal after securing your admission.',
    'is ac available': 'Yes, AC rooms are available at an additional cost.',
    'what are the hostel rules': 'Hostel rules are available in the hostel handbook provided at the time of admission. Key rules include maintaining discipline, adhering to curfew, and keeping the premises clean.',
    'is laundry available': 'Yes, laundry facilities are available in the hostel.',
    'what is the contact for hostel warden': 'The contact details for the hostel warden are provided on the hostel notice board and the university website.',
    // Added new Q&A pairs for mess, food, charges, fine, room type, bed type
    'what about mess': 'The hostel mess provides nutritious and hygienic meals four times a day: breakfast, lunch, snacks, and dinner.',
    'food': 'A variety of vegetarian and non-vegetarian food options are available in the hostel mess. Special meals are provided during festivals.',
    'charges': 'Hostel charges include accommodation, meals, and basic facilities. Additional charges may apply for AC rooms, laundry, or special services.',
    'fine': 'Fines may be imposed for breaking hostel rules, late return after curfew, or causing damage to property. The amount depends on the violation.',
    'hostel fee': 'The hostel fees depend on the type of room and facilities. Please visit the official VIT Bhopal website for the latest fee structure.',
    'room type': 'Different types of rooms are available: single, double, triple, and quadruple sharing. AC and non-AC options are offered.',
    'bed type': 'Rooms are equipped with standard single beds and mattresses. The type of bed may vary depending on the room category.',
  };

  function getFaqAnswer(userInput: string): string {
    const normalized = userInput.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    const questions = Object.keys(faq);
    // Use string-similarity to find best match
    const { bestMatch } = stringSimilarity.findBestMatch(normalized, questions);
    if (bestMatch.rating > 0.2) {
      return faq[bestMatch.target];
    }
    return "Sorry, I don't know the answer to that. Please contact the hostel office for more information.";
  }

  const handleSend = async () => {
    if (input.trim() === '') return;
    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');

    // Use the FAQ knowledge base for answers
    const botReply = getFaqAnswer(messageToSend);
    setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      <div
        style={{
          background: '#007bff',
          color: 'white',
          borderRadius: '50%',
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
        onClick={() => setOpen((o) => !o)}
      >
        💬
      </div>
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 72,
            right: 0,
            width: 320,
            maxHeight: 480,
            background: 'white',
            borderRadius: 8,
            boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 12,
                  textAlign: msg.sender === 'user' ? 'right' : 'left',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    background: msg.sender === 'user' ? '#e9ecef' : '#007bff',
                    color: msg.sender === 'user' ? '#333' : 'white',
                    borderRadius: 16,
                    padding: '8px 16px',
                    maxWidth: 240,
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Type your message..."
              style={{ flex: 1, border: 'none', outline: 'none', padding: 8 }}
            />
            <button
              onClick={handleSend}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 16,
                padding: '8px 16px',
                marginLeft: 8,
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
