import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function InvestmentPlans({ theme }) {
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Simulations for "Live" feel
    useEffect(() => {
        const timer = setInterval(() => {
            const updates = [
                "🚀 Gold prices just hit an all-time high!",
                "📉 Tech stocks are down by 2% today - Good time to buy?",
                "🔥 New 'Crypto Blue Chip' fund added!",
                "📢 RBI announces new bonds with 8% return.",
                "💰 500+ users invested in Index Funds in the last hour."
            ];
            const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
            toast.info(randomUpdate, { autoClose: 3000, theme: theme });
        }, 15000); // Notification every 15 seconds

        return () => clearInterval(timer);
    }, [theme]);

    const [plans, setPlans] = useState([]);

    useEffect(() => {
        const storedPlans = localStorage.getItem('bank_investment_plans');
        if (storedPlans) {
            setPlans(JSON.parse(storedPlans));
        } else {
            // Initial seed
            const defaultPlans = [
                {
                    id: 1,
                    title: "Sovereign Gold Bond (SGB)",
                    roi: "2.5% p.a. interest + Appreciation",
                    risk: "Low",
                    minInv: "₹5,000",
                    desc: "Government securities denominated in grams of gold. They are substitutes for holding physical gold. Investors have to pay the issue price in cash and the bonds will be redeemed in cash on maturity. The Bond is issued by Reserve Bank on behalf of Government of India.",
                    tags: ["Safe", "Govt Backed", "Tax Free*"]
                },
                {
                    id: 2,
                    title: "Nifty 50 Index Fund",
                    roi: "~12-15% p.a. (Historical)",
                    risk: "Moderate",
                    minInv: "₹500",
                    desc: "Passive mutual fund scheme that replicates the Nifty 50 index. It invests in the top 50 companies listed on the NSE in the same proportion as they are in the index. Ideal for long-term wealth creation with lower expense ratios.",
                    tags: ["Equity", "Long Term", "High Growth"]
                },
                {
                    id: 3,
                    title: "Corporate Fixed Deposit",
                    roi: "8.5% p.a.",
                    risk: "Low-Moderate",
                    minInv: "₹10,000",
                    desc: "Fixed Deposits offered by NBFCs and Housing Finance Companies. They typically offer higher interest rates than bank FDs. However, they carry a slightly higher risk. Rated AAA/stable by credit agencies.",
                    tags: ["Fixed Income", "Medium Term"]
                },
                {
                    id: 4,
                    title: "StartUp Equity Pool",
                    roi: "Potential 10x-100x",
                    risk: "High",
                    minInv: "₹50,000",
                    desc: "High-risk, high-reward investment in early-stage startups. This pool is managed by expert Venture Capitalists who vet companies. Capital is locked in for 5-7 years. Only for aggressive investors.",
                    tags: ["Alternative", "High Risk", "Long Lock-in"]
                },
                {
                    id: 5,
                    title: "Green Energy Bonds",
                    roi: "7.0% p.a.",
                    risk: "Low",
                    minInv: "₹1,000",
                    desc: "Invest in renewable energy projects like solar and wind farms. These bonds are backed by assets and revenue streams from power generation. Supports sustainable development while earning steady returns.",
                    tags: ["ESG", "Sustainable", "Stable"]
                }
            ];
            localStorage.setItem('bank_investment_plans', JSON.stringify(defaultPlans));
            setPlans(defaultPlans);
        }
    }, []);

    return (
        <div className="investment-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2>Investment Hub</h2>
                    <p className="subtitle">Grow your wealth with curated plans.</p>
                </div>
                <div style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
                    🔴 LIVE
                </div>
            </div>

            <div className="info-banner" style={{ padding: '1rem', background: theme === 'dark' ? '#334155' : '#e0f2fe', border: '3px solid #3b82f6', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🔔</span>
                <marquee scrollamount="8" style={{ fontWeight: 'bold' }}>
                    SENSEX: 72,000 ▲ | GOLD: ₹62,500 ▼ | USD/INR: ₹83.12 | BITCOIN: $45,000 ▲ | NEW NFO: Tech Opportunities Fund Open Now!
                </marquee>
            </div>

            {selectedPlan ? (
                <div className="auth-card" style={{ border: '3px solid #000' }}>
                    <button className="btn btn-secondary" onClick={() => setSelectedPlan(null)} style={{ width: 'auto', marginBottom: '1rem' }}>← Back</button>
                    <h2 style={{ fontSize: '2rem', color: '#7c3aed' }}>{selectedPlan.title}</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {selectedPlan.tags.map(tag => (
                            <span key={tag} style={{ background: '#000', color: '#fff', padding: '0.2rem 0.6rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '1rem', border: '2px solid #000', background: theme === 'dark' ? '#1e293b' : '#f0fdf4' }}>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Expected Returns</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981' }}>{selectedPlan.roi}</div>
                        </div>
                        <div style={{ padding: '1rem', border: '2px solid #000', background: theme === 'dark' ? '#1e293b' : '#fef2f2' }}>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Risk Level</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ef4444' }}>{selectedPlan.risk}</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3>Detailed Description</h3>
                        <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>{selectedPlan.desc}</p>
                    </div>

                    <div style={{ padding: '1rem', background: '#fffbeb', border: '2px dashed #f59e0b', marginBottom: '2rem', color: '#000' }}>
                        <strong>Minimum Investment:</strong> {selectedPlan.minInv}
                    </div>

                    <button className="btn" onClick={() => toast.success(`Investment initiated for ${selectedPlan.title}`)}>
                        Invest Now
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {plans.map(plan => (
                        <div key={plan.id} className="auth-card" style={{ padding: '1.5rem', marginBottom: 0, display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setSelectedPlan(plan)}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ marginBottom: '0.5rem' }}>{plan.title}</h3>
                                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                                    ROI: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{plan.roi}</span>
                                </div>
                                <p style={{ fontSize: '0.9rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                    {plan.desc}
                                </p>
                            </div>
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px dotted #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Min: {plan.minInv}</span>
                                <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Details →</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
