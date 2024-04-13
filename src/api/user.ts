import type { Data, R } from "@/api/model/common";
import type { Config } from "@/api/model/User";
import type {
  PageUserReq,
  PageUserRes,
  SaveOrUpdateUserReq,
  SaveOrUpdateUserRes,
  UserConverter
} from "@/api/model/User";
import type { DataInfo } from "@/utils/auth";
import { http } from "@/utils/http";

export type UserResult = R<DataInfo<Date>>;

export type RefreshTokenResult = R<{
  /** `token` */
  accessToken: string;
  /** 用于调用刷新`accessToken`的接口时所需的`token` */
  refreshToken: string;
  /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
  expires: Date;
}>;
export const loginUrl = "/admin/user/login";
/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", loginUrl, { data });
};

export const refreshTokenUrl = "/admin/user/refreshToken";
/** 刷新token */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", refreshTokenUrl, {
    data
  });
};

/** 登出*/
// export const userLogout = () => {
//   return http.request<UserResult>("get", "/admin/user/logout");
// };

/** 获取用户信息 */
export const getUserInfo = (id: number) => {
  return http.request<R<UserConverter>>("get", `/admin/user/${id}`);
};

export const getUserPage = (pageUserReq: PageUserReq) => {
  return http.request<R<Data<PageUserRes>>>("post", `/admin/user/page`, {
    data: pageUserReq
  });
};

// 保存或更新用户
export const saveOrUpdateUser = (data: SaveOrUpdateUserReq) => {
  return http.request<R<SaveOrUpdateUserRes>>("post", `/admin/user/`, {
    data: data
  });
};

// 更新用户密码
export const updateUserPassword = data => {
  return http.request<R<any>>("post", `/admin/user/update/account`, {
    data
  });
};

// 删除用户
export const deleteUser = (id: number) => {
  return http.request<R<any>>("delete", `/admin/user/${id}`);
};

// 获取项目配置
export const getConfig = () => {
  return http.request<R<Config>>("get", "/admin/config/");
};

export interface SelectUserRes {
  value: number;
  label: string;
}
/**
 * 获取用户数据, 用于选择用户
 */
export const getSelectUser = (username: string) => {
  return http.request<R<SelectUserRes[]>>("get", "/admin/user/select/list", {
    params: { username }
  });
};
