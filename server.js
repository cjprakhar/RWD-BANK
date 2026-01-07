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
app.use(express.static(path.join(__dirname, 'dist')));

const DB_FILE = path.join(__dirname, 'database_new.json');

const loadData = () => {
    const seed = {
        users: [...initialData.users],
        transactions: { ...initialData.transactions }
    };

    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
        return seed;
    }

    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        if (!data.trim()) throw new Error("Empty file");
        return JSON.parse(data);
    } catch (err) {
        console.log("Database corrupted or empty, resetting to initial state.");
        fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
        return seed;
    }
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
    const { accountNumber, description, amount, type, recipientAccount } = req.body;
    const val = parseFloat(amount);

    if (!db.transactions[accountNumber]) db.transactions[accountNumber] = [];

    const senderTx = db.transactions[accountNumber];
    const senderBal = senderTx.length > 0 ? senderTx[0].runningBalance : 0;

    if (type === 'debit' && senderBal < val) {
        return res.status(400).json({ success: false, message: 'Insufficient funds' });
    }

    let newSenderBal = type === 'credit' ? senderBal + val : senderBal - val;
    const senderEntry = {
        date: new Date().toLocaleDateString(),
        description,
        amount: val,
        type,
        runningBalance: newSenderBal
    };
    db.transactions[accountNumber].unshift(senderEntry);

    if (recipientAccount && type === 'debit') {
        const recipientExists = db.users.find(u => u.accountNumber === recipientAccount);
        if (recipientExists) {
            if (!db.transactions[recipientAccount]) db.transactions[recipientAccount] = [];

            const recTx = db.transactions[recipientAccount];
            const recBal = recTx.length > 0 ? recTx[0].runningBalance : 0;
            const newRecBal = recBal + val;

            const receiverEntry = {
                date: new Date().toLocaleDateString(),
                description: `Received from ${accountNumber}`,
                amount: val,
                type: 'credit',
                runningBalance: newRecBal
            };
            db.transactions[recipientAccount].unshift(receiverEntry);
        }
    }

    saveData(db);
    res.json({ success: true, transaction: senderEntry });
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
