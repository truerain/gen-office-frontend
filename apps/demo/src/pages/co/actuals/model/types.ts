export interface CoActual {
  acctCd: string;
  acctName: string;
  acctLevel: number;
  parentCd: string | null;
  drCr: string;
  fiscalYr: string;
  fiscalPrd: string;
  orgCd: string;
  currActAmt: number;
  planAmt: number;
  prevActAmt: number;
  attribute1: string | null;
  attribute2: string | null;
  attribute3: string | null;
  attribute4: string | null;
  attribute5: string | null;
  attribute6: string | null;
  attribute7: string | null;
  attribute8: string | null;
  attribute9: string | null;
  attribute10: string | null;
  createdBy: string | null;
  creationDate: string | null;
  lastUpdatedBy: string | null;
  lastUpdatedDate: string | null;
}

export type CoActualsListParams = {
  fiscalYr?: string;
  fiscalPrd?: string;
  orgCd?: string;
  acctCd?: string;
};
