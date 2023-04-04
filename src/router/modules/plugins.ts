import { $t } from "@/plugins/i18n";
import plugin from "@/assets/svg/plugin.svg?component";

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/plugin",
  name: "Plugins",
  component: Layout,
  redirect: "/plugin/allPlugins",
  meta: {
    icon: plugin,
    title: $t("menus.plugin"),
    rank: 1
  },
  children: [
    {
      path: "/plugin/allPlugins",
      name: "AllPluginList",
      component: () => import("@/views/plugin/index.vue"),
      meta: {
        icon: plugin,
        title: $t("menus.plugin")
      }
    },
    {
      path: "/plugin/addPlugin",
      name: "AddPluginList",
      component: () => import("@/views/plugin/addPlugin.vue"),
      meta: {
        icon: plugin,
        title: $t("list.addPlugin")
      }
    },
    {
      path: "/plugin/runPlugin",
      name: "RunPlugin",
      component: () => import("@/views/plugin/runPlugin.vue"),
      meta: {
        icon: plugin,
        title: $t("list.runPlugin")
      }
    }
  ]
} as RouteConfigsTable;
