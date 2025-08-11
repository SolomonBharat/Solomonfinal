const db = require('./db');

function createRequirement(data) {
  const stmt = db.prepare(`INSERT INTO requirements
    (companyName, contactName, email, phone, category, details, quantity, targetPrice, deliveryLocation, notes)
    VALUES (@companyName, @contactName, @email, @phone, @category, @details, @quantity, @targetPrice, @deliveryLocation, @notes)`);
  const result = stmt.run(data);
  return result.lastInsertRowid;
}

function getAllRequirements() {
  return db.prepare('SELECT * FROM requirements').all();
}

function getApprovedRequirements() {
  return db.prepare('SELECT * FROM requirements WHERE status = "approved"').all();
}

function updateRequirementStatus(id, status, aiSummary = '', aiCategories = '') {
  return db.prepare('UPDATE requirements SET status=?, aiSummary=?, aiCategories=? WHERE id=?').run(status, aiSummary, aiCategories, id);
}

function getRequirementById(id) {
  return db.prepare('SELECT * FROM requirements WHERE id=?').get(id);
}

module.exports = {
  createRequirement,
  getAllRequirements,
  getApprovedRequirements,
  updateRequirementStatus,
  getRequirementById
};
