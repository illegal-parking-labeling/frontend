# illegal-parking-labeling / frontend

React + Vite + TypeScript. Canvas 기반 바운딩박스 라벨링 UI.
전체 프로젝트 설명은 [org 프로필](https://github.com/illegal-parking-labeling) 참고.

## 실행

```bash
npm install
npm run dev   # http://localhost:5173, backend(8000)가 떠 있어야 함
```

## 구조

```
src/
  components/BBoxCanvas.tsx   캔버스 바운딩박스 표시·직접 그리기
  pages/                      업로드 목록 / 라벨링 / 랭킹
  api.ts                      backend REST 클라이언트
```
