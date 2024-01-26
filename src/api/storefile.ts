import { R } from "@/api/model/common";
import { http } from "@/utils/http";
import { AutoCompleteCommon } from "@/api/model/StoreFile";

export interface Resource {
  name: string;
  path: string;
  url: string;
  size: number;
  creationTime: string;
  modificationTime: string;
  lastAccessTime: string;
  fileExtension: string;
  md5: string;
}

export interface ResourcePageRes extends Resource {
  type: string;
  status: boolean;
}

export interface StoreFileInfoReq {
  select: string;
  order: string;
  orderBy: string;
  filterType: boolean;
  filter: string[];
}

export const getStoreFileInfoList = (data: StoreFileInfoReq) => {
  return http.request<R<ResourcePageRes[]>>("post", `/admin/resource/list`, {
    data: data
  });
};

export interface FilterTermsRes {
  name: string;
  count: number;
  value: boolean;
}

export const getFilterType = (type: string) => {
  return http.request<R<FilterTermsRes[]>>("get", `/admin/resource/filter`, {
    params: {
      type: type
    }
  });
};

export interface LinkData {
  id: number;
  name: string;
  type: string;
}

export interface TbResource {
  id: number;
  musicId: number;
  rate: number;
  path: string;
  md5: string;
  level: string;
  encodeType: string;
  size: number;
  userId: number;
  createTime: string;
  updateTime: string;
}

export interface ResourceAudioInfoRes extends Resource {
  linkData: LinkData;
  dbResource: TbResource;
}

export const getAudioResourceInfo = (name: string) => {
  return http.request<R<FilterTermsRes[]>>("get", `/admin/resource/audio`, {
    params: {
      path: name
    }
  });
};

export interface ResourceVideoInfoRes extends Resource {
  linkData: LinkData;
  mvResource: TbMvPojo;
}

export interface TbMvPojo {
  id: number;
  path: string;
  md5: string;
  title: string;
  description: string;
  duration: number;
  userId: number;
  publishTime: string;
  createTime: string;
  updateTime: string;
  fileExtension: string;
}

export const getVideoResourceInfo = (name: string) => {
  return http.request<R<ResourceVideoInfoRes>>("get", `/admin/resource/video`, {
    params: {
      path: name
    }
  });
};

export interface ResourcePicInfoRes extends Resource {
  linkData: LinkData[];
  picResource: TbPicPojo;
}

export interface TbPicPojo {
  id: number;
  path: string;
  md5: string;
  count: number;
  updateTime: string;
  createTime: string;
}

export const getPicResourceInfo = (name: string) => {
  return http.request<R<ResourcePicInfoRes>>("get", `/admin/resource/pic`, {
    params: {
      path: name
    }
  });
};

export type AutocompleteMusicRes = AutoCompleteCommon;
export const getMusicAutocomplete = (name: string) => {
  return http.request<R<AutocompleteMusicRes[]>>(
    "get",
    `/admin/resource/auto/music`,
    {
      params: {
        name: name
      }
    }
  );
};

export type AutocompleteMvRes = AutoCompleteCommon;
export const getMvAutocomplete = (name: string) => {
  return http.request<R<AutocompleteMvRes[]>>(
    "get",
    `/admin/resource/auto/mv`,
    {
      params: {
        name: name
      }
    }
  );
};

export interface AutocompletePicRes extends AutoCompleteCommon {
  type: string;
}
export const getPicAutocomplete = (name: string, type: string) => {
  return http.request<R<AutocompletePicRes[]>>(
    "get",
    `/admin/resource/auto/pic`,
    {
      params: {
        name: name,
        type: type
      }
    }
  );
};

export interface LinkList {
  id: number;
  type: string;
}

export interface UpdateLinkPic {
  id: number;
  linkList: LinkList[];
}
export const updateLinkPic = (data: UpdateLinkPic) => {
  return http.request<R<any>>("post", `/admin/resource/link/pic`, {
    data
  });
};

export interface UpdateLinkAudio {
  id: number;
  musicId: number;
}

export const updateLinkAudio = (data: UpdateLinkAudio) => {
  return http.request<R<any>>("post", `/admin/resource/link/audio`, {
    data
  });
};

export interface UpdateLinkVideo {
  mvId: number;
  path: string;
}

export const updateLinkVideo = (data: UpdateLinkVideo) => {
  return http.request<R<any>>("post", `/admin/resource/link/video`, {
    data
  });
};

export interface SyncResourceReq {
  type: string;
  path: string;
}
export const syncResource = (data: SyncResourceReq) => {
  return http.request<R<any>>("post", `/admin/resource/sync/resource`, {
    data
  });
};

export interface CleanResourceReq {
  type: string;
  id: number;
  middleId: number;
  isForceDelete: boolean;
}
export const cleanResource = (data: CleanResourceReq) => {
  return http.request<R<any>>("post", `/admin/resource/clean/resource`, {
    data
  });
};
