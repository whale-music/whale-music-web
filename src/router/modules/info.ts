import { $t } from "@/plugins/i18n";

export default {
  path: "/library",
  redirect: "/library/musicInfo",
  meta: {
    icon: "informationLine",
    title: $t("menus.hsabnormal"),
    showLink: false,
    rank: 9
  },
  children: [
    {
      path: "/library/musicInfo",
      name: "MusicInfo",
      component: () => import("@/views/library/musicInfo/index.vue"),
      meta: {
        title: $t("list.allAlbum"),
        showLink: false
      }
    },
    {
      path: "/library/albumInfo",
      name: "AlbumInfo",
      component: () => import("@/views/library/albumInfo/index.vue"),
      meta: {
        title: $t("list.allAlbum"),
        showLink: false
      }
    },
    {
      path: "/library/artistInfo",
      name: "ArtistInfo",
      component: () => import("@/views/library/artistInfo/index.vue"),
      meta: {
        title: $t("list.allAlbum"),
        showLink: false
      }
    },
    {
      path: "/library/mvInfo",
      name: "MvInfo",
      component: () => import("@/views/info/mvInfo/index.vue"),
      meta: {
        title: $t("list.allAlbum"),
        showLink: false
      }
    }
  ]
} as RouteConfigsTable;
