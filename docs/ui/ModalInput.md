# ModalInput

`ModalInput` supports both single-select and multi-select.
The external API is split by `mode`, and the internal implementation normalizes both paths to a list model.

## Core Types

```ts
type ModalInputSelection<TData = unknown> = {
  value: string;
  label: string;
  description?: string;
  data?: TData;
  disabled?: boolean;
  keywords?: string[];
};
```

## Single Mode

```tsx
<ModalInput<User>
  mode="single"
  selectedItem={selectedUser}
  onSelectedItemChange={setSelectedUser}
  onCommit={(item) => {
    console.log(item?.value ?? '');
  }}
  items={userItems}
/>
```

Single mode contract:

- `selectedItem?: ModalInputSelection | null`
- `onSelectedItemChange?: (selectedItem) => void`
- `onCommit?: (selectedItem) => void`

## Multi Mode

```tsx
<ModalInput<User>
  mode="multi"
  selectedItems={selectedUsers}
  onSelectedItemsChange={setSelectedUsers}
  onCommit={(items) => {
    console.log(items.map((item) => item.value));
  }}
  items={userItems}
/>
```

Multi mode contract:

- `selectedItems?: ModalInputSelection[]`
- `onSelectedItemsChange?: (selectedItems) => void`
- `onCommit?: (selectedItems) => void`

## Common Props

- Data: `items`, `fetchItems`
- Search: `searchOnInputChange`, `searchPlaceholder`
- Dialog: `title`, `modalDescription`, `modalWidth`, `modalHeight`
- Input: `placeholder`, `label`, `helperText`, `readOnly`, `openOnInputFocus`
- Actions: `confirmLabel`, `cancelLabel`, `clearable`, `clearLabel`
- List: `listColumns`, `emptyMessage`, `loadingMessage`
- Display: `formatDisplayValue(selectedItems, mode)`

## Notes

- In `single` mode, row double-click can commit immediately when `confirmOnDoubleClick` is `true`.
- In `multi` mode, row click toggles selection and commit is done via confirm button or `Enter` in search input.
