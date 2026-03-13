# AlertDialog Review

## Summary

`AlertDialog`는 header, body, footer가 분리된 구조로 정리하는 것이 맞다.  
이번 기준에서는 body를 `DialogDescription`이 아니라 `DialogBody`로 다루고, body 우측에는 alert `type`에 맞는 아이콘을 배치한다.

`confirm` 흐름은 일반 `alert`와 성격이 다르므로 이 문서에서는 제외한다.

## Current Issue

기존 구조는 `title`과 `description`을 받지만, 실사용에서는 본문 메시지가 `title`로 전달되는 경우가 많다. 그 결과 메시지 본문이 dialog title처럼 보인다.

또한 body 전용 레이아웃이 없어서, 본문과 시각 요소를 안정적으로 배치하기 어렵다.

## Direction

`alert`는 `type + message` 중심으로 본다.

```ts
type AlertType = 'information' | 'warning' | 'error';

type AlertOptions = {
  type: AlertType;
  message: string | ReactNode;
};
```

이때 title은 외부 입력값이라기보다 `type`에서 파생되는 표시값으로 본다.

```ts
const ALERT_TYPE_TITLES: Record<AlertType, string> = {
  information: 'Information',
  warning: 'Warning',
  error: 'Error',
};
```

## Layout

권장 구조는 아래와 같다.

1. Header
   `DialogTitle` + 종료 버튼
2. Body
   좌측 `message`, 우측 `type icon`
3. Footer
   `Close` 버튼

예시:

```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>{ALERT_TYPE_TITLES[type]}</DialogTitle>
  </DialogHeader>

  <DialogBody>
    <div>{message}</div>
    <AlertTypeIcon type={type} />
  </DialogBody>

  <DialogFooter>
    <Button>Close</Button>
  </DialogFooter>
</DialogContent>
```

## DialogBody

`DialogDescription`은 텍스트 설명 자체에 가까운 이름이고, 이번 요구사항은 본문 레이아웃 컨테이너가 필요하다.  
따라서 `DialogBody`를 별도 영역으로 두는 편이 더 정확하다.

`DialogBody`의 역할은 다음과 같다.

1. 본문 메시지 영역 제공
2. 본문 우측 아이콘 배치
3. alert 종류별 시각 강조를 위한 레이아웃 기준 제공

## Icon Placement

body 우측에는 `type`에 맞는 아이콘을 둔다.

예:

1. `information` -> info icon
2. `warning` -> warning icon
3. `error` -> error icon

아이콘 크기는 본문 텍스트 약 2줄 높이에 대응하는 크기로 둔다.  
즉 단순한 inline 아이콘이 아니라, body 우측에서 시각적 의미를 보강하는 보조 요소로 취급한다.

권장 방식:

1. 아이콘 wrapper는 원형 또는 강조 배경 사용
2. wrapper는 약 `3rem x 3rem`
3. 내부 icon은 약 `1.5rem x 1.5rem`
4. 모바일에서는 body를 세로로 쌓되 아이콘은 우측 정렬

## Why This Structure

이 구조의 장점은 다음과 같다.

1. title과 본문 역할이 명확히 분리된다.
2. 본문이 더 읽기 쉬워진다.
3. type별 시각적 의미 전달이 쉬워진다.
4. 향후 icon, color, title 규칙을 `type` 기준으로 일관되게 관리할 수 있다.

## Conclusion

이번 기준에서 `AlertDialog`는 다음처럼 정리하는 것이 적절하다.

1. `DialogDescription` 대신 `DialogBody` 사용
2. body는 좌측 메시지, 우측 type icon 구조
3. 아이콘은 본문 2줄 높이에 대응하는 크기로 배치
4. `confirm`은 별도 흐름으로 나중에 설계
