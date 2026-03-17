export interface CoActual {
  acctCd: string;
  acctName: string;
  acctLevel: number;
  parentCd: string;
  drCr: string;
  fiscalYr: string;
  fiscalPrd: string;
  orgCd: string;
  currActAmt: number;
  planAmt: number;
  prevActAmt: number;
  m01: number;
  m02: number;
  m03: number;
  m04: number;
  m05: number;
  m06: number;
  m07: number;
  m08: number;
  m09: number;
  m10: number;
  m11: number;
  m12: number;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
}

export type CoActualsListParams = {
  fiscalYr?: string;
  fiscalPrd?: string;
  orgCd?: string;
  acctCd?: string;
};
