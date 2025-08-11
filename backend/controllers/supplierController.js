const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Supplier = require('../models/supplierModel');
const Requirement = require('../models/requirementModel');

// Supplier signup
exports.signup = (req, res) => {
  const { companyName, email, password } = req.body;
  if (!companyName || !email || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }
  const existing = Supplier.getSupplierByEmail(email);
  if (existing) return res.status(400).json({ message: 'Email already registered' });
  const passwordHash = bcrypt.hashSync(password, 10);
  const id = Supplier.createSupplier({ companyName, email, passwordHash });
  res.json({ message: 'Signup success', id });
};

// Supplier login
exports.login = (req, res) => {
  const { email, password } = req.body;
  const supplier = Supplier.getSupplierByEmail(email);
  if (!supplier || !bcrypt.compareSync(password, supplier.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: supplier.id, role: 'supplier' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
};

// Get approved buyer requirements
exports.getRequirements = (req, res) => {
  const list = Requirement.getApprovedRequirements();
  res.json(list);
};
