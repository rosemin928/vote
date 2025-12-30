const fs = require('fs');
const path = require('path');
const { 
  VOTES_FILE_PATH, 
  DATA_DIRECTORY,
  DEFAULT_VOTES_DATA, 
  VOTE_COOLDOWN_HOURS 
} = require('../../config/constants');

/**
 * 투표 데이터를 초기화하거나 로드합니다.
 * 파일이 없으면 기본 데이터로 생성합니다.
 * 
 * @returns {Object} 투표 데이터
 */
function initializeVotesData() {
  // data 디렉토리가 없으면 생성
  if (!fs.existsSync(DATA_DIRECTORY)) {
    fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
  }

  if (!fs.existsSync(VOTES_FILE_PATH)) {
    fs.writeFileSync(VOTES_FILE_PATH, JSON.stringify(DEFAULT_VOTES_DATA, null, 2));
    return DEFAULT_VOTES_DATA;
  }
  
  try {
    const data = fs.readFileSync(VOTES_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('투표 데이터 읽기 오류:', error);
    fs.writeFileSync(VOTES_FILE_PATH, JSON.stringify(DEFAULT_VOTES_DATA, null, 2));
    return DEFAULT_VOTES_DATA;
  }
}

/**
 * 투표 데이터를 파일에 저장합니다.
 * 
 * @param {Object} data - 저장할 투표 데이터
 * @returns {boolean} 저장 성공 여부
 */
function saveVotesData(data) {
  try {
    fs.writeFileSync(VOTES_FILE_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('투표 데이터 저장 오류:', error);
    return false;
  }
}

/**
 * 중복 투표 여부를 검사합니다.
 * IP 주소와 타임스탬프를 기반으로 확인합니다.
 * 
 * @param {Object} votesData - 투표 데이터
 * @param {string} ipAddress - 클라이언트 IP 주소
 * @returns {Object} 중복 여부 및 상세 정보
 */
function checkDuplicateVote(votesData, ipAddress) {
  const currentTime = new Date();
  const voterRecord = votesData.voters.find(voter => voter.ipAddress === ipAddress);
  
  if (!voterRecord) {
    return { isDuplicate: false };
  }
  
  const lastVoteTime = new Date(voterRecord.timestamp);
  const hoursSinceLastVote = (currentTime - lastVoteTime) / (1000 * 60 * 60);
  
  if (hoursSinceLastVote < VOTE_COOLDOWN_HOURS) {
    const remainingMinutes = Math.ceil((VOTE_COOLDOWN_HOURS * 60) - (hoursSinceLastVote * 60));
    return {
      isDuplicate: true,
      remainingMinutes,
      lastChoice: voterRecord.choice
    };
  }
  
  return { isDuplicate: false };
}

/**
 * 투표를 처리하고 데이터를 업데이트합니다.
 * 
 * @param {string} choice - 선택한 항목 (jajangmyeon 또는 jjamppong)
 * @param {string} ipAddress - 투표자 IP 주소
 * @returns {Object} 처리 결과
 */
function processVote(choice, ipAddress) {
  const votesData = initializeVotesData();
  
  // 투표 수 증가
  votesData[choice]++;
  
  // 기존 투표자 정보 제거 (IP 기준)
  votesData.voters = votesData.voters.filter(voter => voter.ipAddress !== ipAddress);
  
  // 새로운 투표자 정보 추가
  votesData.voters.push({
    ipAddress,
    choice,
    timestamp: new Date().toISOString()
  });
  
  // 데이터 저장
  const saved = saveVotesData(votesData);
  
  return {
    success: saved,
    results: {
      jajangmyeon: votesData.jajangmyeon,
      jjamppong: votesData.jjamppong
    }
  };
}

/**
 * 투표 결과를 조회하고 통계를 계산합니다.
 * 
 * @returns {Object} 투표 결과 및 통계
 */
function getVoteResults() {
  const votesData = initializeVotesData();
  
  const totalVotes = votesData.jajangmyeon + votesData.jjamppong;
  const jajangmyeonPercentage = totalVotes > 0 
    ? ((votesData.jajangmyeon / totalVotes) * 100).toFixed(1)
    : 0;
  const jjamppongPercentage = totalVotes > 0
    ? ((votesData.jjamppong / totalVotes) * 100).toFixed(1)
    : 0;
  
  return {
    jajangmyeon: votesData.jajangmyeon,
    jjamppong: votesData.jjamppong,
    total: totalVotes,
    percentages: {
      jajangmyeon: jajangmyeonPercentage,
      jjamppong: jjamppongPercentage
    }
  };
}

module.exports = {
  initializeVotesData,
  saveVotesData,
  checkDuplicateVote,
  processVote,
  getVoteResults
};
