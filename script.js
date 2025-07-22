// 번역 대상 언어 목록
const LANGUAGES = [
  { name: '영어', code: 'English' },
  { name: '중국어', code: 'Chinese' },
  { name: '베트남어', code: 'Vietnamese' },
  { name: '스페인어', code: 'Spanish' },
  { name: '말레이시아어', code: 'Malay' },
];

const API_URL = 'https://guest-api.sktax.chat/v1/chat/completions';
const API_KEY = 'sktax-XyeKFrq67ZjS4EpsDlrHHXV8it';
const MODEL = 'ax4';

const sourceText = document.getElementById('sourceText');
const targetText = document.getElementById('targetText');
const translateBtn = document.getElementById('translateBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const languageButtons = document.querySelectorAll('.lang-btn');
const targetLanguageSelect = document.getElementById('targetLanguage');
const copyResultBtn = document.getElementById('copyResult');
const clearSourceBtn = document.getElementById('clearSource');
const sourceCharCount = document.getElementById('sourceCharCount');
const targetCharCount = document.getElementById('targetCharCount');

let selectedLang = '영어';

// 언어 버튼 클릭 시
languageButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    languageButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedLang = btn.dataset.lang;
    targetLanguageSelect.value = selectedLang;
  });
});

// 셀렉트 박스 변경 시
if (targetLanguageSelect) {
  targetLanguageSelect.addEventListener('change', (e) => {
    selectedLang = e.target.value;
    languageButtons.forEach(btn => {
      if (btn.dataset.lang === selectedLang) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  });
}

// 글자수 표시
sourceText.addEventListener('input', () => {
  sourceCharCount.textContent = `${sourceText.value.length}자`;
});
targetText.addEventListener('input', () => {
  targetCharCount.textContent = `${targetText.value.length}자`;
});

// 지우기 버튼
clearSourceBtn.addEventListener('click', () => {
  sourceText.value = '';
  sourceCharCount.textContent = '0자';
});

// 복사 버튼
copyResultBtn.addEventListener('click', () => {
  if (targetText.value) {
    navigator.clipboard.writeText(targetText.value);
    copyResultBtn.textContent = '복사됨!';
    setTimeout(() => {
      copyResultBtn.textContent = '복사';
    }, 1200);
  }
});

// 번역 버튼
translateBtn.addEventListener('click', async () => {
  const text = sourceText.value.trim();
  if (!text) {
    alert('번역할 텍스트를 입력하세요.');
    return;
  }
  translateBtn.disabled = true;
  loadingSpinner.style.display = 'inline-block';
  targetText.value = '';
  targetCharCount.textContent = '0자';

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLang: selectedLang,
      }),
    });
    const data = await response.json();
    if (data.result) {
      targetText.value = data.result;
      targetCharCount.textContent = `${data.result.length}자`;
    } else {
      targetText.value = '번역 실패';
      alert(
        `에러: ${data.error}\n상세: ${data.message}\n응답: ${JSON.stringify(data.response)}\n상태: ${data.status}`
      );
    }
  } catch (e) {
    targetText.value = '[오류 발생: 번역 실패]';
  } finally {
    translateBtn.disabled = false;
    loadingSpinner.style.display = 'none';
  }
});

// 초기 상태
languageButtons[0].classList.add('active');
targetLanguageSelect.value = '영어'; 