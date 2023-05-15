import { http } from "@/utils/http";
import { R, Page, Data } from "@/api/common";

export interface SingerReq {
  artistName: string;
  orderBy: string;
  order: boolean;
  page: Page;
}

export interface SingerRes {
  id: string;
  artistName: string;
  sex?: any;
  pic: string;
  birth?: any;
  location?: any;
  introduction: string;
  createTime: string;
  updateTime: string;
}

export const getSingerPage = (data?: SingerReq) => {
  return http.request<R<Data<SingerRes>>>("post", "/admin/singer/allSinger", {
    data
  });
};

export interface SelectSinger {
  link: string;
  value: string;

  artistName: string;
  createTime: string;
  sex?: any;
  alias: string;
  birth?: any;
  location?: any;
  updateTime: string;
  id: number;
  pic: string;
  introduction: string;
}

export const getSelectSingerList = (name: string) => {
  return http.request<R<SelectSinger[]>>(
    "get",
    "/admin/singer/select?name=" + name
  );
};

export const getArtistListByAlbumId = (id: number) => {
  return http.request<R<Array<SingerRes>>>(
    "get",
    "/admin/singer/getArtistByAlbumId?id=" + id
  );
};

export interface MusicList {
  id: number;
  musicName: string;
  aliasName: string;
  pic: string;
  albumId: number;
  sort: number;
  timeLength: number;
  updateTime: string;
  createTime: string;
}

export interface Album {
  id: number;
  albumName: string;
  subType: string;
  description: string;
  company?: any;
  pic: string;
  publishTime: string;
  updateTime: string;
  createTime: string;
}

export interface ArtistInfoRes {
  id: number;
  artistName: string;
  aliasName: string;
  artistNames: string[];
  sex?: any;
  pic: string;
  birth?: any;
  location?: any;
  introduction: string;
  createTime: string;
  updateTime: string;
  musicList: MusicList[];
  albumList: Album[];
}

export const getArtistInfo = (id: number) => {
  return http.request<R<ArtistInfoRes>>("get", `/admin/singer/${id}`);
};

export const deleteArtist = (id: number[]) => {
  return http.request<R<ArtistInfoRes>>(
    "delete",
    `/admin/singer/${id.join(",")}`
  );
};

export interface Artist {
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
export const saveOrUpdateArtist = (data: Artist) => {
  return http.request<R<ArtistInfoRes>>("post", "/admin/singer/", { data });
};
