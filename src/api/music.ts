import type { Artist } from "@/api/model/Artist";
import type {
  Data,
  MusicSearchReq,
  Page,
  PageResCommon,
  PicUrl,
  R
} from "@/api/model/common";
import type { Resource, SaveOrUpdateMusic } from "@/api/model/Music";
import { http } from "@/utils/http";

// 音乐搜索返回
export interface MusicSearchRes {
  publishTime: string;
  order: boolean;
  artistIds: number[];
  artistNames: string[];
  musicRawUrl: string;
  musicNameAlias: string;
  isExist: boolean;
  isLike: boolean;
  albumName: string;
  artistList: Artist[];
  album: Album;
  musicUrlList: MusicUrlList[];
  isPlaying: boolean;
  id: number;
  musicName: string;
  aliaName: string;
  pic: string;
  kLyric: string;
  lyric: string;
  albumId: number;
  sort: number;
  timeLength: number;
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
  return http.request<R<Data<MusicSearchRes>>>(
    "post",
    "/admin/playlist/music/page",
    {
      data
    }
  );
};

export interface MusicDetailInfo extends PicUrl {
  id: number;
  musicName: string;
  aliasName: string;
  musicTag: string[];
  musicGenre: string[];
  musicArtist: Artist[];
  albumArtist: Artist[];
  albumId: number;
  albumName: string;
  order: boolean;
  timeLength: number;
  publishTime: string;
  createTime: string;
}
/** 获取歌曲信息 */
export const getMusicInfo = (id: number) => {
  return http.request<R<MusicDetailInfo>>(
    "get",
    `/admin/music/musicInfo/${id}`
  );
};

export interface MusicUrlInfo extends Resource {
  rawUrl: string;
  exists: boolean;
}
// 获取歌曲地址URL
export const getMusicUrl = (musicId?: string) => {
  return http.request<R<MusicUrlInfo[]>>("get", "/admin/music/url/" + musicId);
};

// 获取歌曲lyric
export const getMusicLyric = (musicId?: string) => {
  return http.request<R<Lyric[]>>("get", `/admin/music/lyric/${musicId}`);
};

export const saveOrUpdateLyric = (
  musicId: number,
  type: string,
  lyric: string
) => {
  return http.request<R<Lyric[]>>("post", `/admin/music/lyric/${musicId}`, {
    params: {
      type: type
    },
    data: {
      lyric
    }
  });
};

export const saveOrUpdateMusic = (data: SaveOrUpdateMusic) => {
  return http.request<R<any>>("post", `/admin/music/`, {
    data: data
  });
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

export interface UploadMusicReq {
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

export interface Music {
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

export interface MusicConvert extends Artist {
  picUrl: string;
}

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

export interface Singer {
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

export interface Lyric {
  id: number;
  musicId: number;
  type: string;
  lyric: string;
  createTime: string;
  updateTime: string;
}

export interface UploadMusicRes {
  music: Music;
  album: Album;
  singer: Singer[];
  lyrics: Lyric[];
  musicUrl: Resource;
}

export const uploadMusic = (data: UploadMusicReq) => {
  return http.request<R<UploadMusicRes>>("post", "/admin/music/upload/info", {
    data
  });
};

export const deleteMusic = (musicId: number[], compel?: boolean) => {
  return http.request<R<UploadMusicRes>>("delete", `/admin/music/`, {
    params: {
      compel: compel
    },
    data: {
      ids: musicId
    }
  });
};

export interface UploadManualMusic extends Resource {
  name: string;
}

export const manualUploadMusic = (data: UploadManualMusic) => {
  return http.request<R<string>>("post", `/admin/music/manual/upload`, {
    data
  });
};

export const updateSourceMusic = (data: Resource) => {
  return http.request<R<string>>("post", "/admin/music/update/source", {
    data
  });
};

export const deleteSourceMusic = (id: number) => {
  return http.request<R<string>>("delete", `/admin/music/delete/source/${id}`);
};

export const selectResources = (md5: string) => {
  return http.request<R<[string[]]>>("get", `/admin/music/select`, {
    params: {
      md5: md5
    }
  });
};

export interface MusicMetaData {
  resourceId: number;
  picUrl: string;
  picBase64: string;
  musicName: string;
  musicAliasName: string;
  musicArtist: string;
  albumArtist: string;
  albumName: string;
  year: string;
  lyric: string;
  genre: string;
  tag: string;
}

export const syncMetaMusicFile = (data: MusicMetaData) => {
  return http.request<R<[string[]]>>("post", `/admin/music/sync/metadata`, {
    data
  });
};

export interface MusicTabsPageReq {
  name: string;
  musicName: string;
  artistName: string;
  albumName: string;
  refresh: boolean;
  isShowSource: boolean;
  pageIndex: number;
  pageNum: number;
}

export interface MusicTabsPageRes {
  id: number;
  musicName: string;
  musicNameAlias: string;
  pic: string;
  artistIds: number[];
  artistNames: string[];
  albumId: number;
  albumName: string;
  order: boolean;
  isExist: boolean;
  isLike: boolean;
  musicRawUrl: string;
  timeLength: number;
  userId: string;
  nickname: string;
  publishTime: string;
  createTime: string;
}
export const getMusicTabsPage = (data: MusicTabsPageReq) => {
  return http.request<R<PageResCommon<MusicTabsPageRes>>>(
    "post",
    `/admin/music/page`,
    {
      data
    }
  );
};
