const Requirement = require('../models/requirementModel');

// Handle public buyer requirement form submission
exports.submitForm = (req, res) => {
  const {
    companyName,
    contactName,
    email,
    phone,
    category,
    details,
    quantity,
    targetPrice,
    deliveryLocation,
    notes
  } = req.body;

  if (!companyName || !contactName || !email || !phone || !category || !details || !quantity || !targetPrice || !deliveryLocation) {
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }

  const id = Requirement.createRequirement({
    companyName,
    contactName,
    email,
    phone,
    category,
    details,
    quantity,
    targetPrice,
    deliveryLocation,
    notes
  });

  res.json({ message: 'Form submitted', id });
};
