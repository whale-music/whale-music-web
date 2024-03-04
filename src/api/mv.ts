import type { Data, R } from "@/api/model/common";
import { http } from "@/utils/http";

export interface MV {
  id: number;
  path: string;
  md5: string;
  title: string;
  description: string;
  duration: number;
  userId: number;
  publishTime: string;
  createTime: string;
  updateTime: string;
}

export interface SaveOrUpdateMv extends MV {
  mvTempPath: string;
  picTempPath: string;
  artistIds: number[];
  tags: string[];
}

export interface SimpleArtist {
  id: number;
  name: string;
}

export interface MvPageRes extends MV {
  picUrl: string;
  tags: string[];
  artists: SimpleArtist[];
}

export interface MvPageReq {
  title?: string;
  artists?: string[];
  tags?: string[];
  index?: number;
  size?: number;
  order?: string;
  orderBy?: string;
}

export const getMvPage = (req: MvPageReq) => {
  return http.request<R<Data<MvPageRes>>>("get", `/admin/mv/`, {
    params: {
      title: req.title,
      artists: req.artists,
      tags: req.tags,
      index: req.index,
      size: req.size,
      order: req.order,
      orderBy: req.orderBy
    }
  });
};

export const saveMvInfo = (data: SaveOrUpdateMv) => {
  return http.request<R<any>>("post", `/admin/mv/save`, {
    data
  });
};

export const updateMvInfo = (data: SaveOrUpdateMv) => {
  return http.request<R<any>>("post", `/admin/mv/save`, {
    data
  });
};

export const removeMvList = (ids: number[]) => {
  return http.request<R<any>>("delete", `/admin/mv/`, {
    data: {
      ids: ids
    }
  });
};

export interface MvInfo extends MV {
  mvUrl: string;
  picUrl: string;
  tags: string[];
  artists: SimpleArtist[];
}
export const getMvInfo = (id: number) => {
  return http.request<R<MvInfo>>("get", `/admin/mv/${id}`);
};
