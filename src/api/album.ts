import { http } from "@/utils/http";
import { R, Page, Data } from "@/api/common";
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

export interface AlbumRes {
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

export interface selectAlbum {
  value: string;
  link: string;

  id: number;
  albumName: string;
  aliasName?: any;
  subType: string;
  description?: any;
  company: string;
  pic: string;
  publishTime: string;
  updateTime: string;
  createTime: string;
}

export const getAlbumPage = (data?: AlbumReq) => {
  return http.request<R<Data<AlbumRes>>>("post", "/admin/album/allAlbum", {
    data
  });
};

export const getSelectAlbumList = (name: string) => {
  return http.request<R<selectAlbum>>(
    "get",
    "/admin/album/select?name=" + name
  );
};
