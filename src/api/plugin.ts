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
export const getPluginList = (id?: string | string[]) => {
  return http.request<R<PluginList[]>>("get", "/admin/getAllPlugins", {
    params: {
      id: Array.isArray(id) ? id.join(",") : id
    }
  });
};

export const savePluginInfo = (plugin: PluginList) => {
  return http.request<R<PluginList>>("post", "/admin/saveOrUpdatePlugin", {
    data: plugin
  });
};

export interface Params {
  label: string;
  key: string;
  value: string;
}

export interface PluginInput {
  params: Params[];
  pluginType: string;
}

export const getCommonPluginParams = (id: number) => {
  return http.request<R<PluginInput>>("get", "/admin/getPluginParams/common", {
    params: {
      pluginId: id
    }
  });
};

export const execPluginTask = (
  id: number,
  data: Params[],
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
  level: number;
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

export const getPluginTask = (data: PluginTask) => {
  return http.request<R<PluginTask[]>>("post", "/admin/getTask", {
    data
  });
};

export const deletePluginTask = (id: number) => {
  return http.request<R<PluginTask[]>>("get", `/admin/deleteTask/${id}`);
};

export const deletePlugin = (id: number) => {
  return http.request<R<PluginTask[]>>("get", `/admin/deletePlugin/${id}`);
};
