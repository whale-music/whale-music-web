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

/** 获取所有插件 */
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

export const execPluginTask = (
  id: number,
  data: InputInter[],
  online?: boolean
) => {
  return http.request<R<any>>("post", "/admin/execPluginTask", {
    params: {
      pluginId: id,
      onLine: online == null ? true : online
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

export interface PluginTask {
  id: number;
  pluginId: number;
  status: number;
  userId: number;
  createTime: string;
  updateTime: string;
}

export const getPluginRuntimeTask = (data: PluginTask) => {
  return http.request<R<PluginTask[]>>("post", "/admin/getPluginRuntimeTask", {
    data
  });
};
