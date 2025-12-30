// 투표 폼 처리
document.addEventListener('DOMContentLoaded', () => {
  const voteForm = document.getElementById('voteForm');
  
  if (voteForm) {
    voteForm.addEventListener('submit', handleVoteSubmit);
  }
});

// 메시지 표시 함수
function showMessage(text, type = 'success') {
  const messageElement = document.getElementById('message');
  
  if (!messageElement) return;
  
  messageElement.textContent = text;
  messageElement.className = `message ${type} show`;
  
  // 3초 후 메시지 숨기기
  setTimeout(() => {
    messageElement.classList.remove('show');
  }, 3000);
}

// 투표 제출 처리
async function handleVoteSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const choice = formData.get('choice');
  const submitButton = event.target.querySelector('button[type="submit"]');
  
  if (!choice) {
    showMessage('선택지를 선택해주세요.', 'error');
    return;
  }
  
  // 버튼 비활성화
  submitButton.disabled = true;
  submitButton.textContent = '투표 중...';
  
  try {
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ choice }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      showMessage(data.message, 'success');
      
      // 1초 후 결과 페이지로 이동
      setTimeout(() => {
        window.location.href = '/result';
      }, 1000);
    } else {
      showMessage(data.message, 'error');
      submitButton.disabled = false;
      submitButton.textContent = '투표하기';
    }
  } catch (error) {
    console.error('투표 처리 오류:', error);
    showMessage('투표 처리 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    submitButton.disabled = false;
    submitButton.textContent = '투표하기';
  }
}
