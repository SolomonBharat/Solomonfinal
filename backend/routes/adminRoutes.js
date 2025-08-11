const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');

router.post('/admin/login', adminController.login);
router.get('/admin/requirements', auth('admin'), adminController.getRequirements);
router.post('/admin/approve/:id', auth('admin'), adminController.approveRequirement);
router.post('/admin/reject/:id', auth('admin'), adminController.rejectRequirement);

module.exports = router;
