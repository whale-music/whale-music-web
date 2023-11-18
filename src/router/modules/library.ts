import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/library",
  name: "AllMusic",
  component: Layout,
  redirect: "/library/allMusic",
  meta: {
    icon: "solar:music-library-2-bold-duotone",
    title: $t("list.music"),
    rank: 1
  },
  children: [
    {
      path: "/library/allMusic",
      name: "AllMusicList",
      component: () => import("@/views/library/allMusic/index.vue"),
      meta: {
        icon: "solar:music-library-2-bold-duotone",
        title: $t("list.allmusic")
      }
    },
    {
      path: "/library/allAlbum",
      name: "AllAlbumList",
      component: () => import("@/views/library/allAlbum/index.vue"),
      meta: {
        icon: "mingcute:album-line",
        title: $t("list.allAlbum")
      }
    },
    {
      path: "/library/allSinger",
      name: "AllSingerList",
      component: () => import("@/views/library/allSinger/index.vue"),
      meta: {
        icon: "solar:user-bold-duotone",
        title: $t("list.allSinger")
      }
    },
    {
      path: "/library/playlist",
      name: "AllPlayList",
      component: () => import("@/views/playlist/playlist.vue"),
      meta: {
        icon: "solar:playlist-minimalistic-2-bold-duotone",
        title: $t("list.playList")
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
    }
  ]
} as RouteConfigsTable;
