/**
 * 투표 결과를 서버에서 가져와 화면에 표시합니다.
 */
async function loadResults() {
  const loadingElement = document.getElementById('loading');
  const resultsElement = document.getElementById('results');
  
  try {
    loadingElement.classList.remove('hidden');
    resultsElement.classList.add('hidden');
    
    const response = await fetch('/api/results');
    const data = await response.json();
    
    if (data.success) {
      const { results } = data;
      
      // 짜장면 결과 업데이트
      document.getElementById('jajangmyeonCount').textContent = `${results.jajangmyeon}표`;
      document.getElementById('jajangmyeonPercent').textContent = `${results.percentages.jajangmyeon}%`;
      document.getElementById('jajangmyeonBar').style.width = `${results.percentages.jajangmyeon}%`;
      
      // 짬뽕 결과 업데이트
      document.getElementById('jjamppongCount').textContent = `${results.jjamppong}표`;
      document.getElementById('jjamppongPercent').textContent = `${results.percentages.jjamppong}%`;
      document.getElementById('jjamppongBar').style.width = `${results.percentages.jjamppong}%`;
      
      // 총 투표 수 업데이트
      document.getElementById('totalVotes').textContent = results.total;
      
      // 결과 화면 표시
      loadingElement.classList.add('hidden');
      resultsElement.classList.remove('hidden');
    }
  } catch (error) {
    console.error('결과 로드 오류:', error);
    loadingElement.innerHTML = '<p class="error">결과를 불러오는데 실패했습니다. 다시 시도해주세요.</p>';
  }
}

// 페이지 로드 시 결과 표시
window.addEventListener('DOMContentLoaded', loadResults);
