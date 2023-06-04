import { http } from "@/utils/http";
import { R } from "@/api/common";
import { AlbumConvert, ArtistConvert, MusicConvert } from "@/api/music";

export interface Count {
  sumCount: number;
  percent: string;
  fluctuate: boolean;
}
export const getCount = () => {
  return http.request<R<Map<string, Count>>>("get", "/admin/home/count");
};

export const getMusicTop = () => {
  return http.request<R<MusicConvert[]>>("get", "/admin/home/musicTop");
};

export const getAlbumTop = () => {
  return http.request<R<AlbumConvert[]>>("get", "/admin/home/albumTop");
};

export const getArtistTop = () => {
  return http.request<R<ArtistConvert[]>>("get", "/admin/home/artistTop");
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

export interface PluginTask {
  id: number;
  pluginId: number;
  status: number;
  userId: number;
  createTime: string;
  updateTime: string;
}

export interface PluginTaskRes extends PluginTask {
  pluginName: string;
}

export const getPluginTask = () => {
  return http.request<R<PluginTaskRes[]>>("get", "/admin/home/music/task");
};
