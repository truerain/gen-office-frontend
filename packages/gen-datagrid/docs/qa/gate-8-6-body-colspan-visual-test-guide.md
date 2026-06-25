<!-- packages/gen-datagrid/docs/qa/gate-8-6-body-colspan-visual-test-guide.md
Manual QA checklist for Gate 8.6-a body column span behavior.
-->

# Gate 8.6-a Body Column Span 수동 테스트 가이드

Gate 8.6-a는 body cell에 CSS grid 기반 column span을 적용하는 기능이다. native table `colSpan`을 쓰지 않고, span 시작 cell만 렌더링하며 span에 덮이는 후속 visible cell은 렌더링하지 않는다.

## Storybook

- Story: `Gate86BodyColSpan`

## 기본 표시

| 점검 항목 | 기대 결과 |
| --- | --- |
| row 1 Name cell | Name cell이 2개 column 폭으로 표시된다. |
| covered Role cell | row 1의 Role body cell은 렌더링되지 않는다. |
| non-span row | span 조건이 없는 row는 모든 cell이 정상 표시된다. |
| header | header는 span되지 않고 기존 column 구조를 유지한다. |

## Interaction

| 동작 | 기대 결과 |
| --- | --- |
| span 시작 cell 클릭 | 해당 cell이 active cell이 된다. |
| covered cell 위치 클릭 | covered cell 자체가 active/edit 대상이 되지 않는다. |
| span 시작 cell 수정 | 기존 editing commit/cancel 정책이 유지된다. |
| range selection | 렌더링된 cell 기준으로 selection 표시가 깨지지 않는다. |

## 조합 확인

| 조합 | 기대 결과 |
| --- | --- |
| column resize | span cell 폭이 grid template 변화에 맞춰 조정된다. |
| column visibility | visible column 기준으로 span이 다시 계산된다. |
| pinned boundary | pinned zone을 넘는 span은 적용되지 않는다. |
| virtualization | row 단위 rendering은 유지된다. 복잡한 span selection 정책은 후속 검증 대상이다. |

## 실패로 볼 증상

- span 시작 cell과 covered cell이 동시에 표시된다.
- span cell이 pinned zone을 넘어 sticky layout을 깨뜨린다.
- editing 중 span cell 높이 또는 폭이 깨진다.
- column reorder/visibility 후 span이 잘못된 column을 덮는다.
