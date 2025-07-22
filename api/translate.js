import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }
  }

  const { text, targetLang } = body;

  const langPrompt = {
    "영어": "Translate the following Korean text to English.",
    "스페인어": "Translate the following Korean text to Spanish.",
    "베트남어": "Translate the following Korean text to Vietnamese.",
    "중국어": "Translate the following Korean text to Chinese.",
  };

  try {
    const response = await axios.post(
      "https://guest-api.sktax.chat/v1/chat/completions",
      {
        model: "ax4",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: `${langPrompt[targetLang]}\n\n${text}` }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer sktax-XyeKFrq67ZjS4EpsDlrHHXV8it`,
          "Content-Type": "application/json"
        }
      }
    );
    const result = response.data.choices[0].message.content;
    res.status(200).json({ result });
  } catch (error) {
    // 에러 상세를 프론트로 전달
    res.status(500).json({
      error: "번역 실패",
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
}