import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function AdminDashboard({ onLogout, theme }) {
    const [view, setView] = useState('users'); // 'users', 'investments', 'settings'
    const [users, setUsers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [siteConfig, setSiteConfig] = useState({
        enableChatbot: true,
        enableAdvice: true,
        enableInvestments: true
    });

    // Refresh data
    const refreshData = () => {
        const storedUsers = JSON.parse(localStorage.getItem('bank_users_db') || '[]');
        setUsers(storedUsers);

        const storedPlans = JSON.parse(localStorage.getItem('bank_investment_plans') || '[]');
        setPlans(storedPlans);

        const storedConfig = JSON.parse(localStorage.getItem('bank_site_config'));
        if (storedConfig) setSiteConfig(storedConfig);
    };

    useEffect(() => {
        refreshData();
    }, []);

    // --- User Management ---
    const [editingUserIndex, setEditingUserIndex] = useState(null);
    const [userForm, setUserForm] = useState({ name: '', accountNumber: '', password: '' });

    const handleSaveUser = (e) => {
        e.preventDefault();
        let updatedUsers = [...users];

        if (editingUserIndex !== null) {
            // Edit
            updatedUsers[editingUserIndex] = userForm;
            toast.success("User Updated");
            setEditingUserIndex(null);
        } else {
            // Add
            if (updatedUsers.find(u => u.accountNumber === userForm.accountNumber)) {
                toast.error("Account Number already exists!");
                return;
            }
            updatedUsers.push(userForm);
            toast.success("User Created");
        }

        localStorage.setItem('bank_users_db', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        setUserForm({ name: '', accountNumber: '', password: '' });
    };

    const handleEditUser = (index) => {
        setEditingUserIndex(index);
        setUserForm(users[index]);
    };

    const handleDeleteUser = (accountNumber) => {
        if (!window.confirm("Are you sure? This will delete the user permanently.")) return;
        const updatedUsers = users.filter(u => u.accountNumber !== accountNumber);
        localStorage.setItem('bank_users_db', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        toast.info("User Deleted");
    };

    // --- Plan Management ---
    const [newPlan, setNewPlan] = useState({
        title: '', roi: '', risk: 'Low', minInv: '', desc: '', tags: ''
    });

    const handleAddPlan = (e) => {
        e.preventDefault();
        const planToAdd = {
            ...newPlan,
            id: Date.now(),
            tags: newPlan.tags.split(',').map(t => t.trim())
        };

        const updatedPlans = [...plans, planToAdd];
        localStorage.setItem('bank_investment_plans', JSON.stringify(updatedPlans));
        setPlans(updatedPlans);
        setNewPlan({ title: '', roi: '', risk: 'Low', minInv: '', desc: '', tags: '' });
        toast.success("Investment Plan Added!");
    };

    const handleDeletePlan = (id) => {
        const updatedPlans = plans.filter(p => p.id !== id);
        localStorage.setItem('bank_investment_plans', JSON.stringify(updatedPlans));
        setPlans(updatedPlans);
        toast.info("Plan Deleted");
    };

    // --- Site Settings ---
    const toggleFeature = (feature) => {
        const newConfig = { ...siteConfig, [feature]: !siteConfig[feature] };
        setSiteConfig(newConfig);
        localStorage.setItem('bank_site_config', JSON.stringify(newConfig));
        toast.success(`Feature ${newConfig[feature] ? 'Enabled' : 'Disabled'}`);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', borderBottom: '5px solid #000', paddingBottom: '0.5rem' }}>ADMIN DASHBOARD</h1>
                <button className="btn" onClick={onLogout} style={{ width: 'auto', background: '#ef4444' }}>Logout</button>
            </div>

            <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {['users', 'investments', 'settings'].map(tab => (
                    <button
                        key={tab}
                        className={`btn ${view === tab ? '' : 'btn-outline'}`}
                        onClick={() => setView(tab)}
                        style={{ flex: 1, background: view === tab ? '#000' : 'transparent', color: view === tab ? '#fff' : 'inherit', textTransform: 'capitalize' }}
                    >
                        {tab === 'investments' ? 'Investments' : tab === 'settings' ? 'Site Config' : 'User Mgmt'}
                    </button>
                ))}
            </div>

            {view === 'users' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    <div className="auth-card" style={{ height: 'fit-content' }}>
                        <h3>{editingUserIndex !== null ? 'Edit User' : 'Add New User'}</h3>
                        <form onSubmit={handleSaveUser}>
                            <div className="form-group"><label>Name</label><input required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} /></div>
                            <div className="form-group"><label>Account No.</label><input required value={userForm.accountNumber} onChange={e => setUserForm({ ...userForm, accountNumber: e.target.value })} disabled={editingUserIndex !== null} /></div>
                            <div className="form-group"><label>Password</label><input required value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} /></div>
                            <button type="submit" className="btn">{editingUserIndex !== null ? 'Update User' : 'Create User'}</button>
                            {editingUserIndex !== null && <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => { setEditingUserIndex(null); setUserForm({ name: '', accountNumber: '', password: '' }); }}>Cancel Edit</button>}
                        </form>
                    </div>

                    <div className="auth-card">
                        <h3>Registered Users</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Account</th>
                                    <th>Pass</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, i) => (
                                    <tr key={i}>
                                        <td>{u.name}</td>
                                        <td>{u.accountNumber}</td>
                                        <td style={{ fontFamily: 'monospace', color: '#ef4444' }}>{u.password}</td>
                                        <td>
                                            <button onClick={() => handleEditUser(i)} style={{ marginRight: '0.5rem', cursor: 'pointer', background: 'none', border: 'none' }}>✏️</button>
                                            <button onClick={() => handleDeleteUser(u.accountNumber)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'investments' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="auth-card">
                        <h3>Create New Plan</h3>
                        <form onSubmit={handleAddPlan}>
                            <div className="form-group"><label>Title</label><input required value={newPlan.title} onChange={e => setNewPlan({ ...newPlan, title: e.target.value })} /></div>
                            <div className="form-group"><label>ROI</label><input required value={newPlan.roi} onChange={e => setNewPlan({ ...newPlan, roi: e.target.value })} placeholder="e.g. 10% p.a." /></div>
                            <div className="form-group"><label>Risk</label>
                                <select value={newPlan.risk} onChange={e => setNewPlan({ ...newPlan, risk: e.target.value })}>
                                    <option>Low</option><option>Moderate</option><option>High</option>
                                </select>
                            </div>
                            <div className="form-group"><label>Min Invest</label><input required value={newPlan.minInv} onChange={e => setNewPlan({ ...newPlan, minInv: e.target.value })} /></div>
                            <div className="form-group"><label>Description</label><textarea required value={newPlan.desc} onChange={e => setNewPlan({ ...newPlan, desc: e.target.value })} style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '2px solid #000' }} rows="3" /></div>
                            <div className="form-group"><label>Tags (comma sep)</label><input value={newPlan.tags} onChange={e => setNewPlan({ ...newPlan, tags: e.target.value })} placeholder="Safe, Growth..." /></div>
                            <button type="submit" className="btn">Add Plan</button>
                        </form>
                    </div>

                    <div className="auth-card" style={{ maxHeight: '800px', overflowY: 'auto' }}>
                        <h3>Live Plans</h3>
                        {plans.map(p => (
                            <div key={p.id} style={{ padding: '1rem', border: '2px solid #000', marginBottom: '1rem', background: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>{p.title}</strong>
                                    <button onClick={() => handleDeletePlan(p.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '2px 8px', cursor: 'pointer' }}>X</button>
                                </div>
                                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>ROI: {p.roi} | Risk: {p.risk}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'settings' && (
                <div className="auth-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h3>Site Configuration</h3>
                    <p style={{ marginBottom: '2rem' }}>Toggle features visible to end users immediately.</p>

                    {[
                        { key: 'enableChatbot', label: '🤖 AI Chatbot Support' },
                        { key: 'enableAdvice', label: '💼 Financial Advice Section' },
                        { key: 'enableInvestments', label: '📈 Investment Hub' }
                    ].map(item => (
                        <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                            <span style={{ fontWeight: 'bold' }}>{item.label}</span>
                            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                                <input
                                    type="checkbox"
                                    checked={siteConfig[item.key]}
                                    onChange={() => toggleFeature(item.key)}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: siteConfig[item.key] ? '#10b981' : '#ccc',
                                    transition: '.4s', border: '3px solid #000'
                                }}>
                                    <span style={{
                                        position: 'absolute', content: "", height: '20px', width: '20px', left: '4px', bottom: '4px',
                                        backgroundColor: 'white', transition: '.4s', border: '1px solid #000',
                                        transform: siteConfig[item.key] ? 'translateX(26px)' : 'none'
                                    }}></span>
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
