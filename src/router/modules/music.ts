import { $t } from "@/plugins/i18n";
import music from "@/assets/svg/music.svg?component";
import album from "@/assets/svg/album.svg?component";
import singer from "@/assets/svg/singer.svg?component";
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
        icon: music,
        title: $t("list.allmusic")
      }
    },
    {
      path: "/music/allAlbum",
      name: "AllAlbumList",
      component: () => import("@/views/music/allAlbum/index.vue"),
      meta: {
        icon: album,
        title: $t("list.allAlbum")
      }
    },
    {
      path: "/music/allSinger",
      name: "AllSingerList",
      component: () => import("@/views/music/allSinger/index.vue"),
      meta: {
        icon: singer,
        title: $t("list.allSinger")
      }
    }
  ]
} as RouteConfigsTable;
