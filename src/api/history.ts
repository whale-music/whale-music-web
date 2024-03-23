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

export const getPageHistory = (
  userId: number,
  type: number,
  current: number,
  size: number
) => {
  return http.request<R<PageResCommon<MusicHistoryRes>>>(
    "get",
    "/admin/history/page",
    {
      params: {
        userId: userId,
        type: type,
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
