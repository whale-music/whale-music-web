export interface R<T> {
  code: string;
  message: string;
  data: T;
}

export interface Page {
  pageIndex: number;
  pageNum: number;
  total?: number;
}

export interface Data<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  orders: any[];
  optimizeCountSql: boolean;
  searchCount: boolean;
  countId?: any;
  maxLimit?: any;
  pages: number;
}

// 音乐搜索请求参数
export type MusicSearchReq = {
  musicIds: number[];
  musicName: string;
  artistName: string;
  albumName: string;
  orderBy: string;
  order: boolean;
  beforeDate: string;
  afterDate: string;
  page: {
    pageIndex: number;
    pageNum: number;
  };
};
