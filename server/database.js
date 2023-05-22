const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  user: 'postgres',
  port: 5432,
  password: 'nabil200101@',
  database: 'grubhub'
});

module.exports = client;

