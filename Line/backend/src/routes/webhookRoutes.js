const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/webhookController');

// LINE Webhook endpoint
router.post('/line/:oa_id', WebhookController.handleWebhook);

module.exports = router;
