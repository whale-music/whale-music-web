import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/library",
  name: "Library",
  component: Layout,
  redirect: "/library/index",
  meta: {
    icon: "solar:music-library-2-bold-duotone",
    title: $t("list.music"),
    rank: 1
  },
  children: [
    {
      path: "/library/index",
      name: "MusicLibrary",
      component: () => import("@/views/library/library/index.vue"),
      meta: {
        icon: "solar:box-minimalistic-bold",
        title: $t("list.musicLibrary")
      }
    },
    {
      path: "/library/music",
      name: "Music",
      component: () => import("@/views/library/music/index.vue"),
      meta: {
        icon: "solar:music-library-2-bold-duotone",
        title: $t("list.allmusic")
      }
    },
    {
      path: "/library/album",
      name: "Album",
      component: () => import("@/views/library/album/index.vue"),
      meta: {
        icon: "mingcute:album-line",
        title: $t("list.allAlbum")
      }
    },
    {
      path: "/library/artist",
      name: "Artist",
      component: () => import("@/views/library/artist/index.vue"),
      meta: {
        icon: "solar:user-bold-duotone",
        title: $t("list.allSinger")
      }
    },
    {
      path: "/library/collect",
      name: "PlayList",
      component: () => import("@/views/library/collect/index.vue"),
      meta: {
        icon: "solar:playlist-minimalistic-2-bold-duotone",
        title: $t("list.playList")
      }
    },
    {
      path: "/library/history",
      name: "History",
      component: () => import("@/views/library/history/index.vue"),
      meta: {
        icon: "solar:history-bold",
        title: $t("list.history")
      }
    },
    {
      path: "/library/tags",
      name: "Tags",
      component: () => import("@/views/library/tags/index.vue"),
      meta: {
        icon: "solar:hashtag-square-bold",
        title: $t("list.tags")
      }
    },
    {
      path: "/library/mv",
      name: "Mv",
      component: () => import("@/views/library/mv/index.vue"),
      meta: {
        icon: "solar:videocamera-record-bold-duotone",
        title: $t("list.mv")
      }
    },
    {
      path: "/library/storefile",
      name: "StoreFile",
      component: () => import("@/views/library/storefile/index.vue"),
      meta: {
        icon: "solar:folder-with-files-bold",
        title: $t("list.storeFile")
      }
    }
  ]
} as RouteConfigsTable;
