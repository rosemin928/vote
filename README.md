# 🍜 짜장면 vs 짬뽕 투표 앱

실시간 투표 결과를 확인할 수 있는 웹 애플리케이션입니다.

## 📋 프로젝트 개요

사용자가 짜장면과 짬뽕 중 하나를 선택해 투표하고, 현재까지의 투표 결과를 실시간으로 확인할 수 있는 웹페이지입니다.

## ✨ 주요 기능

- **투표 페이지** (`/vote`)
  - 🍜 짜장면 / 🍲 짬뽕 중 선택
  - 투표 완료 후 자동으로 결과 페이지로 이동
  
- **결과 페이지** (`/result`)
  - 실시간 투표 결과 표시 (막대 그래프, 퍼센트)
  - 총 투표 수 확인
  - 다시 투표하기 링크

- **어뷰징 방지 시스템**
  - IP 주소 기반 중복 투표 차단
  - 쿠키를 통한 클라이언트 측 투표 여부 확인
  - 1시간 쿨다운 시간 적용
  - 투표 이력 저장

- **데이터 영속성**
  - JSON 파일을 통한 데이터 저장
  - 서버 재시작 후에도 투표 결과 유지

## 🛠️ 기술 스택

- **백엔드**: Node.js + Express
- **프론트엔드**: HTML5, CSS3, Vanilla JavaScript
- **데이터 저장**: JSON 파일 (votes.json)
- **배포**: Railway / Vercel 지원

## 📦 프로젝트 구조

```
vote/
├── config/                   # 설정 파일
│   └── constants.js         # 상수 정의
├── src/                     # 서버 소스 코드
│   ├── app.js              # Express 앱 설정
│   ├── server.js           # 서버 시작
│   ├── routes/             # API 라우트
│   │   └── voteRoutes.js
│   ├── controllers/        # 비즈니스 로직
│   │   └── voteController.js
│   ├── services/           # 데이터 처리 로직
│   │   └── voteService.js
│   └── utils/              # 유틸리티 함수
│       └── ipUtils.js
├── public/                  # 정적 파일
│   ├── css/
│   │   └── style.css       # 스타일시트
│   ├── js/
│   │   ├── vote.js        # 투표 페이지 로직
│   │   └── result.js      # 결과 페이지 로직
│   └── views/
│       ├── vote.html      # 투표 페이지
│       └── result.html    # 결과 페이지
├── data/                    # 데이터 파일
│   └── votes.json          # 투표 데이터 (자동 생성)
├── package.json            # 프로젝트 설정
├── railway.json            # Railway 배포 설정
├── vercel.json            # Vercel 배포 설정
└── README.md              # 프로젝트 문서
```

## 🏗️ 아키텍처

### MVC 패턴 기반 구조

- **Model (Services)**: 데이터 처리 및 비즈니스 로직
- **View (Public)**: 사용자 인터페이스 (HTML/CSS/JS)
- **Controller**: 요청 처리 및 응답 생성

### 계층 분리

1. **Config Layer**: 환경 설정 및 상수
2. **Routes Layer**: URL 매핑 및 라우팅
3. **Controller Layer**: 요청 검증 및 응답 처리
4. **Service Layer**: 핵심 비즈니스 로직
5. **Utils Layer**: 공통 유틸리티 함수

## 🚀 로컬 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/rosemin928/vote.git
cd vote
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 서버 실행

```bash
npm start
```

### 4. 브라우저에서 접속

```
http://localhost:3000/vote
```

## 🌐 배포 방법

### Railway 배포 (추천 - 데이터 영속성)

1. Railway 계정에 로그인: `https://railway.app`
2. "New Project" → "Deploy from GitHub repo" 선택
3. `rosemin928/vote` 저장소 선택
4. 자동 배포 완료!

**또는 CLI 사용:**

```bash
npm install -g railway
railway login
railway up
```

### Vercel 배포

1. Vercel 계정에 로그인: `https://vercel.com`
2. 저장소를 Vercel에 연결
3. 자동으로 배포됨

**또는 CLI 사용:**

```bash
npm install -g vercel
vercel
```

**⚠️ 주의**: Vercel은 서버리스 환경이므로 재배포 시 투표 데이터가 초기화됩니다.

## 🔒 어뷰징 방지 메커니즘

### 3단계 방어 시스템

1. **1차 방어: 쿠키**
   - 투표 후 `voted=true` 쿠키 설정
   - 유효기간: 1시간
   - 일반 사용자의 중복 투표 방지

2. **2차 방어: IP 주소**
   - 각 투표자의 IP 주소를 저장
   - 쿠키 삭제 시에도 중복 투표 차단

3. **3차 방어: 타임스탬프**
   - 마지막 투표 시간 기록
   - 1시간 이내 재투표 시도 시 남은 시간 안내

## 📊 API 엔드포인트

### POST `/api/vote`

투표를 처리합니다.

**요청:**
```json
{
  "choice": "jajangmyeon" | "jjamppong"
}
```

**응답 (성공):**
```json
{
  "success": true,
  "message": "투표가 완료되었습니다!",
  "results": {
    "jajangmyeon": 10,
    "jjamppong": 15
  }
}
```

**응답 (중복 투표):**
```json
{
  "success": false,
  "message": "투표는 1시간에 한 번만 가능합니다. 45분 후에 다시 시도해주세요.",
  "remainingMinutes": 45
}
```

### GET `/api/results`

투표 결과를 조회합니다.

**응답:**
```json
{
  "success": true,
  "results": {
    "jajangmyeon": 10,
    "jjamppong": 15,
    "total": 25,
    "percentages": {
      "jajangmyeon": "40.0",
      "jjamppong": "60.0"
    }
  }
}
```

## 🎨 UI/UX 특징

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원
- **모던한 UI**: 그라데이션, 애니메이션, 카드 디자인
- **직관적인 UX**: 명확한 피드백, 자동 페이지 이동
- **접근성**: 시맨틱 HTML, 키보드 네비게이션 지원

## 📝 데이터 구조

### votes.json

```json
{
  "jajangmyeon": 10,
  "jjamppong": 15,
  "voters": [
    {
      "ipAddress": "123.456.789.012",
      "choice": "jajangmyeon",
      "timestamp": "2025-12-30T10:30:00.000Z"
    }
  ]
}
```

## 🔧 환경 변수

```env
PORT=3000  # 서버 포트 (기본값: 3000)
```

## 🧪 테스트

서버가 정상 작동하는지 확인:

```bash
# 서버 시작
npm start

# API 테스트
curl http://localhost:3000/api/results
```

## 🛠️ 개발

### 코드 스타일

- **명확한 변수명**: 축약어 사용 금지
- **함수 문서화**: JSDoc 주석 사용
- **모듈화**: 단일 책임 원칙
- **에러 처리**: 모든 비동기 작업에 try-catch

### 파일 추가 시 위치

- **설정**: `config/`
- **라우트**: `src/routes/`
- **컨트롤러**: `src/controllers/`
- **서비스**: `src/services/`
- **유틸리티**: `src/utils/`
- **정적 파일**: `public/css/`, `public/js/`, `public/views/`

## 📄 라이선스

MIT License

## 🤝 기여

이슈 및 Pull Request는 언제나 환영합니다!

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

**Made with ❤️ by Firebender**
