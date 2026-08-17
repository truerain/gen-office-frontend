// apps/demo/src/pages/demo/plan-scope/PlanScopeDemoPage.tsx
// Demo page for Actual / Pooled / PlanScope assignment workflow.

import { useMemo, useState } from 'react';
import { Layers3 } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@gen-office/ui';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';

import { ActualsTab } from './ActualsTab';
import { PooledTab } from './PooledTab';
import { createInitialState, planScopeCounts, type PlanScopeState } from './planScopeModel';

import styles from './PlanScopeDemoPage.module.css';

export default function PlanScopeDemoPage(_props: PageComponentProps) {
  const [state, setState] = useState<PlanScopeState>(() => createInitialState());
  const counts = useMemo(() => planScopeCounts(state), [state]);

  return (
    <div className={styles.page}>
      <PageHeader
        title="사업계획 PlanScope Demo"
        description="Actual을 Pooled로 묶어 PlanScope를 확정합니다. 계획 금액 입력은 별도 화면에서 처리합니다."
        breadcrumbItems={[
          { label: 'UI Demo', icon: <Layers3 size={16} /> },
          { label: '사업계획 PlanScope Demo', icon: <Layers3 size={16} /> },
        ]}
      />

      <div className={styles.summaryBar}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Actual</span>
          <span className={styles.summaryValue}>{counts.actual}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Pooled</span>
          <span className={styles.summaryValue}>{counts.pooled}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>PlanScope</span>
          <span className={styles.summaryValue}>{counts.planScope}</span>
        </div>
        <span className={styles.summaryHint}>PlanScope = Actual + Pooled</span>
      </div>

      <Tabs defaultValue="actual" className={styles.tabsRoot}>
        <TabsList className={styles.tabsList} variant="underline">
          <TabsTrigger value="actual">Actual</TabsTrigger>
          <TabsTrigger value="pooled">Pooled</TabsTrigger>
        </TabsList>

        <TabsContent value="actual" className={styles.tabsContent}>
          <ActualsTab state={state} onStateChange={setState} />
        </TabsContent>

        <TabsContent value="pooled" className={styles.tabsContent}>
          <PooledTab state={state} onStateChange={setState} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
