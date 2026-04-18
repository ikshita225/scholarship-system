const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: 'Ikshita@2205',
    database: 'scholarship_db'
});
connection.query("ALTER TABLE help_requests MODIFY status VARCHAR(255)", (err, results) => {
    if (err) console.error(err);
    else console.log('Fixed DB successfully');
    connection.end();
});
