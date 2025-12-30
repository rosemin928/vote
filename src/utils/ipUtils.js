/**
 * 클라이언트의 실제 IP 주소를 추출합니다.
 * 프록시나 로드 밸런서를 통한 요청도 처리합니다.
 * 
 * @param {Object} request - Express request 객체
 * @returns {string} 클라이언트 IP 주소
 */
function getClientIpAddress(request) {
  return request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         request.headers['x-real-ip'] ||
         request.connection.remoteAddress ||
         request.socket.remoteAddress ||
         'unknown';
}

module.exports = {
  getClientIpAddress
};
