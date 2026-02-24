export interface CommonCodeClassKey {
  lkupClssCd: string;
}

export interface CommonCodeClass extends CommonCodeClassKey {
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
  createdAt?: string;
  updatedAt?: string;
}

export interface CommonCodeItemKey extends CommonCodeClassKey {
  lkupCd: string;
}

export interface CommonCodeItem extends CommonCodeItemKey {
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
  attribute11?: string | null;
  attribute12?: string | null;
  attribute13?: string | null;
  attribute14?: string | null;
  attribute15?: string | null;
  attribute16?: string | null;
  attribute17?: string | null;
  attribute18?: string | null;
  attribute19?: string | null;
  attribute20?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export type CommonCodeClassListParams = {
  lkupClssCd?: string;
  lkupClssName?: string;
  useYn?: string;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type CommonCodeItemListParams = {
  lkupCd?: string;
  lkupName?: string;
  useYn?: string;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export interface CommonCodeClassCreateRequest {
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

export interface CommonCodeClassUpdateRequest {
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

export interface CommonCodeItemCreateRequest {
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
  attribute11?: string | null;
  attribute12?: string | null;
  attribute13?: string | null;
  attribute14?: string | null;
  attribute15?: string | null;
  attribute16?: string | null;
  attribute17?: string | null;
  attribute18?: string | null;
  attribute19?: string | null;
  attribute20?: string | null;
}

export interface CommonCodeItemUpdateRequest {
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
  attribute11?: string | null;
  attribute12?: string | null;
  attribute13?: string | null;
  attribute14?: string | null;
  attribute15?: string | null;
  attribute16?: string | null;
  attribute17?: string | null;
  attribute18?: string | null;
  attribute19?: string | null;
  attribute20?: string | null;
}
