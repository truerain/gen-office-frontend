export interface MessageKey {
  namespace: string;
  messageCd: string;
  langCd: string;
}

export interface Message extends MessageKey {
  messageTxt: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MessageListParams = {
  namespace?: string;
  langCd?: string;
  messageCd?: string;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export interface MessageListResponse {
  items: Message[];
  page: number;
  size: number;
  total: number;
}

export interface MessageCreateRequest extends MessageKey {
  messageTxt: string;
}

export interface MessageUpdateRequest {
  messageTxt: string;
}
