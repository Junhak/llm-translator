import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
const fetch2 = fetch.default || fetch;

const app = express();
const PORT = 3000;

const API_URL = 'https://guest-api.sktax.chat/v1/chat/completions';
const API_KEY = 'sktax-XyeKFrq67ZjS4EpsDlrHHXV8it';
const MODEL = 'ax4';

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/api/translate', async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text || !targetLang) {
    return res.status(400).json({ error: 'text와 targetLang을 모두 보내주세요.' });
  }

  // 언어 코드 매핑
  const langMap = {
    '영어': 'English',
    '중국어': 'Chinese',
    '베트남어': 'Vietnamese',
    '스페인어': 'Spanish',
    '말레이시아어': 'Malay',
  };
  const langCode = langMap[targetLang] || 'English';
  const prompt = `다음 한국어 문장을 ${langCode}로 자연스럽게 번역해줘.\n\n한국어: ${text}\n${langCode}:`;

  try {
    const response = await fetch2(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      res.json({ result: data.choices[0].message.content.trim() });
    } else {
      res.status(500).json({ error: '번역 결과를 가져오지 못했습니다.' });
    }
  } catch (e) {
    res.status(500).json({ error: '번역 서버 오류' });
  }
});

app.listen(PORT, () => {
  console.log(`프록시 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 