const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Requirement = require('../models/requirementModel');
const aiService = require('../services/aiService');

const adminUsername = process.env.ADMIN_USERNAME;
const adminPasswordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);

// Admin login to receive JWT token
exports.login = (req, res) => {
  const { username, password } = req.body;
  if (username !== adminUsername || !bcrypt.compareSync(password, adminPasswordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
};

// Fetch all buyer requirements
exports.getRequirements = (req, res) => {
  const all = Requirement.getAllRequirements();
  res.json(all);
};

// Approve a requirement and trigger AI summary/suggestions
exports.approveRequirement = async (req, res) => {
  const id = req.params.id;
  const reqData = Requirement.getRequirementById(id);
  if (!reqData) return res.status(404).json({ message: 'Requirement not found' });

  let aiSummary = '';
  let aiCategories = '';
  try {
    const aiResp = await aiService.summarizeRequirement(reqData);
    aiSummary = aiResp.summary;
    aiCategories = aiResp.categories;
  } catch (err) {
    console.error('AI Error', err);
  }

  Requirement.updateRequirementStatus(id, 'approved', aiSummary, aiCategories);
  res.json({ message: 'Requirement approved', aiSummary, aiCategories });
};

// Reject a requirement
exports.rejectRequirement = (req, res) => {
  const id = req.params.id;
  const reqData = Requirement.getRequirementById(id);
  if (!reqData) return res.status(404).json({ message: 'Requirement not found' });
  Requirement.updateRequirementStatus(id, 'rejected');
  res.json({ message: 'Requirement rejected' });
};
