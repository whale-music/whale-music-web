// import Table from "@pureadmin/table";
// import PureDescriptions from "@pureadmin/descriptions";
// 引入重置样式
import "./style/reset.scss";
// 导入公共样式
import "./style/index.scss";
// 一定要在main.ts中导入tailwind.css，防止vite每次hmr都会请求src/style/index.scss整体css文件导致热更新慢的问题
import "./style/tailwind.css";
import "element-plus/dist/index.css";
// 导入字体图标
import "./assets/iconfont/iconfont.js";
import "./assets/iconfont/iconfont.css";
// 自定义element 样式
import "./style/element/index.scss";

import { MotionPlugin } from "@vueuse/motion";
import ElementPlus from "element-plus";
import { createApp, Directive } from "vue";

import { useEcharts } from "@/plugins/echarts";
import { useI18n } from "@/plugins/i18n";
import { setupStore } from "@/store";
import { injectResponsiveStorage } from "@/utils/responsive";

import App from "./App.vue";
import { getServerConfig } from "./config";
import router from "./router";

const app = createApp(App);

// 自定义指令
import * as directives from "@/directives";
Object.keys(directives).forEach(key => {
  app.directive(key, (directives as { [key: string]: Directive })[key]);
});

// 全局注册`@iconify/vue`图标库
import {
  FontIcon,
  IconifyIconOffline,
  IconifyIconOnline
} from "./components/ReIcon";
app.component("IconifyIconOffline", IconifyIconOffline);
app.component("IconifyIconOnline", IconifyIconOnline);
app.component("FontIcon", FontIcon);

// 全局注册按钮级别权限组件
import { Auth } from "@/components/ReAuth";
app.component("Auth", Auth);

import "@imengyu/vue3-context-menu/lib/vue3-context-menu.css";

import ContextMenu from "@imengyu/vue3-context-menu";

getServerConfig(app).then(async config => {
  injectResponsiveStorage(app, config);
  setupStore(app);
  app.use(MotionPlugin);
  app.use(useI18n);
  app.use(ContextMenu);
  app.use(useEcharts);
  // .use(Table);
  // .use(PureDescriptions);
  app.use(ElementPlus);
  app.use(router);
  await router.isReady();
  app.mount("#app");
});
