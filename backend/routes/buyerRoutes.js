const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyerController');

router.post('/buyer-form', buyerController.submitForm);

module.exports = router;
