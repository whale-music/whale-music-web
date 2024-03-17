import type { PageReqCommon, PageResCommon, R } from "@/api/model/common";
import { http } from "@/utils/http";

export interface TagsPageRes {
  id: number;
  name: string;
  tagType: string[];
  picUrl: string;
  tagContent: string[];
  genres: string[];
}

export interface PageTagsReq extends PageReqCommon {
  type: string[];
  tagIndex: string;
  filterTagContents: string[];
}

export const getPageTags = (data: PageTagsReq) => {
  return http.request<R<PageResCommon<TagsPageRes>>>(
    "post",
    `/admin/tags/page`,
    {
      data
    }
  );
};
