export interface R<T> {
  code: string;
  message: string;
  data: T;
}

export interface Page {
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
