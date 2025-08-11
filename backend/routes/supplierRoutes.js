const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const auth = require('../middlewares/auth');

router.post('/supplier/signup', supplierController.signup);
router.post('/supplier/login', supplierController.login);
router.get('/supplier/requirements', auth('supplier'), supplierController.getRequirements);

module.exports = router;
