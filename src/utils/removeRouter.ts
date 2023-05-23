import { usePermissionStoreHook } from "@/store/modules/permission";
import router from "@/router";
import { RouteRecordName } from "vue-router";

export const removeMenusRouter = (name: RouteRecordName) => {
  router.removeRoute(name.toString());
  const wholeMenus = usePermissionStoreHook().wholeMenus;
  for (let i = 0; i < wholeMenus.length; i++) {
    const menu = wholeMenus[i];
    for (let j = 0; j < menu.children.length; j++) {
      const element = menu.children[j];
      if (element.name === name.toString()) {
        wholeMenus[i].children.splice(j, 1);
      }
    }
  }
};
