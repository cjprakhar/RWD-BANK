import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function FinancialAdvice({ user, theme }) {
    const [adviceType, setAdviceType] = useState('unpaid'); // 'paid' or 'unpaid'

    return (
        <div className="financial-advice-container" style={{ padding: '1rem' }}>
            <h2>Financial Advice & Services</h2>
            <p className="subtitle">Expert guidance for your financial growth</p>

            <div className="tabs" style={{ display: 'flex', gap: '1rem', margin: '2rem 0' }}>
                <button
                    className={`btn ${adviceType === 'paid' ? '' : 'btn-outline'}`}
                    onClick={() => setAdviceType('paid')}
                    style={{ flex: 1, backgroundColor: adviceType === 'paid' ? '#f59e0b' : 'transparent', color: adviceType === 'paid' ? 'black' : 'inherit', border: '1px solid #f59e0b' }}
                >
                    🏢 Business Policy (Paid)
                </button>
                <button
                    className={`btn ${adviceType === 'unpaid' ? '' : 'btn-outline'}`}
                    onClick={() => setAdviceType('unpaid')}
                    style={{ flex: 1, backgroundColor: adviceType === 'unpaid' ? '#10b981' : 'transparent', color: adviceType === 'unpaid' ? 'black' : 'inherit', border: '1px solid #10b981' }}
                >
                    👤 Personal Advice (Free)
                </button>
            </div>

            <div className="advice-content">
                {adviceType === 'paid' ? (
                    <PaidAdvice user={user} theme={theme} />
                ) : (
                    <UnpaidAdvice user={user} theme={theme} />
                )}
            </div>
        </div>
    );
}

function PaidAdvice({ user, theme }) {
    const [formData, setFormData] = useState({
        businessName: '',
        turnover: '',
        query: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            toast.success(`Request sent! A Chartered Accountant will contact ${user.name} shortly.`);
            setFormData({ businessName: '', turnover: '', query: '' });
        }, 1000);
    };

    return (
        <div className="auth-card" style={{ maxWidth: '100%' }}>
            <h3 style={{ color: '#f59e0b' }}>Premium CA Consultation</h3>
            <p>Get professional financial planning, audit services, and tax strategies for your business from certified experts.</p>
            <div style={{ margin: '1rem 0', padding: '1rem', background: theme === 'dark' ? '#374151' : '#fffbeb', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                <strong>Fee Structure:</strong><br />
                • Initial Consultation: ₹2,000<br />
                • Annual Audit: ₹15,000+<br />
                • Tax Filing: ₹5,000
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Business Name</label>
                    <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Annual Turnover (Approx)</label>
                    <input
                        type="text"
                        value={formData.turnover}
                        onChange={(e) => setFormData({ ...formData, turnover: e.target.value })}
                        placeholder="e.g. 50 Lakhs"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Specific Requirement</label>
                    <textarea
                        value={formData.query}
                        onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                        placeholder="Describe what you need help with..."
                        required
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'transparent', border: '2px solid #000', color: 'inherit' }}
                        rows="4"
                    />
                </div>
                <button type="submit" className="btn" style={{ background: '#f59e0b', color: 'black' }}>Book Appointment</button>
            </form>
        </div>
    );
}

function UnpaidAdvice({ user, theme }) {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState(null);

    const getAutomatedAdvice = (e) => {
        e.preventDefault();
        let advice = "Based on general financial principles: Ensure you save at least 20% of your income. Diversify your investments across FD, Mutual Funds, and Gold.";

        if (query.toLowerCase().includes('loan')) {
            advice = "For loans: Compare interest rates across banks. Maintain a credit score above 750 for best rates. Avoid taking loans for depreciating assets.";
        } else if (query.toLowerCase().includes('invest')) {
            advice = "Investment Tip: Start with an Index Fund for long-term growth. Use SIPs to average out market volatility.";
        } else if (query.toLowerCase().includes('save') || query.toLowerCase().includes('savings')) {
            advice = "Savings Hack: Try the 50-30-20 rule. 50% needs, 30% wants, 20% savings. Create an emergency fund worth 6 months of expenses.";
        }

        setResponse(advice);
    };

    return (
        <div>
            <div className="tips-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="auth-card" style={{ padding: '1.5rem', borderTop: '4px solid #10b981' }}>
                    <h4>📈 Smart Investing</h4>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Start early to benefit from compounding. Even small SIPs can grow into crores over 20 years.</p>
                </div>
                <div className="auth-card" style={{ padding: '1.5rem', borderTop: '4px solid #3b82f6' }}>
                    <h4>🛡️ Risk Management</h4>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Always have health insurance separate from your employer's cover. Term insurance is a must for breadwinners.</p>
                </div>
                <div className="auth-card" style={{ padding: '1.5rem', borderTop: '4px solid #ef4444' }}>
                    <h4>🚫 Debt Trap</h4>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Credit card debt is the most expensive. Pay full bills every month. Avoid withdrawing cash on credit cards.</p>
                </div>
            </div>

            <div className="auth-card">
                <h3>Ask for Personal Advice</h3>
                <p>Get instant automated tips for your financial queries.</p>
                <form onSubmit={getAutomatedAdvice}>
                    <div className="form-group">
                        <label>What's on your mind?</label>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. How to save money? Best investment options?"
                            required
                        />
                    </div>
                    <button type="submit" className="btn" style={{ background: '#10b981', color: 'black' }}>Get Advice</button>
                </form>
                {response && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: theme === 'dark' ? '#064e3b' : '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                        <strong>💡 Suggestion:</strong>
                        <p style={{ marginTop: '0.5rem' }}>{response}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
