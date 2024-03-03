import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import { themePreprocessorPlugin } from "@pureadmin/theme";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { resolve } from "path";
// import ElementPlus from "unplugin-element-plus/vite";
import { visualizer } from "rollup-plugin-visualizer";
import DefineOptions from "unplugin-vue-define-options/vite";
import removeConsole from "vite-plugin-remove-console";
import svgLoader from "vite-svg-loader";

import { genScssMultipleScopeVars } from "@/layout/theme";

import { cdn } from "./cdn";
// import { viteMockServe } from "vite-plugin-mock";
import { configCompressPlugin } from "./compress";
import { viteBuildInfo } from "./info";

export function getPluginsList(
  command: string,
  VITE_CDN: boolean,
  VITE_COMPRESSION: ViteCompression
) {
  // const prodMock = true;
  const lifecycle = process.env.npm_lifecycle_event;
  return [
    vue(),
    // https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
    VueI18nPlugin({
      runtimeOnly: true,
      compositionOnly: true,
      include: [resolve("locales/**")]
    }),
    // jsx、tsx语法支持
    vueJsx(),
    VITE_CDN ? cdn : null,
    configCompressPlugin(VITE_COMPRESSION),
    DefineOptions(),
    // 线上环境删除console
    removeConsole({ external: ["src/assets/iconfont/iconfont.js"] }),
    viteBuildInfo(),
    // 自定义主题
    themePreprocessorPlugin({
      scss: {
        multipleScopeVars: genScssMultipleScopeVars(),
        extract: true
      }
    }),
    // svg组件化支持
    svgLoader(),
    // ElementPlus({}),
    // mock支持
    // viteMockServe({
    //   mockPath: "mock",
    //   localEnabled: command === "serve",
    //   prodEnabled: command !== "serve" && prodMock,
    //   injectCode: `
    //       import { setupProdMockServer } from './mockProdServer';
    //       setupProdMockServer();
    //     `,
    //   logger: false
    // }),
    // 打包分析
    lifecycle === "report"
      ? visualizer({ open: true, brotliSize: true, filename: "report.html" })
      : null
  ];
}
