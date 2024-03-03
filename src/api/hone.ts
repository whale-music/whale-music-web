import { R } from "@/api/model/common";
import { http } from "@/utils/http";

export interface Count {
  sumCount: number;
  percent: number;
  fluctuate: boolean;
  lines: number[];
}
export const getCount = () => {
  return http.request<R<Map<string, Count>>>("get", "/admin/home/count");
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

export interface UsersUploadRes {
  avatarUrl: string;
  username: string;
  musicCount: number;
  albumCount: number;
  artistCount: number;
  playlistCount: number;
}

export const getUsersUpload = () => {
  return http.request<R<UsersUploadRes[]>>("get", "/admin/home/users/upload");
};

export interface Artist {
  id: number;
  name: string;
}

export interface LastMusicRes {
  musicPic: string;
  artists: Artist[];
  musicName: string;
  musicNameAlias: string;
  musicId: number;
  createDate: string;
  playCount: number;
  numberOfFavorites: number;
  loveTheData: number;
}

export const getLastMusic = () => {
  return http.request<R<LastMusicRes[]>>("get", "/admin/home/last/music");
};
