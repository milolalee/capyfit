const express = require('express');
const router = express.Router();
const OAController = require('../controllers/oaController');

// Create OA account
router.post('/', OAController.createOA);

// Get all OA accounts
router.get('/', OAController.getOAs);

// Get specific OA account
router.get('/:oa_id', OAController.getOA);

// Update OA account
router.put('/:oa_id', OAController.updateOA);

// Delete OA account
router.delete('/:oa_id', OAController.deleteOA);

module.exports = router;
