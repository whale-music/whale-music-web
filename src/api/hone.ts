import { http } from "@/utils/http";
import { R } from "@/api/common";
import { Album, Music } from "@/api/music";

export const getMusicCount = () => {
  return http.request<R<number>>("get", "/admin/home/music/count");
};

export const getAlbumCount = () => {
  return http.request<R<number>>("get", "/admin/home/album/count");
};

export const getArtistCount = () => {
  return http.request<R<number>>("get", "/admin/home/artist/count");
};

export const getMusicTop = () => {
  return http.request<R<Music[]>>("get", "/admin/home/musicTop");
};

export const getAlbumTop = () => {
  return http.request<R<Album[]>>("get", "/admin/home/albumTop");
};

export interface MusicStatisticsRes {
  value: number;
  name: string;
}
export const getMusicStatistics = () => {
  return http.request<R<MusicStatisticsRes[]>>(
    "get",
    "/admin/home/music/statistics"
  );
};

export interface PluginTaskRes {
  id: number;
  pluginId: number;
  status: number;
  userId: number;
  createTime: string;
  updateTime: string;
}

export const getPluginTask = () => {
  return http.request<R<PluginTaskRes[]>>("get", "/admin/home/music/task");
};
