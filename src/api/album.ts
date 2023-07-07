import { http } from "@/utils/http";
import { R, Data } from "@/api/model/common";
import {
  AlbumInfo,
  AlbumPageReq,
  AlbumPageRes,
  SaveOrUpdateAlbum,
  SelectAlbum
} from "@/api/model/Album";

export const getAlbumPage = (data?: AlbumPageReq) => {
  return http.request<R<Data<AlbumPageRes>>>("post", "/admin/album/page", {
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
  return http.request<R<AlbumInfo>>("delete", `/admin/album/${id.join(",")}`, {
    params: {
      compel: compel
    }
  });
};

export const saveOrUpdateAlbum = (data: SaveOrUpdateAlbum) => {
  return http.request<R<any>>("post", "/admin/album/", {
    data
  });
};
