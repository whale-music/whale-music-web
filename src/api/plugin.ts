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

export interface InputInter {
  label: string;
  key: string;
  value: string;
}

export const getPluginParams = (id: number) => {
  return http.request<R<InputInter[]>>("get", "/admin/getPluginParams", {
    params: {
      pluginId: id
    }
  });
};

export const execPluginTask = (id: number, data: InputInter[]) => {
  return http.request<R<any>>("post", "/admin/execPluginTask", {
    params: {
      pluginId: id,
      onLine: true
    },
    data: data
  });
};

export interface PluginMsgRes {
  id: number;
  pluginId: number;
  taskId: number;
  userId: number;
  msg: string;
  createTime: number;
  updateTime: number;
}

export const getPluginRuntimeMessages = (id: number) => {
  return http.request<R<PluginMsgRes[]>>(
    "get",
    "/admin/getPluginRuntimeMessages",
    {
      params: {
        runtimeId: id
      }
    }
  );
};
