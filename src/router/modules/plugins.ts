import { $t } from "@/plugins/i18n";

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/plugin",
  name: "Plugins",
  component: Layout,
  redirect: "/plugin/allPlugins",
  meta: {
    icon: "mingcute:plugin-2-fill",
    title: $t("menus.plugin"),
    rank: 1
  },
  children: [
    {
      path: "/plugin/allPlugins",
      name: "AllPluginList",
      component: () => import("@/views/plugin/index.vue"),
      meta: {
        icon: "mingcute:plugin-2-fill",
        title: $t("menus.plugin")
      }
    },
    {
      path: "/plugin/addPlugin",
      name: "AddPluginList",
      component: () => import("@/views/plugin/addPlugin.vue"),
      meta: {
        icon: "solar:test-tube-minimalistic-bold-duotone",
        title: $t("list.addPlugin"),
        showLink: false
      }
    },
    {
      path: "/plugin/runPlugin",
      name: "RunPlugin",
      component: () => import("@/views/plugin/runPlugin.vue"),
      meta: {
        icon: "mingcute:plugin-2-fill",
        title: $t("list.runPlugin"),
        showLink: false
      }
    },
    {
      path: "/plugin/task",
      name: "Task",
      component: () => import("@/views/plugin/task.vue"),
      meta: {
        icon: "solar:calendar-mark-bold-duotone",
        title: $t("list.task")
      }
    },
    {
      path: "/plugin/taskInfo",
      name: "TaskInfo",
      component: () => import("@/views/plugin/taskInfo.vue"),
      meta: {
        icon: "solar:clapperboard-text-bold-duotone",
        title: $t("list.taskInfo"),
        showLink: false
      }
    }
  ]
} as RouteConfigsTable;
