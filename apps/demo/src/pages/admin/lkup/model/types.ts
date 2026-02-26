export interface LkupMasterKey {
  lkupClssCd: string;
}

export interface LkupMaster extends LkupMasterKey {
  lkupClssName: string;
  lkupClssDesc?: string | null;
  useYn: string;
  attribute1?: string | null;
  attribute2?: string | null;
  attribute3?: string | null;
  attribute4?: string | null;
  attribute5?: string | null;
  attribute6?: string | null;
  attribute7?: string | null;
  attribute8?: string | null;
  attribute9?: string | null;
  attribute10?: string | null;
  lastUpdatedBy?: string | null;
  lastUpdatedByName?: string | null;
  lastUpdatedAt?: string | null;
}

export interface LkupDetailKey extends LkupMasterKey {
  lkupCd: string;
}

export interface LkupDetail extends LkupDetailKey {
  lkupName: string;
  lkupNameEng?: string | null;
  sortOrder?: number | null;
  useYn: string;
  attribute1?: string | null;
  attribute2?: string | null;
  attribute3?: string | null;
  attribute4?: string | null;
  attribute5?: string | null;
  attribute6?: string | null;
  attribute7?: string | null;
  attribute8?: string | null;
  attribute9?: string | null;
  attribute10?: string | null;
  lastUpdatedBy?: string | null;
  lastUpdatedByName?: string | null;
  lastUpdatedAt?: string | null;
}

export interface ListResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export type LkupMasterListParams = {
  lkupClssCd?: string;
  lkupClssName?: string;
  useYn?: string;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type LkupDetailListParams = {
  lkupCd?: string;
  lkupName?: string;
  useYn?: string;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export interface LkupMasterCreateRequest {
  lkupClssCd: string;
  lkupClssName: string;
  lkupClssDesc?: string | null;
  useYn: string;
  attribute1?: string | null;
  attribute2?: string | null;
  attribute3?: string | null;
  attribute4?: string | null;
  attribute5?: string | null;
  attribute6?: string | null;
  attribute7?: string | null;
  attribute8?: string | null;
  attribute9?: string | null;
  attribute10?: string | null;
}

export interface LkupMasterUpdateRequest {
  lkupClssName: string;
  lkupClssDesc?: string | null;
  useYn: string;
  attribute1?: string | null;
  attribute2?: string | null;
  attribute3?: string | null;
  attribute4?: string | null;
  attribute5?: string | null;
  attribute6?: string | null;
  attribute7?: string | null;
  attribute8?: string | null;
  attribute9?: string | null;
  attribute10?: string | null;
}

export interface LkupDetailCreateRequest {
  lkupCd: string;
  lkupName: string;
  lkupNameEng?: string | null;
  sortOrder?: number | null;
  useYn: string;
  attribute1?: string | null;
  attribute2?: string | null;
  attribute3?: string | null;
  attribute4?: string | null;
  attribute5?: string | null;
  attribute6?: string | null;
  attribute7?: string | null;
  attribute8?: string | null;
  attribute9?: string | null;
  attribute10?: string | null;
}

export interface LkupDetailUpdateRequest {
  lkupName: string;
  lkupNameEng?: string | null;
  sortOrder?: number | null;
  useYn: string;
  attribute1?: string | null;
  attribute2?: string | null;
  attribute3?: string | null;
  attribute4?: string | null;
  attribute5?: string | null;
  attribute6?: string | null;
  attribute7?: string | null;
  attribute8?: string | null;
  attribute9?: string | null;
  attribute10?: string | null;
}
