export interface CommonCodeMasterKey {
  lkupClssCd: string;
}

export interface CommonCodeMaster extends CommonCodeMasterKey {
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

export interface CommonCodeDetailKey extends CommonCodeMasterKey {
  lkupCd: string;
}

export interface CommonCodeDetail extends CommonCodeDetailKey {
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

export type CommonCodeMasterListParams = {
  lkupClssCd?: string;
  lkupClssName?: string;
  useYn?: string;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type CommonCodeDetailListParams = {
  lkupCd?: string;
  lkupName?: string;
  useYn?: string;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export interface CommonCodeMasterCreateRequest {
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

export interface CommonCodeMasterUpdateRequest {
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

export interface CommonCodeDetailCreateRequest {
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

export interface CommonCodeDetailUpdateRequest {
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
