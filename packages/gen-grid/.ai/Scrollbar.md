GenGrid의 스크롤바 스타일은 현재 전용 스타일이 없고 전역 스크롤바 스타일만 적용되고 있습니다.

현황 요약

전역 스크롤바 스타일: global.css의 ::-webkit-scrollbar 계열이 전체에 적용됩니다.
GenGrid 전용 스크롤바 토큰: variables.css에 --grid-scrollbar-thumb/track가 정의되어 있지만 실제 사용처가 없습니다.
GenGrid 스크롤 컨테이너: GenGridLayout.module.css의 .tableScroll이 overflow-x/overflow-y: auto로 스크롤을 담당하지만 scrollbar 스타일은 없음.
관련 파일

전역 스크롤바: global.css
그리드 토큰: variables.css
스크롤 컨테이너: GenGridLayout.module.css



#### 2026.02.01 GenGrid에만 스크롤바 스타일 적용 (토큰 --grid-scrollbar-* 사용)
- 적용 완료. GenGrid에만 스크롤바 스타일이 적용되도록 .tableScroll에 스코프드 스타일을 추가했고, 토큰 --grid-scrollbar-thumb/track을 사용하도록 했습니다. 수정 파일은 GenGridLayout.module.css입니다.



