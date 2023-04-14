import { http } from "@/utils/http";
import { R, MusicSearchReq, Page } from "@/api/common";

// 音乐搜索返回
export interface MusicSearchPageRes {
  records: MusicSearchRes[];
  total: number;
  size: number;
  current: number;
  orders: Order[];
  optimizeCountSql: boolean;
  searchCount: boolean;
  optimizeJoinOfCountSql: boolean;
  countId: string;
  maxLimit: number;
}
export interface Order {
  column: string;
  asc: boolean;
}

export interface MusicSearchRes {
  artistName: string[];
  publishTime: string;
  order: boolean;
  singerIds: number[];
  singerName: string[];
  musicRawUrl: string;
  musicNameAlias: string;
  isExist: boolean;
  albumName: string;
  singerList: SingerList[];
  album: Album;
  musicUrlList: MusicUrlList[];
  isPlaying: boolean;
  id: number;
  musicName: string;
  aliaName: string;
  pic: string;
  lyric: string;
  kLyric: string;
  albumId: number;
  sort: number;
  timeLength: number;
  updateTime: string;
  createTime: string;
}

export interface SingerList {
  id: number;
  singerName: string;
  alias: string;
  sex: string;
  pic: string;
  birth: string;
  location: string;
  introduction: string;
  createTime: string;
  updateTime: string;
}

export interface Album {
  id: number;
  albumName: string;
  description: string;
  pic: string;
  updateTime: string;
  createTime: string;
}

export interface MusicUrlList {
  id: number;
  musicId: number;
  rate: number;
  level: string;
  url: string;
  md5: string;
  encodeType: string;
  size: number;
  userId: number;
  origin: string;
  createTime: string;
  updateTime: string;
}

/** 获取全部歌曲信息 */
export const getAllMusicList = (data?: MusicSearchReq) => {
  return http.request<R<MusicSearchPageRes>>("post", "/admin/playlist/page", {
    data
  });
};

export interface MusicUrlInfo {
  id: string;
  size: number;
  level: string;
  md5: string;
  rawUrl: string;
  exists: boolean;
}
// 获取歌曲地址URL
export const getMusicUrl = (musicId?: string) => {
  return http.request<R<MusicUrlInfo[]>>("get", "/admin/music/url/" + musicId);
};

export interface Singer {
  orderBy: string;
  order: boolean;
  page: Page;
  id: number;
  singerName: string;
  alias: string;
  sex: string;
  pic: string;
  birth: string;
  location: string;
  introduction: string;
  createTime: string;
  updateTime: string;
}

export interface Album {
  singerName: string;
  orderBy: string;
  order: boolean;
  timeBy: boolean;
  beforeTime: string;
  laterTime: string;
  page: Page;
  id: number;
  albumName: string;
  aliasName: string;
  subType: string;
  description: string;
  company: string;
  pic: string;
  publishTime: string;
  updateTime: string;
  createTime: string;
}

export interface UploadMusicRes {
  id: number;
  origin: string;
  musicName: string;
  aliaName: string[];
  pic: string;
  type: string;
  singer: Singer[];
  album: Album;
  lyric: string;
  kLyric: string;
  timeLength: number;
  rate: number;
  level: string;
  size: number;
  md5: string;
  musicTemp: string;
  uploadFlag: boolean;
  userId: number;
}

export const uploadMusic = (data: UploadMusicRes) => {
  return http.request<R<MusicSearchPageRes>>("post", "/admin/playlist/page", {
    data
  });
};
