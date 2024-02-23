// Require the mysql package
const mysql = require('mysql');

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'paypal_assignment'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database: ', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Function to store data in the MySQL table
function saveOrder(data) {
  const query = 'INSERT INTO orders SET ?';

  connection.query(query, data, (error, results, fields) => {
    if (error) {
      console.error('Error storing data in MySQL table: ', error);
      return;
    }
    console.log('Data stored successfully in MySQL table');
  });
}

module.exports = { saveOrder };