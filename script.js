
const API_URL = 'http://localhost:3001/api';
const CURRENT_USER_KEY = 'bank_current_user';
const SETTINGS_KEY = 'user_settings';

function getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    if (user) return JSON.parse(user);
    return null;
}



async function signup(acc, pass) {
    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountNumber: acc, password: pass })
        });
        const data = await res.json();

        if (data.success) {
            alert('Account Created! Please login.');
            return true;
        } else {
            alert(data.message || 'Signup failed');
            return false;
        }
    } catch (err) {
        console.error(err);
        alert('Server error');
        return false;
    }
}

async function login(acc, pass) {
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountNumber: acc, password: pass })
        });
        const data = await res.json();

        if (data.success) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message || 'Wrong credentials');
        }
    } catch (err) {
        console.error(err);
        alert('Server error. Ensure Node.js backend is running.');
    }
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'index.html';
}




async function loadDashboard() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-account').textContent = user.accountNumber;
    await renderTable(user.accountNumber);
}

async function renderTable(accountNumber) {
    const tbody = document.getElementById('transaction-body');
    const balanceDisplay = document.getElementById('total-balance');

    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    try {
        const res = await fetch(`${API_URL}/transactions/${accountNumber}`);
        const list = await res.json();

        tbody.innerHTML = '';

        if (list.length === 0) {
            balanceDisplay.textContent = "0.00";
            tbody.innerHTML = '<tr><td colspan="4">No transactions</td></tr>';
            return;
        }


        balanceDisplay.textContent = list[0].runningBalance.toFixed(2);


        for (let i = 0; i < list.length; i++) {
            const t = list[i];

            let colorClass = 'amount-debit';
            let sign = '-';
            if (t.type === 'credit') {
                colorClass = 'amount-credit';
                sign = '+';
            }

            const row = `<tr>
                <td>${t.date}</td>
                <td>${t.description}</td>
                <td class="${colorClass}">${sign}${t.amount}</td>
                <td>${t.runningBalance.toFixed(2)}</td>
            </tr>`;

            tbody.innerHTML += row;
        }
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="4">Error loading data. Is server running?</td></tr>';
    }
}

async function addTransaction(accountNumber, desc, amount, type) {
    try {
        const res = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountNumber, description: desc, amount, type })
        });
        const data = await res.json();

        if (data.success) {

            renderTable(accountNumber);
        } else {
            alert('Failed to add transaction');
        }
    } catch (err) {
        console.error(err);
        alert('Error adding transaction');
    }
}





function initTheme() {
    const saved = localStorage.getItem(SETTINGS_KEY);
    let theme = 'light';

    if (saved) {
        const parsed = JSON.parse(saved);
        theme = parsed.theme;
    }

    applyTheme(theme);
    createThemeButton();
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';

    const settings = { theme: newTheme };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    applyTheme(newTheme);
}

function createThemeButton() {
    if (document.getElementById('theme-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'theme-btn';
    btn.className = 'theme-toggle';
    btn.textContent = '🌗';
    btn.onclick = toggleTheme;
    document.body.appendChild(btn);
}


initTheme();
