import type { R } from "@/api/model/common";
import { http } from "@/utils/http";

export const deleteSourceMusic = (file: string) => {
  return http.request<R<string>>("get", `/admin/pic/get/temp/${file}`);
};
