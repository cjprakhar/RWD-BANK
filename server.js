const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const initialData = require('./database');

const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

const DB_FILE = path.join(__dirname, 'database.json');

const loadData = () => {
    if (!fs.existsSync(DB_FILE)) {
        const seed = {
            users: [...initialData.users],
            transactions: { ...initialData.transactions }
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
        return seed;
    }
    return JSON.parse(fs.readFileSync(DB_FILE));
};

const saveData = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

let db = loadData();

app.post('/api/signup', (req, res) => {
    const { accountNumber, password, name } = req.body;
    const existing = db.users.find(u => u.accountNumber === accountNumber);
    if (existing) {
        return res.status(400).json({ success: false, message: 'Account already exists' });
    }
    db.users.push({ accountNumber, password, name });
    saveData(db);
    res.json({ success: true });
});

app.post('/api/login', (req, res) => {
    const { accountNumber, password } = req.body;
    const user = db.users.find(u => u.accountNumber === accountNumber && u.password === password);

    if (user) {
        res.json({ success: true, user: { accountNumber: user.accountNumber, name: user.name || 'User' } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.get('/api/transactions/:accountNumber', (req, res) => {
    const { accountNumber } = req.params;
    const transactions = db.transactions[accountNumber] || [];
    res.json(transactions);
});

app.post('/api/transactions', (req, res) => {
    const { accountNumber, description, amount, type } = req.body;

    if (!db.transactions[accountNumber]) {
        db.transactions[accountNumber] = [];
    }

    const transactions = db.transactions[accountNumber];
    let currentBalance = 0;

    if (transactions.length > 0) {
        currentBalance = transactions[0].runningBalance;
    }

    let newBalance = type === 'credit'
        ? currentBalance + parseFloat(amount)
        : currentBalance - parseFloat(amount);

    const newTransaction = {
        date: new Date().toLocaleDateString(),
        description,
        amount: parseFloat(amount),
        type,
        runningBalance: newBalance
    };

    transactions.unshift(newTransaction);
    saveData(db);

    res.json({ success: true, transaction: newTransaction });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
