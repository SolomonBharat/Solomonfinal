const db = require('./db');

function createSupplier({companyName, email, passwordHash}) {
  const stmt = db.prepare('INSERT INTO suppliers (companyName, email, passwordHash) VALUES (?, ?, ?)');
  const info = stmt.run(companyName, email, passwordHash);
  return info.lastInsertRowid;
}

function getSupplierByEmail(email) {
  return db.prepare('SELECT * FROM suppliers WHERE email=?').get(email);
}

module.exports = { createSupplier, getSupplierByEmail };
