import {
  AlbumInfo,
  AlbumListPageReq,
  AlbumListPageRes,
  SaveOrUpdateAlbum,
  SelectAlbum
} from "@/api/model/Album";
import { Data, PageReqCommon, PageResCommon, R } from "@/api/model/common";
import { http } from "@/utils/http";

export const getAlbumListPage = (data?: AlbumListPageReq) => {
  return http.request<R<Data<AlbumListPageRes>>>("post", "/admin/album/list", {
    data
  });
};

export const getSelectAlbumList = (name: string) => {
  return http.request<R<SelectAlbum[]>>(
    "get",
    `/admin/album/select?name=${name}`
  );
};

export const getAlbumDataInfo = (id: string) => {
  return http.request<R<AlbumInfo>>("get", `/admin/album/${id}`);
};

export const deleteAlbum = (id: number[], compel?: boolean) => {
  return http.request<R<AlbumInfo>>("delete", `/admin/album/`, {
    params: {
      compel: compel
    },
    data: {
      ids: id
    }
  });
};

export const saveOrUpdateAlbum = (data: SaveOrUpdateAlbum) => {
  return http.request<R<any>>("post", "/admin/album/", {
    data
  });
};

export interface AlbumPageReq extends PageReqCommon {
  name: string;
  musicName: string;
  artistName: string;
  albumName: string;
}

export interface AlbumPageRes {
  id: number;
  artistName: string;
  aliasName: string;
  userId: number;
  picUrl: string;
  albumSize: string;
  musicSize: string;
  createTime: string;
}

export const getAlbumPage = (data?: AlbumPageReq) => {
  return http.request<R<PageResCommon<AlbumPageRes>>>(
    "post",
    "/admin/album/page",
    {
      data
    }
  );
};
