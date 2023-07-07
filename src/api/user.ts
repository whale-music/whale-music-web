import { http } from "@/utils/http";
import { R } from "@/api/model/common";

export type UserResult = {
  code: string;
  message: string;
  data: {
    // 用户ID
    id: string;
    /** 用户名 */
    username: string;
    /** 当前登陆用户的角色 */
    roles: Array<string>;
    /** `token` */
    token: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expiryTime: number;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/admin/user/login", { data });
};

/** 刷新token */
export const refreshTokenApi = (data?: object) => {
  return http.request<UserResult>("post", "/admin/user/refreshToken", { data });
};

export interface UserInfoRes {
  id: number;
  username: string;
  nickname: string;
  password: string;
  avatarUrl?: any;
  backgroundUrl?: any;
  signature?: any;
  accountType?: any;
  lastLoginIp?: any;
  lastLoginTime: string;
  createTime: string;
  updateTime: string;
}
/** 刷新token */
export const getUserInfo = (id: number) => {
  return http.request<R<UserInfoRes>>("get", `/admin/user/${id}`);
};
