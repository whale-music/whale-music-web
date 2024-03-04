import type { R } from "@/api/model/common";
import { http } from "@/utils/http";

/** 获取所有插件 */
export const getEnabledPluginStatus = () => {
  return http.request<R<boolean>>("get", "/admin/config/enable/plugin");
};
