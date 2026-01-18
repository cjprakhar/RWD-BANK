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
import Chatbot from './Chatbot';
import FinancialAdvice from './FinancialAdvice';
import InvestmentPlans from './InvestmentPlans';
import AdminDashboard from './AdminDashboard';
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



const STORAGE_KEY_USERS = 'bank_users_db';
const STORAGE_KEY_TXS = 'bank_txs_db';

const getDiff = () => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const txs = JSON.parse(localStorage.getItem(STORAGE_KEY_TXS) || '{}');
    return { users, txs };
};

const saveDiff = (users, txs) => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(txs));
};

// Initial Seed
if (!localStorage.getItem(STORAGE_KEY_USERS)) {
    saveDiff(
        [{ name: 'Demo User', accountNumber: '12345', password: '123' }],
        { '12345': [{ date: new Date().toLocaleDateString(), description: 'Welcome Bonus', amount: 1000, type: 'credit', runningBalance: 1000 }] }
    );
}

const mockApi = {
    login: async (accountNumber, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const { users } = getDiff();
                const user = users.find(u => u.accountNumber === accountNumber && u.password === password);
                if (user) resolve({ success: true, user });
                else resolve({ success: false, message: 'Invalid credentials. Try: 12345 / 123' });
            }, 500);
        });
    },
    signup: async (name, accountNumber, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const { users, txs } = getDiff();
                if (users.find(u => u.accountNumber === accountNumber)) {
                    resolve({ success: false, message: 'Account already exists' });
                } else {
                    const newUser = { name, accountNumber, password };
                    users.push(newUser);
                    txs[accountNumber] = [];
                    saveDiff(users, txs);
                    resolve({ success: true, user: newUser });
                }
            }, 500);
        });
    },
    getTransactions: async (accountNumber) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const { txs } = getDiff();
                resolve(txs[accountNumber] || []);
            }, 300);
        });
    },
    addTransaction: async ({ accountNumber, description, amount, type, recipientAccount }) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const { users, txs } = getDiff();
                if (!txs[accountNumber]) txs[accountNumber] = [];

                const userTx = txs[accountNumber];
                const balance = userTx.length > 0 ? userTx[0].runningBalance : 0;
                const val = parseFloat(amount);

                if (type === 'debit' && balance < val) {
                    resolve({ success: false, message: 'Insufficient funds' });
                    return;
                }

                let newBal = type === 'credit' ? balance + val : balance - val;
                const newTx = {
                    date: new Date().toLocaleDateString(),
                    description,
                    amount: val,
                    type,
                    runningBalance: newBal
                };

                userTx.unshift(newTx);

                // Handle P2P
                if (type === 'debit' && recipientAccount) {
                    if (users.find(u => u.accountNumber === recipientAccount)) {
                        if (!txs[recipientAccount]) txs[recipientAccount] = [];
                        const recipientBal = txs[recipientAccount].length > 0 ? txs[recipientAccount][0].runningBalance : 0;
                        const recTx = {
                            date: new Date().toLocaleDateString(),
                            description: `Received from ${accountNumber}`,
                            amount: val,
                            type: 'credit',
                            runningBalance: recipientBal + val
                        };
                        txs[recipientAccount].unshift(recTx);
                    }
                }

                saveDiff(users, txs);
                resolve({ success: true });
            }, 500);
        });
    }
};

const CURRENT_USER_KEY = 'bank_current_user';
const SETTINGS_KEY = 'user_settings';

export default function App() {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('light');
    const [view, setView] = useState('dashboard');
    const [config, setConfig] = useState({
        enableChatbot: true,
        enableAdvice: true,
        enableInvestments: true
    });

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

        const savedConfig = JSON.parse(localStorage.getItem('bank_site_config'));
        if (savedConfig) setConfig(savedConfig);
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

    if (user && user.isAdmin) {
        return <AdminDashboard onLogout={handleLogout} theme={theme} />;
    }

    return (
        <>
            <div className="theme-toggle" onClick={toggleTheme}>
                {theme === 'dark' ? '☀' : '☾'}
            </div>
            <ToastContainer position="bottom-right" theme={theme} />

            {user ? (
                <div style={{ display: 'flex' }}>
                    <Sidebar view={view} setView={setView} onLogout={handleLogout} config={config} />
                    <div className="main-content-with-sidebar">
                        <div className="auth-card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
                            <h2>{view === 'dashboard' ? 'Dashboard' : 'My Profile'}</h2>
                            <p className="subtitle">Welcome back, {user.name || user.accountNumber}</p>
                        </div>

                        {view === 'profile' ? (
                            <Profile user={user} theme={theme} onLogout={handleLogout} />
                        ) : view === 'chatbot' && config.enableChatbot ? (
                            <Chatbot user={user} theme={theme} />
                        ) : view === 'advice' && config.enableAdvice ? (
                            <FinancialAdvice user={user} theme={theme} />
                        ) : view === 'invest' && config.enableInvestments ? (
                            <InvestmentPlans theme={theme} />
                        ) : (
                            <Dashboard user={user} onLogout={handleLogout} theme={theme} />
                        )}
                    </div>
                </div>
            ) : (
                <Auth onLogin={handleLogin} />
            )}
        </>
    );
}


function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [accountNumber, setAccountNumber] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let data;
            if (isLogin) {
                if (accountNumber === 'admin' && password === 'admin123') {
                    onLogin({ name: 'Admin', isAdmin: true });
                    return;
                }
                data = await mockApi.login(accountNumber, password);
            } else {
                data = await mockApi.signup(name, accountNumber, password);
            }

            if (data.success) {
                if (isLogin) {
                    onLogin(data.user);
                } else {
                    toast.success('Account Created! Please login.');
                    setIsLogin(true);
                    setPassword('');
                }
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error('Error processing request');
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
                    <div style={{ padding: '0.5rem', background: '#fef3c7', fontSize: '0.8rem', marginBottom: '1rem', border: '1px solid #000' }}>
                        <strong>Demo Credentials:</strong><br />
                        User: 12345 / 123<br />
                        Admin: admin / admin123
                    </div>
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
            const list = await mockApi.getTransactions(user.accountNumber);
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

    const [recipient, setRecipient] = useState('');

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await mockApi.addTransaction({
                accountNumber: user.accountNumber,
                description: desc,
                amount: parseFloat(amount),
                type,
                recipientAccount: type === 'debit' && recipient ? recipient : undefined
            });

            if (data.success) {
                setDesc('');
                setAmount('');
                setRecipient('');
                setType('credit');
                fetchData();
                toast.success('Transaction successful!');
            } else {
                toast.error(data.message || 'Failed to add transaction');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error adding transaction');
        }
    };

    return (
        <>
            <div className="dashboard-content" style={{ marginTop: 0 }}>
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
                                <label>Type</label>
                                <select value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="credit">Deposit (Self)</option>
                                    <option value="debit">Transfer / Withdraw</option>
                                </select>
                            </div>

                            {type === 'debit' && (
                                <div className="form-group">
                                    <label>Recipient Account (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Leave empty for withdrawal"
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                    />
                                </div>
                            )}

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
                            <button type="submit" className="btn">Process Transaction</button>
                        </form>
                    </div>
                </div>
            </div>
            {/* Virtual Card Section */}
            <VirtualCard user={user} />
        </>
    );
}

function Sidebar({ view, setView, onLogout, config }) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'profile', label: 'Profile' }
    ];

    if (config.enableInvestments) navItems.push({ id: 'invest', label: 'Investments' });
    if (config.enableAdvice) navItems.push({ id: 'advice', label: 'Financial Advice' });
    if (config.enableChatbot) navItems.push({ id: 'chatbot', label: 'Support Chat' });

    return (
        <div className="sidebar">
            <div className="sidebar-brand">BANK</div>
            {navItems.map(item => (
                <div
                    key={item.id}
                    className={`nav-item ${view === item.id ? 'active' : ''}`}
                    onClick={() => setView(item.id)}
                >
                    {item.label}
                </div>
            ))}
            <div className="nav-item" onClick={onLogout} style={{ marginTop: 'auto', color: 'var(--secondary-accent)' }}>
                Logout
            </div>
        </div>
    );
}

function Profile({ user, theme, onLogout }) {
    return (
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
        </div>
    );
}


function VirtualCard({ user }) {
    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 900 }}>My Virtual Card</h3>
            <div style={{
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                color: 'white',
                padding: '1.5rem',
                border: '3px solid #000',
                boxShadow: '4px 4px 0px #000',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'Space Mono, monospace'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', fontStyle: 'italic' }}>BANK</div>
                    <div style={{ fontSize: '1rem', border: '1px solid white', padding: '0 4px' }}>DEBIT</div>
                </div>

                <div style={{ width: '40px', height: '30px', background: '#fbbf24', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #000' }}></div>

                <div style={{ fontSize: '1.4rem', letterSpacing: '2px', marginBottom: '1.5rem', textShadow: '2px 2px 0 #000', fontWeight: 'bold' }}>
                    4567 •••• •••• {user.accountNumber && user.accountNumber.length >= 4 ? user.accountNumber.slice(-4) : '0000'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>CARD HOLDER</div>
                        <div style={{ fontSize: '1rem', textTransform: 'uppercase', fontWeight: 'bold' }}>{user.name || 'VALUED USER'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>EXPIRES</div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>12/28</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
