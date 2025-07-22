LLM 번역기 (Vercel 배포용)
========================

이 프로젝트는 SKT AX4(OpenAI 호환) API를 활용하여 한국어를 영어, 중국어, 베트남어, 스페인어 등으로 번역해주는 웹 번역기입니다.

---

■ 주요 기능
- 한국어 → 영어, 중국어, 베트남어, 스페인어, 말레이시아어 번역
- 실시간 번역 결과 표시 및 복사 기능
- Vercel 무료 플랜으로 간편하게 배포 가능

---

■ 설치 및 실행 방법 (로컬)
1. Node.js와 npm이 설치되어 있어야 합니다.
2. 필요한 패키지 설치:
   npm install
3. 로컬 서버 실행:
   node server.js
4. 브라우저에서 index.html 파일을 열어 사용

---

■ Vercel 배포 방법
1. Vercel 계정 생성 및 로그인 (https://vercel.com/)
2. Vercel CLI 설치:
   npm install -g vercel
3. 프로젝트 폴더에서 배포:
   vercel
4. 배포 후 제공되는 URL로 접속하여 사용

---

■ 폴더/파일 구조
- index.html : 메인 웹페이지
- style.css : 스타일시트
- script.js : 프론트엔드 JS
- api/translate.js : Vercel 서버리스 함수(번역 API)
- package.json : 의존성 및 설정

---

■ 참고/주의사항
- SKT AX4 API Key는 server 코드에만 포함되어야 하며, 프론트엔드에 노출되면 안 됩니다.
- Vercel Functions 로그에서 에러를 확인할 수 있습니다.
- context length(문맥 길이) 제한이 있으니 너무 긴 텍스트는 나눠서 번역하세요.

---

■ 문의
추가 문의나 개선 요청은 언제든 연락 주세요. 