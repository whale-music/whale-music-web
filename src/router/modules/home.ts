import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "Home",
  component: Layout,
  redirect: "/welcome",
  meta: {
    icon: "homeFilled",
    title: $t("menus.hshome"),
    rank: 0
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
      name: "userManagement",
      component: () => import("@/views/welcome/users.vue"),
      meta: {
        icon: "ep:user-filled",
        title: $t("menus.userManagement"),
        auths: ["admin"],
        roles: ["admin"]
      }
    },
    {
      path: "/userManagement/:id(.*)",
      name: "userInfo",
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
      name: "userInfo",
      component: () => import("@/views/welcome/userInfo.vue"),
      meta: {
        icon: "ep:user-filled",
        title: $t("menus.userManagement"),
        showLink: false
      }
    }
  ]
} as RouteConfigsTable;
