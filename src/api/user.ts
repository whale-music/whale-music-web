import { http } from "@/utils/http";
import { Data, R } from "@/api/model/common";
import { Config } from "@/api/model/User";
import {
  PageUserReq,
  PageUserRes,
  SaveOrUpdateUserReq,
  SaveOrUpdateUserRes,
  UserConverter
} from "@/api/model/User";

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

/** 登出*/
export const userLogout = () => {
  return http.request<UserResult>("get", "/admin/user/logout");
};

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
export const updateUserPassword = (
  id: number,
  username: string,
  nickname: string,
  password: string
) => {
  return http.request<R<SaveOrUpdateUserRes>>(
    "post",
    `/admin/user/update/account`,
    {
      params: {
        id: id,
        username: username,
        nickname: nickname,
        password: password
      }
    }
  );
};

// 删除用户
export const deleteUser = (id: number) => {
  return http.request<R<any>>("delete", `/admin/user/${id}`);
};

// 获取项目配置
export const getConfig = () => {
  return http.request<R<Config>>("get", "/admin/config/");
};
