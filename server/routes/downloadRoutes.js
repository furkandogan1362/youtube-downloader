const express = require('express');
const { downloadVideo } = require('../controllers/downloadController');

const router = express.Router();

// YouTube video indirme endpoint'i
router.post('/download', downloadVideo);

module.exports = router;
