// 번역 대상 언어 코드와 이름 매핑
const LANG_MAP = {
  en: '영어',
  zh: '중국어',
  es: '스페인어',
  vi: '베트남어',
};
// API 설정 - proxy.py에서 가져온 설정
//const API_URL = 'https://guest-api.sktax.chat/v1/chat/completions';
//const API_URL = 'https://cors-anywhere.herokuapp.com/https://guest-api.sktax.chat/v1/chat/completions';
const API_URL = 'https://api.allorigins.win/raw?url=https://guest-api.sktax.chat/v1/chat/completions';

const API_KEY = 'sktax-XyeKFrq67ZjS4EpsDlrHHXV8it';

const inputText = document.getElementById('inputText');
const targetLang = document.getElementById('targetLang');
const translateBtn = document.getElementById('translateBtn');
const resultText = document.getElementById('resultText');
const copyBtn = document.getElementById('copyBtn');
const historyList = document.getElementById('historyList');
const darkModeToggle = document.getElementById('darkModeToggle');

// 번역 기록 불러오기
function loadHistory() {
  const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
  historyList.innerHTML = '';
  history.slice().reverse().forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="history-from">${item.from} → ${item.to}</span><span class="history-to">${item.result}</span>`;
    historyList.appendChild(li);
  });
}

// 번역 기록 저장
function saveHistory(from, to, result) {
  const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
  history.push({ from, to, result });
  localStorage.setItem('translationHistory', JSON.stringify(history));
  loadHistory();
}

// 번역 실행 - 직접 API 호출로 변경
async function translate() {
  const text = inputText.value.trim();
  const lang = targetLang.value;
  if (!text) {
    resultText.textContent = '번역할 문장을 입력하세요.';
    return;
  }
  resultText.textContent = '번역 중...';
  
  let prompt = `다음 한국어 문장을 ${LANG_MAP[lang]}로 번역해줘.\n문장: ${text}`;
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'ax4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    
    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const translated = data.choices[0].message.content.trim();
      resultText.textContent = translated;
      saveHistory(text, LANG_MAP[lang], translated);
    } else {
      resultText.textContent = '번역 결과를 받아올 수 없습니다.';
    }
  } catch (e) {
    console.error('Translation error:', e);
    resultText.textContent = '번역 중 오류가 발생했습니다.';
  }
}

// 복사 버튼 기능
copyBtn.addEventListener('click', () => {
  const text = resultText.textContent;
  if (text) {
    navigator.clipboard.writeText(text);
    copyBtn.textContent = '✅ 복사됨';
    setTimeout(() => {
      copyBtn.textContent = '📋 복사';
    }, 1200);
  }
});

// 번역 버튼 이벤트
translateBtn.addEventListener('click', translate);

// 엔터로 번역
inputText.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    translate();
  }
});

// 다크모드 토글
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}
darkModeToggle.addEventListener('click', toggleDarkMode);

// 다크모드 상태 복원
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark');
}

// 기록 불러오기
loadHistory(); 
