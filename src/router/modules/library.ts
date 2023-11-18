import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/library",
  name: "Library",
  component: Layout,
  redirect: "/library/music",
  meta: {
    icon: "solar:music-library-2-bold-duotone",
    title: $t("list.music"),
    rank: 1
  },
  children: [
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
      path: "/library/playlist",
      name: "PlayList",
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
