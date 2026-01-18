import React, { useState, useRef, useEffect } from 'react';

export default function Chatbot({ user, theme }) {
    const [messages, setMessages] = useState([
        { id: 1, text: `Hello ${user.name}! I am your banking assistant. How can I help you today?`, sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);

        // Process response
        setTimeout(() => {
            const botResponse = getBotResponse(input, user);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
        }, 600);

        setInput('');
    };

    const getBotResponse = (text, user) => {
        const lower = text.toLowerCase();

        if (lower.includes('hello') || lower.includes('hi')) return "Hello! How can I assist you with your banking needs?";
        if (lower.includes('balance') || lower.includes('money')) return `You can check your current balance on the Dashboard. It is updated in real-time.`;
        if (lower.includes('loan')) return "We offer Home Loans, Personal Loans, and Car Loans at competitive interest rates. Visit the 'Financial Advice' section to consult an expert.";
        if (lower.includes('interest')) return "Our Savings Account interest rate is 4% p.a. Fixed Deposits offer up to 7.2% p.a. for senior citizens.";
        if (lower.includes('transfer') || lower.includes('send')) return "To transfer money, go to the Dashboard and use the 'Quick Transfer' section using the Recipient's Account Number.";
        if (lower.includes('contact') || lower.includes('customercare') || lower.includes('support')) return "You can reach our 24/7 support line at 1800-123-4567 or email us at support@rwd-bank.com.";
        if (lower.includes('thank')) return "You're welcome! Happy Banking.";

        return "I'm not sure about that. Try asking about 'balance', 'loans', 'interest rates', or 'transfers'.";
    };

    return (
        <div className="chatbot-container" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="auth-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                <div className="chat-header" style={{ padding: '1rem', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 'bold' }}>🤖</div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>Bank Assistant</h3>
                        <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Online</span>
                    </div>
                </div>

                <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>
                    {messages.map(msg => (
                        <div key={msg.id} style={{
                            display: 'flex',
                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                maxWidth: '70%',
                                padding: '0.8rem 1.2rem',
                                borderRadius: '1rem',
                                background: msg.sender === 'user' ? '#3b82f6' : (theme === 'dark' ? '#334155' : 'white'),
                                color: msg.sender === 'user' ? 'white' : 'inherit',
                                border: msg.sender === 'bot' ? '1px solid #e2e8f0' : 'none',
                                borderBottomRightRadius: msg.sender === 'user' ? '4px' : '1rem',
                                borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '1rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', background: theme === 'dark' ? '#0f172a' : 'white' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your doubt here..."
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '2rem',
                            border: '1px solid #cbd5e1',
                            outline: 'none'
                        }}
                    />
                    <button type="submit" style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        ➤
                    </button>
                </form>
            </div>
        </div>
    );
}
