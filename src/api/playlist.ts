import { http } from "@/utils/http";
import { R, Data } from "@/api/common";

export interface PlayListRes {
  id: number;
  musicName: string;
  musicNameAlias: string;
  singerIds: number[];
  singerName: string[];
  albumId: number;
  albumName: string;
  order: boolean;
  timeLength: number;
  createTime: string;
}

/** 获取全部歌曲信息 */
export const getPlayListById = (id: string) => {
  return http.request<R<Data<PlayListRes>>>("post", "/admin/playlist/" + id);
};
