const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'bunny@2005',
    port: 3307,
    database: 'college_event_system'
});

db.connect(err => {
    if (err) {
        console.error('MySQL connection failed:', err);
        return;
    }
    console.log('MySQL Connected');
});

module.exports = db;
