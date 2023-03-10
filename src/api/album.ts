import { http } from "@/utils/http";
import { R } from "@/api/r";

export interface Singer {
  id: string;
  singerName: string;
  alias: string;
  sex?: any;
  pic: string;
  birth?: any;
  location?: any;
  introduction: string;
  createTime: string;
  updateTime: string;
}

export interface Record {
  id: string;
  albumName: string;
  description: string;
  pic: string;
  updateTime: string;
  createTime: string;
  singer: Singer[];
  orderBy: string;
  order: boolean;
}

export interface AlbumRes {
  records: Record[];
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

export interface Page {
  pageIndex: number;
  pageNum: number;
}

export interface AlbumReq {
  singerName: string;
  orderBy: string;
  order: boolean;
  timeBy: boolean;
  beforeTime: string;
  laterTime: string;
  page: Page;
  albumName: string;
  description: string;
  pic: string;
  updateTime: string;
  createTime: string;
}

export const getAlbumPage = (data?: AlbumReq) => {
  return http.request<R<AlbumRes>>("post", "/admin/album/allAlbum", {
    data
  });
};
