import { http } from "@/utils/http";
import { R } from "@/api/common";

export interface PluginList {
  id: number;
  pluginName: string;
  createName: string;
  code: string;
  description: string;
  userId: number;
  createTime: string;
  updateTime: string;
}

/** 获取全部歌曲信息 */
export const getPluginList = (id?: string) => {
  return http.request<R<PluginList[]>>("get", "/admin/getAllPlugins", {
    params: {
      id: id
    }
  });
};

export const savePluginInfo = (plugin: PluginList) => {
  return http.request<R<PluginList>>("post", "/admin/saveOrUpdatePlugin", {
    data: plugin
  });
};
