const express = require('express');
const path = require('path');
const { handleVote, handleGetResults } = require('../controllers/voteController');

const router = express.Router();

// HTML 페이지 라우트
router.get('/', (request, response) => {
  response.redirect('/vote');
});

router.get('/vote', (request, response) => {
  response.sendFile(path.join(__dirname, '../../public/views/vote.html'));
});

router.get('/result', (request, response) => {
  response.sendFile(path.join(__dirname, '../../public/views/result.html'));
});

// API 라우트
router.post('/api/vote', handleVote);
router.get('/api/results', handleGetResults);

module.exports = router;
