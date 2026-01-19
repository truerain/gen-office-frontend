graph TD
    Main[GenGrid.tsx] --> Data[useGridData]
    Main --> Dirty[useDirtyState]
    Main --> Edit[useGridEditing]
    Main --> Inst[useGridInstance]
    Main --> Table[useGenGridTable]

    Inst -.->|Ref API| External[Parent Component]
    Edit -->|Call| Data
    Edit -->|Call| Dirty