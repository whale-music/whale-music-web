import { http } from "@/utils/http";
import { R, Data, MusicSearchReq } from "@/api/common";

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

export interface Artist {
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

export interface PlayListRes {
  id: number;
  musicName: string;
  aliasName: string;
  pic: string;
  albumId: number;
  sort: number;
  timeLength: number;
  updateTime: string;
  createTime: string;
  album: Album;
  artists: Artist[];
}

/** 获取全部歌曲信息 */
export const getPlayListById = (id: string, data?: MusicSearchReq) => {
  return http.request<R<Data<PlayListRes>>>("post", `/admin/playlist/${id}`, {
    data: data
  });
};
