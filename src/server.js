const createApp = require('./app');
const { PORT } = require('../config/constants');

// Express 앱 생성
const app = createApp();

// 서버 시작
app.listen(PORT, () => {
  console.log(`🍜 짜장면 vs 짬뽕 투표 서버가 포트 ${PORT}에서 실행 중입니다!`);
  console.log(`투표 페이지: http://localhost:${PORT}/vote`);
  console.log(`결과 페이지: http://localhost:${PORT}/result`);
});
