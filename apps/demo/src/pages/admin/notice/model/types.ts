export interface Notice {
  noticeId: number;
  title: string;
  content: string;
  dispStartDate?: string;
  dispEndDate?: string;
  popupYn: string;
  useYn: string;
  fileSetId?: string;
  filenames?: string;
  readCount?: number;
  createdBy?: string;
  creationDate?: string;
  lastUpdatedBy?: string;
  lastUpdatedDate?: string;
}
 
export interface NoticeRequest {
  noticeId?: number;
  title: string;
  content: string;
  dispStartDate?: string;
  dispEndDate?: string;
  popupYn: string;
  useYn: string;
  fileSetId?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
}

export type NoticeListParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};
