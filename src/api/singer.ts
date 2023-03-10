import { http } from "@/utils/http";
import { R, Page } from "@/api/common";

export interface SingerReq {
  singerName: string;
  orderBy: string;
  order: boolean;
  page: Page;
}

export interface SingerRes {
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

export const getSingerPage = (data?: SingerReq) => {
  return http.request<R<SingerRes>>("post", "/admin/album/allAlbum", {
    data
  });
};
