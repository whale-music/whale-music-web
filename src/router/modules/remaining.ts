import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: $t("menus.hslogin"),
      showLink: false,
      rank: 101
    }
  },
  {
    path: "/redirect",
    component: Layout,
    meta: {
      icon: "homeFilled",
      title: $t("menus.hshome"),
      showLink: false,
      rank: 102
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/layout/redirect.vue")
      }
    ]
  },
  // 全屏播放
  {
    path: "/musicPlay",
    name: "MusicPlay",
    component: () => import("@/views/music/musicPlay/index.vue"),
    meta: {
      title: `Music Play`,
      showLink: false,
      rank: 103
    }
  }
] as Array<RouteConfigsTable>;
