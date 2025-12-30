const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const voteRoutes = require('./routes/voteRoutes');

/**
 * Express 애플리케이션을 생성하고 설정합니다.
 * @returns {Object} 설정된 Express 앱
 */
function createApp() {
  const app = express();
  
  // 미들웨어 설정
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  
  // 정적 파일 제공 (CSS, JS)
  app.use('/css', express.static(path.join(__dirname, '../public/css')));
  app.use('/js', express.static(path.join(__dirname, '../public/js')));
  
  // 라우트 설정
  app.use(voteRoutes);
  
  // 404 에러 핸들러
  app.use((request, response) => {
    response.status(404).json({
      success: false,
      message: '요청한 페이지를 찾을 수 없습니다.'
    });
  });
  
  // 에러 핸들러
  app.use((error, request, response, next) => {
    console.error('서버 오류:', error);
    response.status(500).json({
      success: false,
      message: '서버 내부 오류가 발생했습니다.'
    });
  });
  
  return app;
}

module.exports = createApp;
