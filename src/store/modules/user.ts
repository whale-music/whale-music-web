import { defineStore } from "pinia";
import { store } from "@/store";
import type { userType } from "./types";
import { routerArrays } from "@/layout/types";
import { resetRouter, router } from "@/router";
import type { RefreshTokenResult, UserResult } from "@/api/user";
import { getLogin, refreshTokenApi } from "@/api/user";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { getUserData, removeToken, setToken, setUserData } from "@/utils/auth";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    // 用户名
    username: getUserData()?.username ?? "",
    // 页面级别权限
    roles: getUserData()?.roles ?? []
  }),
  actions: {
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
      setUserData(this);
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
      setUserData(this);
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin(data)
          .then(res => {
            if (res.code === "200") {
              setToken(res.data);
            }
            resolve(res);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 前端登出（不调用接口） */
    async logOut() {
      const query = { redirect: window.location.hash.substring(1) };
      this.username = "";
      this.roles = [];
      await removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      await router.push({ path: "/login", query: query });
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
