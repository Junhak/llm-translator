class RealTimeTranslator {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.currentText = '';
        this.translationHistory = [];
        
        this.initializeElements();
        this.initializeSpeechRecognition();
        this.bindEvents();
    }

    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.statusText = document.getElementById('statusText');
        this.micIndicator = document.getElementById('micIndicator');
        this.originalText = document.getElementById('originalText');
        this.translatedText = document.getElementById('translatedText');
        this.translationHistory = document.getElementById('translationHistory');
        this.sourceLang = document.getElementById('sourceLang');
        this.targetLang = document.getElementById('targetLang');
    }

    initializeSpeechRecognition() {
        // Web Speech API 지원 확인
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showError('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.');
            return;
        }

        // SpeechRecognition 객체 생성
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        // 음성 인식 설정
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.getLanguageCode(this.sourceLang.value);

        // 이벤트 리스너 설정
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI();
            this.statusText.textContent = '음성을 인식하고 있습니다...';
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // 현재 텍스트 업데이트
            this.currentText = finalTranscript + interimTranscript;
            this.updateOriginalText(this.currentText);

            // 최종 결과가 있으면 번역
            if (finalTranscript.trim()) {
                this.translateText(finalTranscript.trim());
            }
        };

        this.recognition.onerror = (event) => {
            console.error('음성 인식 오류:', event.error);
            this.showError(`음성 인식 오류: ${event.error}`);
            this.stopListening();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI();
            this.statusText.textContent = '음성 인식이 중지되었습니다.';
        };
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startListening());
        this.stopBtn.addEventListener('click', () => this.stopListening());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        
        this.sourceLang.addEventListener('change', () => {
            if (this.recognition) {
                this.recognition.lang = this.getLanguageCode(this.sourceLang.value);
            }
        });
    }

    startListening() {
        if (!this.recognition) {
            this.showError('음성 인식을 초기화할 수 없습니다.');
            return;
        }

        try {
            this.recognition.start();
        } catch (error) {
            console.error('음성 인식 시작 오류:', error);
            this.showError('음성 인식을 시작할 수 없습니다.');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    clearAll() {
        this.currentText = '';
        this.updateOriginalText('');
        this.updateTranslatedText('');
        this.translationHistory.innerHTML = '';
    }

    updateUI() {
        this.startBtn.disabled = this.isListening;
        this.stopBtn.disabled = !this.isListening;
        
        if (this.isListening) {
            this.micIndicator.classList.add('listening');
        } else {
            this.micIndicator.classList.remove('listening');
        }
    }

    updateOriginalText(text) {
        this.originalText.textContent = text;
        if (text) {
            this.originalText.classList.add('has-content');
        } else {
            this.originalText.classList.remove('has-content');
        }
    }

    updateTranslatedText(text) {
        this.translatedText.textContent = text;
        if (text) {
            this.translatedText.classList.add('has-content');
        } else {
            this.translatedText.classList.remove('has-content');
        }
    }

    async translateText(text) {
        const sourceLang = this.sourceLang.value;
        const targetLang = this.targetLang.value;

        if (sourceLang === targetLang) {
            this.updateTranslatedText(text);
            return;
        }

        try {
            this.statusText.textContent = '번역 중...';
            
            // 여러 번역 방법 시도
            let translation = null;
            
            // 1. LibreTranslate API 시도
            try {
                translation = await this.translateWithLibreTranslate(text, sourceLang, targetLang);
            } catch (error) {
                console.log('LibreTranslate 실패, 다른 방법 시도...');
            }
            
            // 2. MyMemory API 시도 (LibreTranslate 실패 시)
            if (!translation) {
                try {
                    translation = await this.translateWithMyMemory(text, sourceLang, targetLang);
                } catch (error) {
                    console.log('MyMemory 실패, 백업 번역 사용...');
                }
            }
            
            // 3. 백업 번역 사용
            if (!translation) {
                translation = this.backupTranslate(text, sourceLang, targetLang);
            }
            
            this.updateTranslatedText(translation);
            this.addToHistory(text, translation);
            this.statusText.textContent = '번역 완료!';
            
        } catch (error) {
            console.error('번역 오류:', error);
            this.showError('번역 중 오류가 발생했습니다.');
            
            const backupTranslation = this.backupTranslate(text, sourceLang, targetLang);
            this.updateTranslatedText(backupTranslation);
            this.addToHistory(text, backupTranslation);
        }
    }

    async translateWithLibreTranslate(text, sourceLang, targetLang) {
        // LibreTranslate API 사용 (무료)
        const response = await fetch('https://libretranslate.de/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: sourceLang,
                target: targetLang,
                format: 'text'
            })
        });

        if (!response.ok) {
            throw new Error('번역 API 오류');
        }

        const data = await response.json();
        return data.translatedText;
    }

    async translateWithMyMemory(text, sourceLang, targetLang) {
        // MyMemory API 사용 (무료, 일일 제한 있음)
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('MyMemory API 오류');
        }

        const data = await response.json();
        
        if (data.responseStatus === 200) {
            return data.responseData.translatedText;
        } else {
            throw new Error('번역 실패');
        }
    }

    backupTranslate(text, sourceLang, targetLang) {
        // 확장된 백업 번역 (간단 예시)
        const translations = {
            'ko-en': {
                '안녕하세요': 'Hello',
                '감사합니다': 'Thank you',
                '좋아요': 'Good',
                '네': 'Yes',
                '아니요': 'No',
                '오늘 날씨 어때요?': 'How is the weather today?',
                '지금 몇 시에요?': 'What time is it now?',
                '도와주세요': 'Help me',
                '사랑해요': 'I love you',
                '배고파요': 'I am hungry',
                '물 주세요': 'Please give me water'
            },
            'en-ko': {
                'hello': '안녕하세요',
                'thank you': '감사합니다',
                'good': '좋아요',
                'yes': '네',
                'no': '아니요',
                'how is the weather today\?': '오늘 날씨 어때요?',
                'what time is it now\?': '지금 몇 시에요?',
                'help me': '도와주세요',
                'i love you': '사랑해요',
                'i am hungry': '배고파요',
                'please give me water': '물 주세요'
            },
            'ko-ja': {
                '안녕하세요': 'こんにちは',
                '감사합니다': 'ありがとうございます',
                '사랑해요': '愛しています',
                '도와주세요': '助けてください',
                '배고파요': 'お腹が空きました'
            },
            'ja-ko': {
                'こんにちは': '안녕하세요',
                'ありがとうございます': '감사합니다',
                '愛しています': '사랑해요',
                '助けてください': '도와주세요',
                'お腹が空きました': '배고파요'
            },
            'ko-zh': {
                '안녕하세요': '你好',
                '감사합니다': '谢谢',
                '사랑해요': '我爱你',
                '도와주세요': '请帮我',
                '배고파요': '我饿了'
            },
            'zh-ko': {
                '你好': '안녕하세요',
                '谢谢': '감사합니다',
                '我爱你': '사랑해요',
                '请帮我': '도와주세요',
                '我饿了': '배고파요'
            }
        };

        const key = `${sourceLang}-${targetLang}`;
        const translationMap = translations[key] || {};
        
        // 간단한 단어 매칭
        let translatedText = text;
        for (const [original, translated] of Object.entries(translationMap)) {
            translatedText = translatedText.replace(new RegExp(original, 'gi'), translated);
        }

        return translatedText || `[번역: ${text}]`;
    }

    addToHistory(originalText, translatedText) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const timestamp = new Date().toLocaleTimeString();
        
        historyItem.innerHTML = `
            <div class="original-text">${originalText}</div>
            <div class="translated-text">${translatedText}</div>
            <div class="timestamp">${timestamp}</div>
        `;

        this.translationHistory.insertBefore(historyItem, this.translationHistory.firstChild);
    }

    getLanguageCode(lang) {
        const languageCodes = {
            'ko': 'ko-KR',
            'en': 'en-US',
            'ja': 'ja-JP',
            'zh': 'zh-CN',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE'
        };
        return languageCodes[lang] || 'ko-KR';
    }

    showError(message) {
        this.statusText.textContent = message;
        this.statusText.style.color = '#dc3545';
        
        setTimeout(() => {
            this.statusText.style.color = '#555';
        }, 3000);
    }
}

// 언어 교환 함수
function swapLanguages() {
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    
    const tempValue = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = tempValue;
    
    // 음성 인식 언어 업데이트
    if (window.translator && window.translator.recognition) {
        window.translator.recognition.lang = window.translator.getLanguageCode(sourceLang.value);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.translator = new RealTimeTranslator();
});

// 브라우저 호환성 체크
if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    document.addEventListener('DOMContentLoaded', () => {
        const statusText = document.getElementById('statusText');
        statusText.textContent = '이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.';
        statusText.style.color = '#dc3545';
    });
} 