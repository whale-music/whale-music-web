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

export interface PageResCommon<T> {
  current: number;
  size: number;
  total: number;
  content: T[];
}

export interface PageReqCommon {
  pageIndex: number;
  pageNum: number;
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
export interface MusicSearchReq {
  musicIds: number[];
  musicName: string;
  artistName: string;
  albumName: string;
  orderBy: string;
  order: boolean;
  beforeDate: string;
  afterDate: string;
  refresh: boolean;
  isShowNoExist: boolean;
  page: Page;
}

export interface PicUrl {
  picUrl: string;
}

export interface PicConvert {
  id: number;
  url: string;
  md5: string;
  createTime: string;
  updateTime: string;
}

export interface LinkItem {
  value: string;
  link: number;
  display: string;
}
