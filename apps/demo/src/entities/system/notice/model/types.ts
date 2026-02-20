export interface Notice {
  id: number;
  title: string;
  content: string;
  fileSetId?: string;
  readCount?: number;
  createdBy?: string;
  creationDate?: string;
  lastUpdatedBy?: string;
  lastUpdatedDate?: string;
}

export interface NoticeRequest {
  id?: number;
  title: string;
  content: string;
  fileSetId?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
}

export type NoticeListParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};
