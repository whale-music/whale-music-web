export interface R<T> {
  code: string;
  message: string;
  data: T;
}

export interface Page {
  pageIndex: number;
  pageNum: number;
}
