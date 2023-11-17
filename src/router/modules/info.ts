import { $t } from "@/plugins/i18n";

export default {
  path: "/music",
  redirect: "/music/musicInfo",
  meta: {
    icon: "informationLine",
    title: $t("menus.hsabnormal"),
    showLink: false,
    rank: 9
  },
  children: [
    {
      path: "/music/musicInfo",
      name: "MusicInfo",
      component: () => import("@/views/music/musicInfo/index.vue"),
      meta: {
        title: $t("list.allAlbum"),
        showLink: false
      }
    },
    {
      path: "/music/albumInfo",
      name: "AlbumInfo",
      component: () => import("@/views/music/albumInfo/index.vue"),
      meta: {
        title: $t("list.allAlbum"),
        showLink: false
      }
    },
    {
      path: "/music/artistInfo",
      name: "ArtistInfo",
      component: () => import("@/views/music/artistInfo/index.vue"),
      meta: {
        title: $t("list.allAlbum"),
        showLink: false
      }
    },
    {
      path: "/music/mvInfo",
      name: "MvInfo",
      component: () => import("@/views/info/mvInfo/index.vue"),
      meta: {
        title: $t("list.allAlbum"),
        showLink: false
      }
    }
  ]
} as RouteConfigsTable;
