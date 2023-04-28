import { InputInter } from "@/api/plugin";
import { useUserStore } from "@/store/modules/user";
import { storageLocal } from "@pureadmin/utils";

/**
 *
 * @param id 插件ID
 * @param data 插件入参
 */
export const saveOrUpdateCache = (id: number, data: InputInter[]) => {
  if (data == null) return;
  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    const key = `${useUserStore.name}$${id}$${element.key}`;
    if (element.value != null && element.value !== "") {
      storageLocal().setItem(key, element.value);
    }
    data[index].value =
      element.value === "" ? storageLocal().getItem(key) : element.value;
  }
};
