import { http } from "@/utils/http";
import type { R } from "@/api/model/common";

export interface Device {
  cacheId: string;
  id: number;
  username: string;
  nickname: string;
  accountType: number;
  status: boolean;
  lastLoginIp: string;
  generatedDate: Date;
}

export interface ActivityDeviceRes {
  adminDevices: Device[];
  nMusicDevices: Device[];
  subsonicDevices: Device[];
  webdavDevices: Device[];
}

export const getActivityDevice = () => {
  return http.request<R<ActivityDeviceRes>>(
    "get",
    "/admin/devices/server/activity"
  );
};

export const removeActivityDevice = (cacheId: string) => {
  return http.request<R<ActivityDeviceRes>>(
    "get",
    `/admin/devices/remove/${cacheId}`
  );
};
