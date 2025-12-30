const path = require('path');

// 서버 설정
const PORT = process.env.PORT || 3000;

// 투표 설정
const VOTE_COOLDOWN_HOURS = 1;

// 파일 경로 설정
const DATA_DIRECTORY = path.join(__dirname, '..', 'data');
const VOTES_FILE_PATH = path.join(DATA_DIRECTORY, 'votes.json');

// 허용된 선택지
const VALID_CHOICES = ['jajangmyeon', 'jjamppong'];

// 기본 투표 데이터
const DEFAULT_VOTES_DATA = {
  jajangmyeon: 0,
  jjamppong: 0,
  voters: []
};

module.exports = {
  PORT,
  VOTE_COOLDOWN_HOURS,
  DATA_DIRECTORY,
  VOTES_FILE_PATH,
  VALID_CHOICES,
  DEFAULT_VOTES_DATA
};
