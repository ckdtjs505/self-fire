# 셀프파이어 관리자

셀프파이어 앱의 명언(`quote` 테이블)을 관리하는 PHP 어드민. 함온성(L-G-youth-bible-reading) 어드민과 같은 구조(HTML + JS + PHP JSON API)이고, 같은 cafe24 서버·DB를 쓴다.

## 기능

- **대시보드**: 전체/대표/카테고리 지정 명언 수, 카테고리별 지정 수, 최근 추가된 명언
- **명언 관리**: 본문·작가·ID 검색, 카테고리/대표 필터, 추가·수정·삭제, 대표(★) 토글
  - 카테고리를 비워두면 앱이 본문 키워드로 자동 분류한다. 목록과 편집 창에서 자동 분류 결과를 미리 보여준다.
  - 띄어쓰기·문장부호만 다른 같은 문장이 있으면 저장 전에 확인한다.

## 앱 반영 시점

| 변경 | 반영 |
|------|------|
| 새 명언 추가 | 앱이 `since_id`로 동기화할 때 바로 받아감 |
| 기존 명언 수정·삭제, 대표/카테고리 변경 | 다음 앱 빌드 (`npm run update-quotes`) |

## 로그인

함온성 `users` 테이블에서 `role = 'admin'`인 계정만 로그인할 수 있다. 세션 쿠키 이름이 `SELFFIRE_ADMIN`이라 함온성 사이트 로그인과는 따로 관리된다.

## 배포

`admin/` 폴더를 서버 웹 루트 아래 원하는 경로(예: `www/selffire-admin/`)에 올린다.

DB 설정은 함온성과 같은 `config/db_config.php`를 쓴다. API가 상위 폴더로 올라가며 찾으므로 `www` 바깥의 `config/db_config.php`가 있으면 따로 설정할 필요가 없다.

```
~/config/db_config.php        ← 기존 파일 (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, DB_CHARSET)
~/www/selffire-admin/         ← admin/ 내용
    index.html
    api/...
```

## 구조

```
admin/
├── index.html            # 로그인 + 대시보드 + 명언 관리 화면
├── css/admin.css
├── js/
│   ├── api.js            # fetch 래퍼(CSRF 토큰), 토스트
│   ├── categories.js     # 앱 data/quote-categories.ts와 같은 카테고리 정의
│   ├── main.js           # 로그인 확인, 네비게이션
│   ├── home.js           # 대시보드
│   └── quotes.js         # 명언 목록·편집
└── api/
    ├── common/
    │   ├── bootstrap.php # 세션, JSON 응답, DB 연결, 관리자/CSRF 확인
    │   └── quote.php     # 카테고리 직렬화, 중복 판정
    ├── auth/             # login, logout, session
    └── quote/            # stats, list, save, featured, delete
```

앱의 카테고리를 바꾸면 `js/categories.js`와 `api/common/quote.php`의 `QUOTE_CATEGORIES`도 함께 바꾼다.
