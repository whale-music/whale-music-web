import { createPinia } from "pinia";
import type { App } from "vue";
const store = createPinia();

// 添加pinia持久化
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
store.use(piniaPluginPersistedstate);

export function setupStore(app: App<Element>) {
  app.use(store);
}

export { store };
