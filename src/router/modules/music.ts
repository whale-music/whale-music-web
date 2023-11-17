import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/music",
  name: "AllMusic",
  component: Layout,
  redirect: "/music/allMusic",
  meta: {
    icon: "solar:music-library-2-bold-duotone",
    title: $t("list.music"),
    rank: 1
  },
  children: [
    {
      path: "/music/allMusic",
      name: "AllMusicList",
      component: () => import("@/views/music/allMusic/index.vue"),
      meta: {
        icon: "solar:music-library-2-bold-duotone",
        title: $t("list.allmusic")
      }
    },
    {
      path: "/music/allAlbum",
      name: "AllAlbumList",
      component: () => import("@/views/music/allAlbum/index.vue"),
      meta: {
        icon: "mingcute:album-line",
        title: $t("list.allAlbum")
      }
    },
    {
      path: "/music/allSinger",
      name: "AllSingerList",
      component: () => import("@/views/music/allSinger/index.vue"),
      meta: {
        icon: "solar:user-bold-duotone",
        title: $t("list.allSinger")
      }
    },
    {
      path: "/music/playlist",
      name: "AllPlayList",
      component: () => import("@/views/playlist/playlist.vue"),
      meta: {
        icon: "solar:playlist-minimalistic-2-bold-duotone",
        title: $t("list.playList")
      }
    },
    {
      path: "/music/mv",
      name: "Mv",
      component: () => import("@/views/music/mv/index.vue"),
      meta: {
        icon: "solar:videocamera-record-bold-duotone",
        title: $t("list.mv")
      }
    }
  ]
} as RouteConfigsTable;
