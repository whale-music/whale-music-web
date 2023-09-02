import { http } from "@/utils/http";
import { R } from "@/api/model/common";

/** 获取所有插件 */
export const getEnabledPluginStatus = () => {
  return http.request<R<boolean>>("get", "/admin/config/enable/plugin");
};
