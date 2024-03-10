import { http } from "@/utils/http";
import type { PageResCommon, R } from "@/api/model/common";

export interface MusicHistoryRes {
  id: number;
  name: string;
  middleId: number;
  type: string;
  userId: number;
  userName: string;
  updateTime: string;
}

export const getPageHistory = (name: string, current: number, size: number) => {
  return http.request<R<PageResCommon<MusicHistoryRes>>>(
    "get",
    "/admin/history/page",
    {
      params: {
        name: name,
        current: current,
        size: size
      }
    }
  );
};

export const deleteHistory = (ids: number[]) => {
  return http.request<R<any>>("delete", "/admin/history/", {
    data: {
      ids: ids
    }
  });
};
