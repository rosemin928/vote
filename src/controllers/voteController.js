const { VALID_CHOICES, VOTE_COOLDOWN_HOURS } = require('../../config/constants');
const { getClientIpAddress } = require('../utils/ipUtils');
const { checkDuplicateVote, processVote, getVoteResults } = require('../services/voteService');

/**
 * 투표를 처리하는 컨트롤러
 * POST /api/vote
 */
async function handleVote(request, response) {
  const { choice } = request.body;
  const ipAddress = getClientIpAddress(request);
  
  // 선택지 유효성 검사
  if (!choice || !VALID_CHOICES.includes(choice)) {
    return response.status(400).json({
      success: false,
      message: '올바른 선택지를 입력해주세요.'
    });
  }
  
  // 중복 투표 검사
  const votesData = require('../services/voteService').initializeVotesData();
  const duplicateCheck = checkDuplicateVote(votesData, ipAddress);
  
  if (duplicateCheck.isDuplicate) {
    return response.status(429).json({
      success: false,
      message: `투표는 ${VOTE_COOLDOWN_HOURS}시간에 한 번만 가능합니다. ${duplicateCheck.remainingMinutes}분 후에 다시 시도해주세요.`,
      remainingMinutes: duplicateCheck.remainingMinutes
    });
  }
  
  // 투표 처리
  const result = processVote(choice, ipAddress);
  
  if (!result.success) {
    return response.status(500).json({
      success: false,
      message: '투표 처리 중 오류가 발생했습니다.'
    });
  }
  
  // 쿠키 설정 (쿨다운 시간)
  response.cookie('voted', 'true', {
    maxAge: VOTE_COOLDOWN_HOURS * 60 * 60 * 1000,
    httpOnly: true
  });
  
  return response.json({
    success: true,
    message: '투표가 완료되었습니다!',
    results: result.results
  });
}

/**
 * 투표 결과를 조회하는 컨트롤러
 * GET /api/results
 */
async function handleGetResults(request, response) {
  try {
    const results = getVoteResults();
    
    return response.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('결과 조회 오류:', error);
    return response.status(500).json({
      success: false,
      message: '결과 조회 중 오류가 발생했습니다.'
    });
  }
}

module.exports = {
  handleVote,
  handleGetResults
};
