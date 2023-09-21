import { http } from "@/utils/http";
import { R } from "@/api/model/common";

export interface PluginList {
  id: number;
  pluginName: string;
  createName: string;
  type: string;
  code: string;
  description: string;
  userId: number;
  createTime: string;
  updateTime: string;
}

/** 获取所有插件 */
export const getPluginList = (id?: string | string[], name?: string) => {
  return http.request<R<PluginList[]>>("get", "/admin/getAllPlugins", {
    params: {
      id: Array.isArray(id) ? id.join(",") : id,
      name: name
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

/**
 * 获取插件参数
 * 因为第一次获取插件时间较长所以设置超时时间 60秒
 * @param id
 */
export const getPluginParams = (id: number) => {
  return http.request<R<PluginInput>>("get", "/admin/getPluginParams", {
    timeout: 1000 * 60,
    params: {
      pluginId: id
    }
  });
};

export const getInteractiveSearch = (
  id: number,
  name: string,
  data: Params[]
) => {
  return http.request<R<Params[]>>("post", "/admin/interactive/search", {
    params: {
      pluginId: id,
      name: name
    },
    data
  });
};

export const execCommonPluginTask = (
  id: number,
  data: Params[],
  online?: boolean
) => {
  return http.request<R<any>>("post", "/admin/execPluginTask/common", {
    params: {
      pluginId: id,
      onLine: online == null ? true : online
    },
    data: data
  });
};

export interface PluginTaskLogRes {
  pluginMsg: PluginMsgRes;
  html: string;
}
export const execInteractivePluginTask = (
  pluginId: number,
  data: Params[],
  type?: string,
  id?: number
) => {
  return http.request<R<PluginTaskLogRes>>(
    "post",
    "/admin/execPluginTask/interactive",
    {
      params: {
        pluginId: pluginId,
        type: type,
        id: id
      },
      data: data
    }
  );
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
  params: string;
  createTime: string;
  updateTime: string;
}

export const getPluginTask = (data: PluginTask, type?: string) => {
  return http.request<R<PluginTask[]>>("post", "/admin/getTask", {
    params: {
      type: type
    },
    data
  });
};

export const deletePluginTask = (id: number[]) => {
  return http.request<R<PluginTask[]>>("get", `/admin/deleteTask`, {
    params: {
      id: id.join(",")
    }
  });
};

export const deletePlugin = (id: number) => {
  return http.request<R<PluginTask[]>>("get", `/admin/deletePlugin/${id}`);
};

export interface Schedule {
  id: number;
  name: string;
  pluginId: number;
  cron: string;
  params: string;
  status: boolean;
  userId: number;
  createTime: string;
  updateTime: string;
}
export const saveOrUpdateSchedule = (data: Schedule, isRun: boolean) => {
  return http.request<R<string>>("post", `/admin/schedule/task`, {
    data,
    params: {
      isRun: isRun
    }
  });
};

export interface ScheduleInfo extends Schedule {
  pluginName: string;
}
export const getScheduleList = (data: Schedule) => {
  return http.request<R<ScheduleInfo[]>>("post", `/admin/schedule/get/task`, {
    data
  });
};

export const deleteSchedule = (id: number) => {
  return http.request<R<string>>("delete", `/admin/schedule/task/${id}`);
};

export const modifyStateDynamicTask = (id: number, status: boolean) => {
  return http.request<R<string>>("get", `/admin/schedule/task/status`, {
    params: {
      id: id,
      status: status
    }
  });
};
