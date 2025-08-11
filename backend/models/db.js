const Database = require('better-sqlite3');
const db = new Database(process.env.DATABASE_URL || './database.sqlite');

db.exec(`
CREATE TABLE IF NOT EXISTS requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  companyName TEXT,
  contactName TEXT,
  email TEXT,
  phone TEXT,
  category TEXT,
  details TEXT,
  quantity TEXT,
  targetPrice TEXT,
  deliveryLocation TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  aiSummary TEXT,
  aiCategories TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  companyName TEXT,
  email TEXT UNIQUE,
  passwordHash TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

module.exports = db;
