import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/music",
  name: "AllMusic",
  component: Layout,
  redirect: "/music",
  meta: {
    icon: "homeFilled",
    title: $t("list.music"),
    rank: 1
  },
  children: [
    {
      path: "/allmusic",
      name: "AllMusicList",
      component: () => import("@/views/allmusic/index.vue"),
      meta: {
        title: $t("list.allmusic")
      }
    }
  ]
} as RouteConfigsTable;
