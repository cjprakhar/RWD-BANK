const INITIAL_DB = {
    users: [
        { accountNumber: '1001', password: 'password123' },
        { accountNumber: '1002', password: 'pass' }
    ],
    transactions: {
        '1001': [
            { date: '12/15/2025', description: 'Opening Balance', amount: 5000, type: 'credit', runningBalance: 5000 },
            { date: '12/16/2025', description: 'Grocery Store', amount: 150, type: 'debit', runningBalance: 4850 }
        ],
        '1002': [
            { date: '12/10/2025', description: 'Salary', amount: 10000, type: 'credit', runningBalance: 10000 }
        ]
    }
};

module.exports = INITIAL_DB;
