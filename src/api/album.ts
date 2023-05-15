import { http } from "@/utils/http";
import { R, Page, Data } from "@/api/common";
import { MusicSearchRes } from "@/api/music";
export interface ArtistList {
  id: number;
  artistName: string;
  aliasName: string;
  sex?: any;
  pic: string;
  birth?: any;
  location?: any;
  introduction: string;
  createTime: string;
  updateTime: string;
}

export interface AlbumRes {
  id: number;
  albumName: string;
  subType: string;
  description: string;
  company: string;
  pic: string;
  publishTime: string;
  updateTime: string;
  createTime: string;
  musicList?: any;
  albumSize: number;
  artistList: ArtistList[];
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
  return http.request<R<selectAlbum[]>>(
    "get",
    `/admin/album/select?name=${name}`
  );
};
export interface ArtistRes {
  id: number;
  artistName: string;
  aliasName: string;
  sex: string;
  pic: string;
  birth: string;
  location: string;
  introduction: string;
  createTime: string;
  updateTime: string;
}

export interface AlbumDataRes {
  id: number;
  albumName: string;
  subType: string;
  description: string;
  company: string;
  pic: string;
  publishTime: string;
  updateTime: string;
  createTime: string;
  musicList: MusicSearchRes[];
  albumSize: number;
  artistList: ArtistRes[];
  orderBy?: any;
  order?: any;
}

export const getAlbumDataInfo = (id: string) => {
  return http.request<R<AlbumDataRes>>("get", "/admin/album/" + id);
};

export const deleteAlbum = (id: number[], compel?: boolean) => {
  return http.request<R<AlbumDataRes>>(
    "delete",
    `/admin/album/${id.join(",")}`,
    {
      params: {
        compel: compel
      }
    }
  );
};

export interface Album {
  id: number;
  albumName: string;
  subType: string;
  description: string;
  company: string;
  pic: string;
  publishTime: string;
  updateTime: string;
  createTime: string;
}
export const saveOrUpdateAlbum = (data: Album) => {
  return http.request<R<AlbumDataRes>>("post", "/admin/album/", {
    data
  });
};
