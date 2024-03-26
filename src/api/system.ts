import { http } from "@/utils/http";
import type { PageReqCommon, PageResCommon, R } from "@/api/model/common";

export interface WebRequest {
  mappingPath: string;
  fullPath: string;
  remoteHost: string;
}

export interface MethodCallDetail {
  methodParamsData: string;
  methodParamsType: string;
  methodResultParamType: string;
  methodName: string;
}

export interface Device {
  userAgentContent: string;
  mobile: boolean;
  browser: string;
  browserVersion: string;
  platform: string;
  os: string;
  osVersion: string;
  renderingEngine: string;
  renderingEngineVersion: string;
}

export interface ExceptionReport {
  exceptionMessage: string;
  exceptionStack: string;
  exceptionLineNumber: number;
  exceptionClassName: string;
}

export interface SystemLogRes {
  id: number;
  logName: string;
  requestMethod: string;
  executionTime: number;
  startTime: string;
  endTime: string;
  threadId: number;
  threadName: string;
  processId: number;
  webRequest: WebRequest;
  methodCallDetail: MethodCallDetail;
  devices: Device;
  exceptionReport: ExceptionReport;
}

export interface SystemLogReq extends PageReqCommon {
  logName: string[];
  requestMethod: string[];
  os: string[];
  remoteHost: string;
  mappingPath: string;
  methodName: string;
  success: "success" | "fail" | "all";
  executionTime: string[];
  betweenDate: string;
  order: boolean;
  orderBy: string;
}
export const getSystemLogPage = (data: SystemLogReq) => {
  return http.request<R<PageResCommon<SystemLogRes>>>(
    "post",
    `/admin/system/page/log`,
    {
      data
    }
  );
};

export const removeSystemLog = (day?: number) => {
  return http.request<R<PageResCommon<SystemLogRes>>>(
    "get",
    `/admin/system/remove/log`,
    {
      params: { day }
    }
  );
};
