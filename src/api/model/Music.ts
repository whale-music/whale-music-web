import type { PicUrl } from "@/api/model/common";

export interface Music {
  id: number;
  musicName: string;
  aliasName: string;
  albumId: number;
  sort: number;
  userId: number;
  timeLength: number;
  updateTime: string;
  createTime: string;
}

export interface Resource {
  id: number;
  musicId: number;
  rate: number;
  level: string;
  path: string;
  md5: string;
  encodeType: string;
  size: number;
  userId: number;
  createTime: string;
  updateTime: string;
}

export interface MusicConvert extends Music, PicUrl {}

export interface SaveOrUpdateMusic {
  id: number;
  musicName: string;
  aliasName: string;
  albumId: number;
  timeLength: number;
  musicTag?: string[];
  musicGenre: string[];
  artistIds: number[];
  resource?: Resource;
  tempPicFile?: string;
  tempMusicFile?: string;
}

export interface AudioInfoRes extends Resource {
  musicName: string;
  aliasName: string;
  originFileName: string;
  type: string;
  artists: string[];
  album: string;
  lyric: string;
  timeLength: number;
  isExist: boolean;
  musicFileTemp: string;
}

export interface MusicPlayArtist {
  id: number;
  artistName: string;
  aliasName: string;
}
export interface MusicPlayAlbum {
  id: number;
  albumName: string;
}

export interface PlayLyrics {
  id: number;
  musicId: number;
  type: string;
  lyric: string;
}

export interface MusicPlayLyrics {
  lyrics: PlayLyrics;
  kLyrics: PlayLyrics;
}

export interface MusicPlaySources {
  id: number;
  musicId: number;
  rate: number;
  level: string;
  path: string;
  md5: string;
  encodeType: string;
  size: number;
  userId: number;
  url: string;
}
export interface MusicPlayInfo {
  id: number;
  musicName: string;
  aliasName: string;
  picUrl: string;
  timeLength: number;
  userId: number;
  publishTime: Date;
  artists: MusicPlayArtist[];
  album: MusicPlayAlbum;
  lyrics: MusicPlayLyrics;
  sources: MusicPlaySources[];
}
