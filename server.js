const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const application = express();
const PORT = process.env.PORT || 3000;
const VOTES_FILE_PATH = path.join(__dirname, 'votes.json');
const VOTE_COOLDOWN_HOURS = 1;

// 미들웨어 설정
application.use(express.json());
application.use(express.urlencoded({ extended: true }));
application.use(cookieParser());
application.use(express.static('public'));

// 투표 데이터 초기화 함수
function initializeVotesData() {
  const defaultData = {
    jajangmyeon: 0,
    jjamppong: 0,
    voters: []
  };
  
  if (!fs.existsSync(VOTES_FILE_PATH)) {
    fs.writeFileSync(VOTES_FILE_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  
  try {
    const data = fs.readFileSync(VOTES_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('투표 데이터 읽기 오류:', error);
    fs.writeFileSync(VOTES_FILE_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

// 투표 데이터 저장 함수
function saveVotesData(data) {
  try {
    fs.writeFileSync(VOTES_FILE_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('투표 데이터 저장 오류:', error);
    return false;
  }
}

// IP 주소 추출 함수
function getClientIpAddress(request) {
  return request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         request.headers['x-real-ip'] ||
         request.connection.remoteAddress ||
         request.socket.remoteAddress ||
         'unknown';
}

// 중복 투표 검사 함수
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

// 라우트: 투표 페이지
application.get('/vote', (request, response) => {
  response.sendFile(path.join(__dirname, 'public', 'vote.html'));
});

// 라우트: 결과 페이지
application.get('/result', (request, response) => {
  response.sendFile(path.join(__dirname, 'public', 'result.html'));
});

// API: 투표 처리 (POST)
application.post('/api/vote', (request, response) => {
  const { choice } = request.body;
  const ipAddress = getClientIpAddress(request);
  
  // 선택지 유효성 검사
  if (!choice || !['jajangmyeon', 'jjamppong'].includes(choice)) {
    return response.status(400).json({
      success: false,
      message: '올바른 선택지를 입력해주세요.'
    });
  }
  
  // 투표 데이터 로드
  const votesData = initializeVotesData();
  
  // 중복 투표 검사
  const duplicateCheck = checkDuplicateVote(votesData, ipAddress);
  if (duplicateCheck.isDuplicate) {
    return response.status(429).json({
      success: false,
      message: `투표는 ${VOTE_COOLDOWN_HOURS}시간에 한 번만 가능합니다. ${duplicateCheck.remainingMinutes}분 후에 다시 시도해주세요.`,
      remainingMinutes: duplicateCheck.remainingMinutes
    });
  }
  
  // 투표 처리
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
  if (!saveVotesData(votesData)) {
    return response.status(500).json({
      success: false,
      message: '투표 처리 중 오류가 발생했습니다.'
    });
  }
  
  // 쿠키 설정 (1시간)
  response.cookie('voted', 'true', {
    maxAge: VOTE_COOLDOWN_HOURS * 60 * 60 * 1000,
    httpOnly: true
  });
  
  response.json({
    success: true,
    message: '투표가 완료되었습니다!',
    results: {
      jajangmyeon: votesData.jajangmyeon,
      jjamppong: votesData.jjamppong
    }
  });
});

// API: 투표 결과 조회 (GET)
application.get('/api/results', (request, response) => {
  const votesData = initializeVotesData();
  
  const totalVotes = votesData.jajangmyeon + votesData.jjamppong;
  const jajangmyeonPercentage = totalVotes > 0 
    ? ((votesData.jajangmyeon / totalVotes) * 100).toFixed(1)
    : 0;
  const jjamppongPercentage = totalVotes > 0
    ? ((votesData.jjamppong / totalVotes) * 100).toFixed(1)
    : 0;
  
  response.json({
    success: true,
    results: {
      jajangmyeon: votesData.jajangmyeon,
      jjamppong: votesData.jjamppong,
      total: totalVotes,
      percentages: {
        jajangmyeon: jajangmyeonPercentage,
        jjamppong: jjamppongPercentage
      }
    }
  });
});

// 루트 경로 - 투표 페이지로 리다이렉트
application.get('/', (request, response) => {
  response.redirect('/vote');
});

// 서버 시작
application.listen(PORT, () => {
  console.log(`🍜 짜장면 vs 짬뽕 투표 서버가 포트 ${PORT}에서 실행 중입니다!`);
  console.log(`투표 페이지: http://localhost:${PORT}/vote`);
  console.log(`결과 페이지: http://localhost:${PORT}/result`);
});
