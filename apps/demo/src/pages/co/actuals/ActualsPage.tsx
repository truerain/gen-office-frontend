import { useMemo, useState } from 'react';
import { Calculator, RefreshCcw, Search, Settings } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import {
  RangeChartDialog,
  useRangeChartContextMenu,
} from '@gen-office/gen-grid-chart';
import { Button, FilterBar, Input, MonthPicker, Radio, RadioGroup, SimpleDialog } from '@gen-office/ui';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { usePageContext } from '@/contexts';
import { resolveApiErrorMessage } from '@/shared/api/errorMessage';

import { useCoActualsListQuery } from '@/pages/co/actuals/api/actuals';
import type { CoActual, CoActualsListParams } from '@/pages/co/actuals/model/types';
import { createActualsColumns, type ActualsViewMode } from '@/pages/co/actuals/ActualsColumns';

import styles from './ActualsPage.module.css';

type ActualsFilters = {
  fiscalYr: string;
  fiscalPrd: string;
  orgCd: string;
  acctCd: string;
};

const defaultFilters: ActualsFilters = {
  fiscalYr: '',
  fiscalPrd: '',
  orgCd: '',
  acctCd: '',
};

function makeRowId(row: CoActual, index: number) {
  return [row.fiscalYr, row.fiscalPrd, row.orgCd, row.acctCd, String(index)]
    .map((v) => String(v ?? '').trim())
    .join('|');
}

function toMonthDate(fiscalYr: string, fiscalPrd: string): Date | undefined {
  const year = Number(fiscalYr.trim());
  const month = Number(fiscalPrd.trim());
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return undefined;
  return new Date(year, month - 1, 1);
}

function fromMonthDate(date?: Date) {
  if (!date) return { fiscalYr: '', fiscalPrd: '' };
  return {
    fiscalYr: String(date.getFullYear()),
    fiscalPrd: String(date.getMonth() + 1).padStart(2, '0'),
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CoActualsPage(_props: PageComponentProps) {
  const { openMenuPage } = usePageContext();
  const [draftFilters, setDraftFilters] = useState<ActualsFilters>(defaultFilters);
  const [filters, setFilters] = useState<ActualsFilters>(defaultFilters);
  const [gridDirty, setGridDirty] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ActualsViewMode>('summary');

  const rangeChart = useRangeChartContextMenu<CoActual>({
    categoryColumnId: 'acctName',
    chartKinds: ['column', 'bar', 'line', 'area', 'pie', 'donut'],
    messageWhenCategoryMissing: 'Category column "Account Name (acctName)" was not found.',
    messageWhenInvalid:
      'Select at least one numeric column. For multi-selection charts, all selected ranges must share the same column range.',
    barModes: ['grouped', 'stacked', 'stacked100'],
  });

  const queryParams = useMemo<CoActualsListParams>(
    () => ({
      fiscalYr: filters.fiscalYr.trim() || undefined,
      fiscalPrd: filters.fiscalPrd.trim() || undefined,
      orgCd: filters.orgCd.trim() || undefined,
      acctCd: filters.acctCd.trim() || undefined,
    }),
    [filters]
  );

  const { data: actuals = [], refetch, isError, error, dataUpdatedAt } =
    useCoActualsListQuery(queryParams);
  const columns = useMemo(
    () =>
      createActualsColumns(viewMode, {
        onAccountNameDoubleClick: (row) => {
          openMenuPage?.('99060', {
            sourceMenuId: _props.menuId,
            sourceAction: 'acctNameDblClick',
            payload: {
              acctCd: row.acctCd,
              acctName: row.acctName,
              fiscalYr: filters.fiscalYr,
              fiscalPrd: filters.fiscalPrd,
              orgCd: filters.orgCd,
            },
          });
        },
      }),
    [filters.fiscalPrd, filters.fiscalYr, filters.orgCd, openMenuPage, viewMode, _props.menuId]
  );

  const handleSearch = () => {
    const same =
      draftFilters.fiscalYr.trim() === filters.fiscalYr.trim() &&
      draftFilters.fiscalPrd.trim() === filters.fiscalPrd.trim() &&
      draftFilters.orgCd.trim() === filters.orgCd.trim() &&
      draftFilters.acctCd.trim() === filters.acctCd.trim();

    setFilters(draftFilters);
    if (same) void refetch();
  };

  return (
    <div className={styles.page} data-grid-dirty={gridDirty ? 'true' : 'false'}>
      <PageHeader
        title="Management Accounting Actuals"
        description="Query actuals by fiscal year, period, organization, and account."
        breadcrumbItems={[
          { label: 'Management Accounting', icon: <Calculator size={16} /> },
          { label: 'Actuals Inquiry', icon: <Calculator size={16} /> },
        ]}
      />
      <div className={styles.filter}>
        <FilterBar
          actions={
            <Button onClick={handleSearch} variant="primary" size="md">
              <Search size={16} />
              Search
            </Button>
          }
        >
          <FilterBar.Item title="Fiscal Month" flex={0} width="220px">
            <MonthPicker
              value={toMonthDate(draftFilters.fiscalYr, draftFilters.fiscalPrd)}
              onChange={(next) => {
                const { fiscalYr, fiscalPrd } = fromMonthDate(next);
                setDraftFilters((prev) => ({ ...prev, fiscalYr, fiscalPrd }));
              }}
              placeholder="YYYY-MM"
              format={(date) =>
                `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              }
            />
          </FilterBar.Item>
          <FilterBar.Item title="Organization" flex={0} width="220px">
            <Input
              value={draftFilters.orgCd}
              onChange={(event) =>
                setDraftFilters((prev) => ({ ...prev, orgCd: event.target.value }))
              }
              placeholder="HQ"
              clearable
            />
          </FilterBar.Item>
          <FilterBar.Item title="Account" flex={1} width="300px">
            <Input
              value={draftFilters.acctCd}
              onChange={(event) =>
                setDraftFilters((prev) => ({ ...prev, acctCd: event.target.value }))
              }
              placeholder="500100"
              clearable
            />
          </FilterBar.Item>
        </FilterBar>
      </div>
      <div className={styles.workarea}>
        {isError && (
          <div className={styles.error}>
            <div className={styles.errorTitle}>Failed to load actuals.</div>
            <div className={styles.errorMessage}>
              {resolveApiErrorMessage(error, { defaultMessage: 'Unknown error' })}
            </div>
            <button type="button" onClick={() => void refetch()}>
              Retry
            </button>
          </div>
        )}
        <GenGridCrud<CoActual>
          title="Actuals List"
          readonly
          data={actuals}
          columns={columns}
          getRowId={(row, index) => makeRowId(row, index)}
          onCommit={async () => ({ ok: true })}
          excelExport={{
            mode: 'frontend',
            frontend: { onlySelected: false },
          }}
          actionBar={{
            position: 'top',
            defaultStyle: 'icon',
            includeBuiltIns: ['filter', 'excel'],
            customActions: [
              {
                key: 'settings',
                label: 'Settings',
                icon: <Settings aria-hidden size={16} />,
                side: 'right',
                style: 'icon',
                order: 10,
                onClick: () => {
                  setSettingsOpen(true);
                },
              },
              {
                key: 'refresh',
                label: 'Refresh',
                icon: <RefreshCcw aria-hidden size={16} />,
                side: 'right',
                style: 'icon',
                order: 20,
                onClick: () => {
                  void refetch();
                },
              },
            ],
          }}
          onStateChange={({ dirty }) => {
            setGridDirty(dirty);
          }}
          gridProps={{
            dataVersion: dataUpdatedAt,
            rowHeight: 34,
            overscan: 8,
            enablePinning: true,
            enableColumnSizing: true,
            enableVirtualization: true,
            enableRowStatus: true,
            enableRowNumber: false,
            checkboxSelection: true,
            editOnActiveCell: false,
            keepEditingOnNavigate: true,
            enableFooterRow: false,
            enableStickyFooterRow: true,
            enableActiveRowHighlight: true,
            contextMenu: {
              customActions: [rangeChart.contextMenuAction],
            },
          }}
        />
      </div>

      <SimpleDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        title="Actuals Settings"
        initialHeight={320}
        footer={
          <div className={styles.dialogActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraftFilters(defaultFilters);
                setFilters(defaultFilters);
                setSettingsOpen(false);
                void refetch();
              }}
            >
              Reset Filters
            </Button>
            <Button type="button" variant="primary" onClick={() => setSettingsOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div className={styles.dialogContent}>
          <p className={styles.dialogText}>
            You can place display options, default filters, and export options here.
          </p>
          <div className={styles.optionSection}>
            <span className={styles.optionLabel}>표시 형식</span>
            <RadioGroup
              className={styles.optionGroup}
              value={viewMode}
              onValueChange={(value) => setViewMode(value as ActualsViewMode)}
            >
              <div className={styles.optionItem}>
                <Radio id="actuals-view-summary" value="summary" />
                <label htmlFor="actuals-view-summary">요약보기</label>
              </div>
              <div className={styles.optionItem}>
                <Radio id="actuals-view-monthly-detail" value="monthly-detail" />
                <label htmlFor="actuals-view-monthly-detail">월별상세보기</label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </SimpleDialog>

      <RangeChartDialog
        {...rangeChart.dialogProps}
      />
    </div>
  );
}
