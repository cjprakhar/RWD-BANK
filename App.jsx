import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './style.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const API_URL = 'http://localhost:3001/api';
const CURRENT_USER_KEY = 'bank_current_user';
const SETTINGS_KEY = 'user_settings';

export default function App() {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('light');
    const [view, setView] = useState('dashboard');


    useEffect(() => {
        const savedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setTheme(parsed.theme);
            applyTheme(parsed.theme);
        } else {
            applyTheme('light');
        }
    }, []);

    const applyTheme = (newTheme) => {
        if (newTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme: newTheme }));
    };

    const handleLogin = (userData) => {
        setUser(userData);
        setView('dashboard');
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        setView('dashboard');
        localStorage.removeItem(CURRENT_USER_KEY);
    };

    return (
        <div className={`app-container ${theme}`}>
            {user ? (
                view === 'profile' ? (
                    <Profile user={user} theme={theme} onBack={() => setView('dashboard')} onLogout={handleLogout} />
                ) : (
                    <Dashboard user={user} onLogout={handleLogout} theme={theme} onProfile={() => setView('profile')} />
                )
            ) : (
                <Auth onLogin={handleLogin} />
            )}

            <button
                className="theme-toggle"
                onClick={toggleTheme}
                id="theme-btn"
                aria-label="Toggle Theme"
            >
                🌗
            </button>
            <ToastContainer position="bottom-right" theme={theme} />
        </div>
    );
}

function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [accountNumber, setAccountNumber] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/login' : '/signup';

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountNumber, password, name: isLogin ? undefined : name }),
            });
            const data = await res.json();

            if (data.success) {
                if (isLogin) {
                    onLogin(data.user);
                } else {
                    toast.success('Account Created! Please login.');
                    setIsLogin(true);
                    setPassword('');
                }
            } else {
                toast.error(data.message || (isLogin ? 'Wrong credentials' : 'Signup failed'));
            }
        } catch (err) {
            console.error(err);
            toast.error('Server error. Ensure Node.js backend is running.');
        }
    };

    return (
        <div className="container">
            <div className="auth-card">
                <div className="brand-header">
                    <div className="brand-logo">BP</div>
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="subtitle">
                        {isLogin ? 'Please enter your details to sign in.' : 'Enter details to create a new account.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>{isLogin ? 'Account Number' : 'Choose Account Number'}</label>
                        <input
                            type="text"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{isLogin ? 'Password' : 'Create Password'}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <a
                    className="toggle-link"
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? "Don't have an account? Create one" : "Already have an account? Login"}
                </a>
            </div>
        </div>
    );
}

function Dashboard({ user, onLogout, theme, onProfile }) {
    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
    // ... (omitting unchanged lines for brevity if possible, or usually we just replace the chunk)
    // Wait, I can't use "..." in replacement content. I must be precise.
    // I will target the function signature and the header part.
    // But the function signature and header are far apart.
    // I'll update the component structure in two chunks using multi_replace_file_content if I could, but I'm locked to replace_file_content or multi.
    // I will use replace_file_content for the whole Dashboard start.

    // Actually, I'll update the signature first, then the header.
    // Step 1: Update signature
    const [loading, setLoading] = useState(true);

    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('credit');

    const chartData = {
        labels: transactions.slice().reverse().map(t => t.date),
        datasets: [
            {
                label: 'Balance History',
                data: transactions.slice().reverse().map(t => t.runningBalance),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
                fill: false,
                pointRadius: 4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: { color: theme === 'dark' ? '#cbd5e1' : '#334155' }
            },
            title: {
                display: true,
                text: 'Account Balance Trend',
                color: theme === 'dark' ? '#cbd5e1' : '#334155'
            }
        },
        scales: {
            y: {
                ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' },
                grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
            },
            x: {
                ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' },
                grid: { display: false }
            }
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/transactions/${user.accountNumber}`);
            const list = await res.json();

            if (list.length > 0) {
                setBalance(list[0].runningBalance);
                setTransactions(list);
            } else {
                setBalance(0);
                setTransactions([]);
            }
        } catch (err) {
            console.error(err);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.accountNumber]);

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountNumber: user.accountNumber,
                    description: desc,
                    amount: parseFloat(amount),
                    type
                })
            });
            const data = await res.json();

            if (data.success) {

                setDesc('');
                setAmount('');
                setType('credit');

                fetchData();
                toast.success('Transaction successful!');
            } else {
                toast.error('Failed to add transaction');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error adding transaction');
        }
    };

    return (
        <>
            <header className="header">
                <div className="brand-logo" style={{ margin: 0, width: '32px', height: '32px', fontSize: '1rem' }}>BP</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>Welcome, <span>{user.name || user.accountNumber}</span></span>
                    <button
                        className="btn btn-secondary"
                        onClick={onProfile}
                        style={{ width: 'auto', padding: '0.5rem 1rem', margin: 0 }}
                    >
                        Profile
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={onLogout}
                        style={{ width: 'auto', padding: '0.5rem 1rem', margin: 0 }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-container dashboard-content">
                <div className="balance-card">
                    <span className="balance-label">Total Balance</span>
                    <div className="balance-amount">₹{balance.toFixed(2)}</div>
                </div>

                <div className="chart-container" style={{ marginBottom: '2rem', padding: '1rem', background: theme === 'dark' ? '#1e293b' : 'white', borderRadius: '12px', border: '1px solid', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0' }}>
                    <Line options={chartOptions} data={chartData} />
                </div>

                <div className="actions">

                    <div className="transaction-list">
                        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: 0 }}>Recent Transactions</h3>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4">Loading...</td></tr>
                                ) : transactions.length === 0 ? (
                                    <tr><td colSpan="4">No transactions</td></tr>
                                ) : (
                                    transactions.map((t, index) => (
                                        <tr key={index}>
                                            <td>{t.date}</td>
                                            <td>{t.description}</td>
                                            <td className={t.type === 'credit' ? 'amount-credit' : 'amount-debit'}>
                                                {t.type === 'credit' ? '+' : '-'}{t.amount}
                                            </td>
                                            <td>{t.runningBalance.toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>


                    <div className="auth-card" style={{ padding: '1.5rem' }}>
                        <h3>Quick Transfer</h3>
                        <form onSubmit={handleTransactionSubmit}>
                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="credit">Credit (Deposit)</option>
                                    <option value="debit">Debit (Withdrawal)</option>
                                </select>
                            </div>
                            <button type="submit" className="btn">Process</button>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}

function Profile({ user, theme, onBack, onLogout }) {
    return (
        <>
            <header className="header">
                <div className="brand-logo" style={{ margin: 0, width: '32px', height: '32px', fontSize: '1rem' }}>BP</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onBack}
                        style={{ width: 'auto', padding: '0.5rem 1rem', margin: 0 }}
                    >
                        &larr; Back
                    </button>
                </div>
            </header>

            <main className="dashboard-container dashboard-content">
                <div className="auth-card profile-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div className="brand-logo" style={{ width: '80px', height: '80px', fontSize: '2.5rem', margin: '0 auto 1rem' }}>
                            {user.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                        <h2>{user.name || 'User Profile'}</h2>
                        <p className="subtitle">Account Details</p>
                    </div>

                    <div className="profile-details">
                        <div className="detail-item">
                            <label>Full Name</label>
                            <div className="detail-value">{user.name || 'Not Provided'}</div>
                        </div>
                        <div className="detail-item">
                            <label>Account Number</label>
                            <div className="detail-value">{user.accountNumber}</div>
                        </div>
                        <div className="detail-item">
                            <label>Account Status</label>
                            <div className="detail-value" style={{ color: '#10b981', fontWeight: 'bold' }}>Active</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                        <button className="btn btn-secondary" onClick={onLogout} style={{ width: '100%' }}>
                            Sign Out
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}
