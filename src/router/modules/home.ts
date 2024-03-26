import { $t } from "@/plugins/i18n";
import { home } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "Home",
  component: Layout,
  redirect: "/welcome",
  meta: {
    icon: "ep:home-filled",
    title: $t("menus.hshome"),
    rank: home
  },
  children: [
    {
      path: "/welcome",
      name: "Welcome",
      component: () => import("@/views/welcome/index.vue"),
      meta: {
        icon: "mingcute:home-3-fill",
        title: $t("menus.hshome")
      }
    },
    {
      path: "/users",
      name: "Users",
      component: () => import("@/views/welcome/users.vue"),
      meta: {
        icon: "ep:user-filled",
        title: $t("menus.userManagement"),
        auths: ["admin"],
        roles: ["admin"]
      }
    },
    {
      path: "/onlineDevices",
      name: "Devices",
      component: () => import("@/views/welcome/onlineDevices/index.vue"),
      meta: {
        icon: "solar:devices-bold",
        title: $t("menus.onlineDevices"),
        auths: ["admin"],
        roles: ["admin"]
      }
    },
    {
      path: "/systemLog",
      name: "SystemLog",
      component: () => import("@/views/welcome/systemLog/index.vue"),
      meta: {
        icon: "solar:clipboard-bold",
        title: $t("menus.systemLog"),
        auths: ["admin"],
        roles: ["admin"]
      }
    },
    {
      path: "/userManagement/:id(.*)",
      name: "UserManagement",
      component: () => import("@/views/welcome/userManagementInfo.vue"),
      meta: {
        icon: "ep:user-filled",
        title: $t("menus.userManagement"),
        showLink: false,
        auths: ["admin"],
        roles: ["admin"]
      }
    },
    {
      path: "/userInfo",
      name: "UserInfo",
      component: () => import("@/views/welcome/userInfo.vue"),
      meta: {
        icon: "ep:user-filled",
        title: $t("menus.userManagement"),
        showLink: false
      }
    }
  ]
} as RouteConfigsTable;
