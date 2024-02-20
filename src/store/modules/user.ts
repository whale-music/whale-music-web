import { storageLocal } from "@pureadmin/utils";
import { defineStore } from "pinia";

import {
  getLogin,
  refreshTokenApi,
  RefreshTokenResult,
  UserResult
} from "@/api/user";
import { routerArrays } from "@/layout/types";
import { resetRouter, router } from "@/router";
import { store } from "@/store";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { type DataInfo, removeToken, sessionKey, setToken } from "@/utils/auth";

import { userType } from "./types";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    // 用户名
    username: storageLocal().getItem<DataInfo>(sessionKey)?.username ?? "",
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo>(sessionKey)?.roles ?? []
  }),
  actions: {
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin(data)
          .then(res => {
            if (res.code === "200") {
              setToken(res.data);
              resolve(res);
            } else {
              resolve(res);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 前端登出（不调用接口） */
    async logOut() {
      this.username = "";
      this.roles = [];
      await removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      await router.push("/login");
    },
    /** 刷新`token` */
    async handRefreshToken(data) {
      return new Promise<RefreshTokenResult>((resolve, reject) => {
        refreshTokenApi(data)
          .then(res => {
            if (res) {
              setToken(res.data);
              resolve(res);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
