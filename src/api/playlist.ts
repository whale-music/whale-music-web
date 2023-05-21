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

export interface PlayInfoRes {
  id: number;
  playListName: string;
  pic: string;
  type: number;
  description?: any;
  userId: number;
  sort: number;
  subscribed: boolean;
  createTime: string;
  updateTime: string;
}
/** 获取歌单信息 */
export const getPlayListInfo = (id: string) => {
  return http.request<R<PlayInfoRes>>("get", `/admin/playlist/info/${id}`);
};

/** 添加歌单 */
export const createPlayList = (name: string) => {
  return http.request<R<PlayInfoRes>>("put", `/admin/playlist/${name}`);
};

/** 修改歌单信息 */
export const updatePlayListInfo = (data: PlayInfoRes) => {
  return http.request<R<PlayInfoRes>>("post", `/admin/playlist/info`, { data });
};

/** 删除歌单 */
export const deletePlayList = (id: string[]) => {
  return http.request<R<PlayInfoRes>>(
    "delete",
    `/admin/playlist/${id.join(",")}`
  );
};

export interface UserPlayListRes extends PlayInfoRes {
  count: number;
}
/** 获取用户歌单 */
export const getUserPlayList = (userId: string) => {
  return http.request<R<UserPlayListRes[]>>(
    "get",
    `/admin/playlist/user/${userId}`
  );
};

export const tracksMusicToPlayList = (
  pid: string,
  musicIds: number[],
  flag?: boolean
) => {
  return http.request<R<UserPlayListRes[]>>("get", `/admin/playlist/tracks`, {
    params: {
      pid: pid,
      musicIds: musicIds.join(","),
      flag: flag
    }
  });
};

export interface Page {
  pageIndex: number;
  pageNum: number;
}

export interface PlayInfoReq extends PlayInfoRes, UserPlayListRes {
  page: Page;
}
/** 获取用户歌单 */
export const getPlayListPage = (data: PlayInfoReq) => {
  return http.request<R<Data<PlayInfoRes>>>("post", `/admin/playlist/page`, {
    data
  });
};

export const musicLike = (id: number, status: boolean) => {
  return http.request<R<Data<PlayInfoRes>>>(
    "get",
    `/admin/playlist/like/${status == true ? "add" : "del"}`,
    {
      params: {
        id: id
      }
    }
  );
};
